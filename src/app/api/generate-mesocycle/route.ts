import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DAYS_OF_WEEK, type Athlete, type Evaluation, type Exercise } from "@/lib/types";
import { generateInitialMesocyclePlan, generateNextMesocyclePlan, MesocycleGenerationError } from "@/lib/ai/generateMesocycle";
import type { AiMesocyclePlan } from "@/lib/ai/mesocycleSchema";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

async function failRun(admin: SupabaseAdmin, runId: string, message: string) {
  await admin
    .from("ai_generation_runs")
    .update({ status: "failed", error_message: message, completed_at: new Date().toISOString() })
    .eq("id", runId);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function writePlanToMesocycle(admin: SupabaseAdmin, params: {
  athleteId: string;
  plan: AiMesocyclePlan;
  runId: string;
}) {
  const { athleteId, plan, runId } = params;
  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = addDays(startDate, 27);

  const { data: mesocycle, error: mesoError } = await admin
    .from("mesocycles")
    .insert({
      athlete_id: athleteId,
      name: plan.name,
      phase: plan.phase,
      status: "Planificado",
      start_date: startDate,
      end_date: endDate,
      is_ai_generated: true,
      generation_run_id: runId,
    })
    .select("id")
    .single();
  if (mesoError || !mesocycle) {
    throw new MesocycleGenerationError(mesoError?.message ?? "No se pudo crear el mesociclo.");
  }

  const weekIds = plan.weeks.map(() => randomUUID());
  const weekRows = plan.weeks.map((w, i) => ({
    id: weekIds[i],
    mesocycle_id: mesocycle.id,
    week_number: w.week_number,
    load_type: w.load_type,
    focus: w.focus,
    distribution: w.distribution,
  }));
  const { error: weeksError } = await admin.from("weeks").insert(weekRows);
  if (weeksError) throw new MesocycleGenerationError(weeksError.message);

  const dayRows: Record<string, unknown>[] = [];
  const dayIdsByWeekIdx: string[][] = [];
  plan.weeks.forEach((w, wi) => {
    const ids: string[] = [];
    w.days.forEach((d) => {
      const id = randomUUID();
      ids.push(id);
      dayRows.push({
        id,
        week_id: weekIds[wi],
        day_of_week: d.day_of_week,
        day_focus: d.day_focus,
        is_rest: d.is_rest,
        position: DAYS_OF_WEEK.indexOf(d.day_of_week),
      });
    });
    dayIdsByWeekIdx.push(ids);
  });
  const { error: daysError } = await admin.from("days").insert(dayRows);
  if (daysError) throw new MesocycleGenerationError(daysError.message);

  const blockRows: Record<string, unknown>[] = [];
  plan.weeks.forEach((w, wi) => {
    w.days.forEach((d, di) => {
      const dayId = dayIdsByWeekIdx[wi][di];
      d.blocks.forEach((b, pos) => {
        blockRows.push({
          id: randomUUID(),
          day_id: dayId,
          exercise_id: null,
          exercise_name_freetext: b.exercise_name,
          category: b.category,
          rpe_target: b.rpe_target,
          sets: b.sets,
          reps_or_time: b.reps_or_time,
          time: b.time,
          load: b.load,
          rest: b.rest,
          kinesio_notes: b.non_catalog_reason ? `${b.kinesio_notes ?? ""}${b.kinesio_notes ? " " : ""}(Fuera de catalogo: ${b.non_catalog_reason})`.trim() : b.kinesio_notes,
          position: pos,
        });
      });
    });
  });
  if (blockRows.length) {
    const { error: blocksError } = await admin.from("blocks").insert(blockRows);
    if (blocksError) throw new MesocycleGenerationError(blocksError.message);
  }

  return mesocycle.id as string;
}

async function buildHistorySummaries(admin: SupabaseAdmin, athleteId: string) {
  const { data: mesocycles } = await admin
    .from("mesocycles")
    .select("id, name, phase, status, start_date, end_date, weeks(week_number, days(day_of_week, is_rest, blocks(exercise_name_freetext, completed, actual_rpe, pain_during, comment)))")
    .eq("athlete_id", athleteId)
    .order("start_date", { ascending: true });

  const pastMesocyclesSummary =
    (mesocycles ?? [])
      .map((m) => {
        type BlockRow = { completed: boolean; actual_rpe: string | null; pain_during: number | null };
        type DayRow = { blocks: BlockRow[] };
        type WeekRow = { week_number: number; days: DayRow[] };
        const weeks = (m.weeks ?? []) as WeekRow[];
        const allBlocks = weeks.flatMap((w) => w.days.flatMap((d) => d.blocks));
        const total = allBlocks.length;
        const completed = allBlocks.filter((b) => b.completed).length;
        const rpes = allBlocks.map((b) => Number(b.actual_rpe)).filter((n) => !Number.isNaN(n));
        const avgRpe = rpes.length ? (rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1) : "-";
        const painEvents = allBlocks.filter((b) => (b.pain_during ?? 0) >= 5).length;
        return `- ${m.name} (${m.phase ?? "-"}, ${m.status}): adherencia ${total ? Math.round((completed / total) * 100) : 0}% (${completed}/${total} bloques), RPE real promedio ${avgRpe}, ${painEvents} bloques con dolor >=5.`;
      })
      .join("\n") || "Sin mesociclos previos.";

  const { data: checkins } = await admin
    .from("checkins")
    .select("checkin_date, sleep_quality, motivation, adherence_pct, pain_by_zone, comment")
    .eq("athlete_id", athleteId)
    .order("checkin_date", { ascending: true });

  const allCheckinsSummary =
    (checkins ?? [])
      .map((c) => {
        const pain = Object.entries((c.pain_by_zone as Record<string, number>) ?? {})
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${k}:${v}`)
          .join(",");
        return `- ${c.checkin_date}: sueno ${c.sleep_quality}, motivacion ${c.motivation}, adherencia ${c.adherence_pct}%${pain ? `, dolor ${pain}` : ""}${c.comment ? `, "${c.comment}"` : ""}`;
      })
      .join("\n") || "Sin check-ins registrados.";

  return { pastMesocyclesSummary, allCheckinsSummary };
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
  const mode = body?.mode === "next" ? "next" : "initial";

  if (!athleteId) {
    return NextResponse.json({ error: "Falta athleteId." }, { status: 400 });
  }

  const isSelf = callerProfile.athlete_id === athleteId;
  const isAdmin = callerProfile.role === "admin";
  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: "No autorizado para generar el plan de este atleta." }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: athlete } = await admin.from("athletes").select("*").eq("id", athleteId).single();
  if (!athlete) {
    return NextResponse.json({ error: "Atleta no encontrado." }, { status: 404 });
  }

  const { data: evaluations } = await admin
    .from("evaluations")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("eval_date", { ascending: false });
  const latestEvaluation = (evaluations?.[0] as Evaluation | undefined) ?? null;

  if (mode === "initial") {
    const { count: mesoCount } = await admin
      .from("mesocycles")
      .select("id", { count: "exact", head: true })
      .eq("athlete_id", athleteId);
    if ((mesoCount ?? 0) > 0) {
      return NextResponse.json({ skipped: true, reason: "already_has_mesocycle" });
    }
    if (!latestEvaluation) {
      return NextResponse.json({ error: "El atleta todavia no tiene ninguna evaluacion." }, { status: 400 });
    }
  }

  const { data: exercises } = await admin.from("exercises").select("*");
  if (!exercises || exercises.length === 0) {
    return NextResponse.json({ error: "El catalogo de ejercicios esta vacio." }, { status: 500 });
  }

  const { data: run, error: runError } = await admin
    .from("ai_generation_runs")
    .insert({
      athlete_id: athleteId,
      trigger_type: mode === "initial" ? "initial" : "manual_next",
      trigger_ref_id: mode === "initial" ? latestEvaluation!.id : null,
      status: "running",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (runError || !run) {
    if (runError?.code === "23505") {
      return NextResponse.json({ error: "Ya hay una generacion en curso para este atleta." }, { status: 409 });
    }
    return NextResponse.json({ error: runError?.message ?? "No se pudo iniciar la generacion." }, { status: 500 });
  }

  try {
    let generated: { result: AiMesocyclePlan; model: string };
    if (mode === "initial") {
      generated = await generateInitialMesocyclePlan(athlete as Athlete, latestEvaluation!, exercises as Exercise[]);
    } else {
      const { pastMesocyclesSummary, allCheckinsSummary } = await buildHistorySummaries(admin, athleteId);
      generated = await generateNextMesocyclePlan(
        athlete as Athlete,
        latestEvaluation,
        pastMesocyclesSummary,
        allCheckinsSummary,
        exercises as Exercise[],
      );
    }

    const mesocycleId = await writePlanToMesocycle(admin, { athleteId, plan: generated.result, runId: run.id });

    await admin
      .from("ai_generation_runs")
      .update({
        status: "succeeded",
        mesocycle_id: mesocycleId,
        model: generated.model,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    return NextResponse.json({ mesocycleId, weeksCreated: generated.result.weeks.length });
  } catch (err) {
    const message = err instanceof MesocycleGenerationError ? err.message : err instanceof Error ? err.message : "Error inesperado generando el plan.";
    await failRun(admin, run.id, message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
