import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Athlete, CheckIn, Exercise } from "@/lib/types";
import { adjustMesocyclePlan, MesocycleGenerationError } from "@/lib/ai/adjustMesocycle";
import type { AiAdjustmentPlan } from "@/lib/ai/mesocycleSchema";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

type BlockRow = {
  id: string;
  position: number;
  manually_edited: boolean;
  exercise_name_freetext: string | null;
  category: string | null;
  sets: string | null;
  reps_or_time: string | null;
  rpe_target: string | null;
  load: string | null;
  rest: string | null;
  kinesio_notes: string | null;
  actual_sets: string | null;
  actual_reps_or_time: string | null;
  actual_load: string | null;
  actual_rpe: string | null;
  pain_during: number | null;
  comment: string | null;
  completed: boolean;
};
type DayRow = {
  id: string;
  day_of_week: string;
  is_rest: boolean;
  day_focus: string | null;
  blocks: BlockRow[];
};
type WeekRow = {
  id: string;
  week_number: number;
  load_type: string | null;
  focus: string | null;
  distribution: string | null;
  days: DayRow[];
};

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

async function failRun(admin: SupabaseAdmin, runId: string, message: string) {
  await admin
    .from("ai_generation_runs")
    .update({ status: "failed", error_message: message, completed_at: new Date().toISOString() })
    .eq("id", runId);
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data: callerProfile } = await supabase.from("profiles").select("role, athlete_id").eq("id", user.id).single();
  if (!callerProfile) {
    return NextResponse.json({ error: "Perfil no encontrado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const athleteId = typeof body?.athleteId === "string" ? body.athleteId : "";
  const checkinId = typeof body?.checkinId === "string" ? body.checkinId : "";
  if (!athleteId || !checkinId) {
    return NextResponse.json({ error: "Falta athleteId o checkinId." }, { status: 400 });
  }

  const isSelf = callerProfile.athlete_id === athleteId;
  const isAdmin = callerProfile.role === "admin";
  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const admin = createAdminClient();

  // Idempotencia: si este check-in ya disparó un ajuste exitoso, no repetir.
  const { data: existingRun } = await admin
    .from("ai_generation_runs")
    .select("id")
    .eq("trigger_ref_id", checkinId)
    .eq("trigger_type", "checkin_adjustment")
    .eq("status", "succeeded")
    .limit(1);
  if (existingRun && existingRun.length > 0) {
    return NextResponse.json({ adjusted: false, reason: "already_adjusted" });
  }

  const { data: checkin } = await admin.from("checkins").select("*").eq("id", checkinId).single<CheckIn>();
  if (!checkin) {
    return NextResponse.json({ error: "Check-in no encontrado." }, { status: 404 });
  }
  if (!checkin.week_id) {
    return NextResponse.json({ adjusted: false, reason: "no_active_week" });
  }

  const { data: weekRow } = await admin.from("weeks").select("id, mesocycle_id").eq("id", checkin.week_id).single();
  if (!weekRow) {
    return NextResponse.json({ adjusted: false, reason: "no_active_week" });
  }

  const { data: mesocycle } = await admin.from("mesocycles").select("*").eq("id", weekRow.mesocycle_id).single();
  if (!mesocycle || mesocycle.status === "Completado") {
    return NextResponse.json({ adjusted: false, reason: "mesocycle_not_active" });
  }

  const { data: athlete } = await admin.from("athletes").select("*").eq("id", athleteId).single<Athlete>();
  if (!athlete) {
    return NextResponse.json({ error: "Atleta no encontrado." }, { status: 404 });
  }

  const { data: weeksData } = await admin
    .from("weeks")
    .select(
      "id, week_number, load_type, focus, distribution, days(id, day_of_week, is_rest, day_focus, blocks(id, position, manually_edited, exercise_name_freetext, category, sets, reps_or_time, rpe_target, load, rest, kinesio_notes, actual_sets, actual_reps_or_time, actual_load, actual_rpe, pain_during, comment, completed))",
    )
    .eq("mesocycle_id", mesocycle.id)
    .order("week_number");
  const weeks = (weeksData ?? []) as unknown as WeekRow[];

  const finishedWeek = weeks.find((w) => w.id === checkin.week_id) ?? null;
  const today = new Date();
  const futureWeeks = mesocycle.start_date
    ? weeks.filter((w) => addDays(mesocycle.start_date!, (w.week_number - 1) * 7) > today)
    : [];

  if (futureWeeks.length === 0) {
    return NextResponse.json({ adjusted: false, reason: "no_future_weeks" });
  }

  const { data: exercises } = await admin.from("exercises").select("*");
  if (!exercises || exercises.length === 0) {
    return NextResponse.json({ error: "El catálogo de ejercicios está vacío." }, { status: 500 });
  }

  const { data: recentCheckinsData } = await admin
    .from("checkins")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("checkin_date", { ascending: false })
    .limit(4);

  const { data: run, error: runError } = await admin
    .from("ai_generation_runs")
    .insert({
      athlete_id: athleteId,
      mesocycle_id: mesocycle.id,
      trigger_type: "checkin_adjustment",
      trigger_ref_id: checkinId,
      status: "running",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (runError || !run) {
    if (runError?.code === "23505") {
      return NextResponse.json({ error: "Ya hay una generación en curso para este atleta." }, { status: 409 });
    }
    return NextResponse.json({ error: runError?.message ?? "No se pudo iniciar el ajuste." }, { status: 500 });
  }

  try {
    const finishedWeekBlocks = (finishedWeek?.days ?? []).flatMap((d) =>
      d.blocks.map((b) => ({
        day_of_week: d.day_of_week,
        exercise_name_freetext: b.exercise_name_freetext,
        sets: b.sets,
        reps_or_time: b.reps_or_time,
        actual_sets: b.actual_sets,
        actual_reps_or_time: b.actual_reps_or_time,
        actual_load: b.actual_load,
        actual_rpe: b.actual_rpe,
        pain_during: b.pain_during,
        comment: b.comment,
        completed: b.completed,
      })),
    );

    const futureWeeksState = futureWeeks.map((w) => ({
      week_number: w.week_number,
      load_type: w.load_type,
      focus: w.focus,
      distribution: w.distribution,
      days: w.days.map((d) => ({
        day_of_week: d.day_of_week,
        day_focus: d.day_focus,
        is_rest: d.is_rest,
        blocks: d.blocks.map((b) => ({
          exercise_name_freetext: b.exercise_name_freetext,
          category: b.category,
          sets: b.sets,
          reps_or_time: b.reps_or_time,
          rpe_target: b.rpe_target,
          load: b.load,
          rest: b.rest,
          kinesio_notes: b.kinesio_notes,
          manually_edited: b.manually_edited,
        })),
      })),
    }));

    const generated = await adjustMesocyclePlan({
      athlete,
      mesocycleName: mesocycle.name,
      checkin,
      recentCheckins: (recentCheckinsData as CheckIn[]) ?? [],
      finishedWeekBlocks,
      futureWeeks: futureWeeksState,
      exercises: exercises as Exercise[],
    });

    await writeAdjustment(admin, weeks, generated.result);

    await admin
      .from("ai_generation_runs")
      .update({ status: "succeeded", model: generated.model, completed_at: new Date().toISOString() })
      .eq("id", run.id);

    return NextResponse.json({ adjusted: true, weeksAdjusted: generated.result.weeks.map((w) => w.week_number) });
  } catch (err) {
    const message = err instanceof MesocycleGenerationError ? err.message : err instanceof Error ? err.message : "Error inesperado ajustando el plan.";
    await failRun(admin, run.id, message);
    // El check-in ya se guardó antes de llegar acá -- una falla en el ajuste
    // no debe verse como un error para quien llamó a esta ruta en background.
    return NextResponse.json({ adjusted: false, reason: "generation_failed" });
  }
}

async function writeAdjustment(admin: SupabaseAdmin, currentWeeks: WeekRow[], plan: AiAdjustmentPlan) {
  for (const week of plan.weeks) {
    const weekRow = currentWeeks.find((w) => w.week_number === week.week_number);
    if (!weekRow) continue;

    await admin
      .from("weeks")
      .update({ load_type: week.load_type, focus: week.focus, distribution: week.distribution })
      .eq("id", weekRow.id);

    for (const day of week.days) {
      const dayRow = weekRow.days.find((d) => d.day_of_week === day.day_of_week);
      if (!dayRow) continue;

      // Re-fetch en el momento de escribir: si el atleta editó algo mientras
      // corría la llamada a Claude, este es el estado que manda.
      const { data: freshBlocks } = await admin
        .from("blocks")
        .select("id, position, manually_edited")
        .eq("day_id", dayRow.id);
      const blocks = (freshBlocks ?? []) as { id: string; position: number; manually_edited: boolean }[];
      const kept = blocks.filter((b) => b.manually_edited);
      const toDelete = blocks.filter((b) => !b.manually_edited).map((b) => b.id);

      if (toDelete.length) {
        await admin.from("blocks").delete().in("id", toDelete);
      }

      if (kept.length === 0) {
        await admin.from("days").update({ is_rest: day.is_rest, day_focus: day.day_focus }).eq("id", dayRow.id);
      }

      if (day.blocks.length) {
        const basePosition = kept.length ? Math.max(...kept.map((b) => b.position)) + 1 : 0;
        const newBlockRows = day.blocks.map((b, idx) => ({
          id: randomUUID(),
          day_id: dayRow.id,
          exercise_id: null,
          exercise_name_freetext: b.exercise_name,
          category: b.category,
          rpe_target: b.rpe_target,
          sets: b.sets,
          reps_or_time: b.reps_or_time,
          time: b.time,
          load: b.load,
          rest: b.rest,
          kinesio_notes: b.non_catalog_reason
            ? `${b.kinesio_notes ?? ""}${b.kinesio_notes ? " " : ""}(Fuera de catálogo: ${b.non_catalog_reason})`.trim()
            : b.kinesio_notes,
          position: basePosition + idx,
        }));
        await admin.from("blocks").insert(newBlockRows);
      }
    }
  }
}
