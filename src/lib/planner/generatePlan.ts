// Orquestador del pipeline: produce exactamente el mismo AiMesocyclePlan que
// hoy produce Claude, para reutilizar writePlanToMesocycle() y la validación
// existente sin tocar nada. Determinista: mismo input ⇒ mismo plan. Igual que
// los planes reales de referencia, los mismos ejercicios se repiten las 4
// semanas con prescripción progresiva (RPE/series según microciclo).
import type { Athlete, Evaluation, Exercise } from "@/lib/types";
import type { AiBlock, AiDay, AiMesocyclePlan, AiWeek } from "@/lib/ai/mesocycleSchema";
import { deriveProfile } from "./profile";
import { buildSkeleton, phaseForMesocycle } from "./skeleton";
import { DAY_TEMPLATES } from "./knowledge/dayTemplates";
import { BASELINE_TESTS } from "./knowledge/baselineTests";
import { MICROCYCLE_TEMPLATE } from "./knowledge/microcycles";
import {
  ANTAGONIST_TAGS,
  buildCandidates,
  candidatesForSlot,
  pickForSlot,
  zoneActions,
  type CandidateExercise,
} from "./selection";
import { prescribeBlock } from "./prescription";
import type { PainZoneGroup, PlannerProfile } from "./types";

export class RulesPlannerError extends Error {}

/** Selección fija de ejercicios por día de la semana (se repite las 4 semanas). */
function selectWeekExercises(
  skeletonDays: { dayOfWeek: string; focus: string | null }[],
  candidates: CandidateExercise[],
  profile: PlannerProfile,
  rotation: number,
) {
  const { excluded, reduced } = zoneActions(profile);
  const usedThisWeek = new Set<string>();
  const byDay = new Map<string, CandidateExercise[]>();

  const CLIMBING_CATEGORIES = ["Aerobic Base", "Power Endurance", "Strength and Power", "Fingerboard"];

  for (const day of skeletonDays) {
    if (!day.focus) continue;
    const template = DAY_TEMPLATES[day.focus as keyof typeof DAY_TEMPLATES];
    const picked: CandidateExercise[] = [];
    for (const slot of template.slots) {
      let ranked = candidatesForSlot(candidates, slot, profile, excluded);
      // Fallback: si un slot de escalada queda vacío (ej. lesión que excluye
      // board/dedos), se baja a escalada aeróbica suave en vez de dejar el
      // día sin escalada — criterio de los planes de referencia en rehab.
      if (ranked.length === 0 && CLIMBING_CATEGORIES.includes(slot.category) && slot.category !== "Aerobic Base") {
        ranked = candidatesForSlot(candidates, { ...slot, category: "Aerobic Base", requireTags: undefined }, profile, excluded);
      }
      picked.push(...pickForSlot(ranked, slot.count, rotation, usedThisWeek));
    }
    byDay.set(day.dayOfWeek, picked);
  }

  return { byDay, excluded, reduced };
}

function baselineBlocks(
  profile: PlannerProfile,
  candidates: CandidateExercise[],
  excluded: Set<PainZoneGroup>,
): AiBlock[] {
  const blocks: AiBlock[] = [];
  const byCode = new Map(candidates.map((c) => [c.exercise.code, c.exercise]));
  // Los tests de dedos (MVC/Critical Force) cargan al máximo: no se programan
  // si hay dolor/lesión de dedos que excluye la zona.
  const fingerTestsBlocked = excluded.has("fingers");
  for (const spec of BASELINE_TESTS) {
    if (!profile.missingBaselines.includes(spec.need)) continue;
    if (fingerTestsBlocked && (spec.need === "finger_max" || spec.need === "critical_force")) continue;
    if (spec.nonCatalog && spec.nonCatalog.requires.every((eq) => profile.equipment.has(eq))) {
      blocks.push({
        exercise_name: spec.nonCatalog.name,
        is_catalog_exercise: false,
        non_catalog_reason: spec.nonCatalog.reason,
        category: "Otro",
        rpe_target: null,
        sets: spec.sets,
        reps_or_time: spec.repsOrTime,
        time: null,
        load: null,
        rest: spec.rest,
        kinesio_notes: spec.note,
      });
      continue;
    }
    const ex = spec.catalogCode ? byCode.get(spec.catalogCode) : undefined;
    if (
      ex &&
      (spec.catalogRequires ?? []).every((eq) => profile.equipment.has(eq))
    ) {
      blocks.push({
        exercise_name: ex.name,
        is_catalog_exercise: true,
        non_catalog_reason: null,
        category: ex.category as AiBlock["category"],
        rpe_target: null,
        sets: spec.sets,
        reps_or_time: spec.repsOrTime,
        time: null,
        load: null,
        rest: spec.rest,
        kinesio_notes: spec.note,
      });
    }
  }
  return blocks;
}

/** Garantía estructural: al menos 1 antagonista y 1 core por semana (regla 5). */
function ensureWeeklyGuarantees(
  week: AiWeek,
  candidates: CandidateExercise[],
  profile: PlannerProfile,
  micro: (typeof MICROCYCLE_TEMPLATE)[number],
  reduced: ReturnType<typeof zoneActions>["reduced"],
  excluded: ReturnType<typeof zoneActions>["excluded"],
) {
  const metaByName = new Map(candidates.map((c) => [c.exercise.name, c.meta]));
  const allBlocks = week.days.flatMap((d) => d.blocks);
  const hasTag = (tags: string[]) =>
    allBlocks.some((b) => {
      const meta = metaByName.get(b.exercise_name);
      return meta && tags.some((t) => meta.tags.includes(t as never));
    });
  const hasCategory = (category: string) => allBlocks.some((b) => b.category === category);

  const lastTrainingDay = [...week.days].reverse().find((d) => !d.is_rest);
  if (!lastTrainingDay) return;

  const CLIMBING_CATEGORIES = ["Aerobic Base", "Power Endurance", "Strength and Power", "Fingerboard"];

  const inject = (slot: { category: Parameters<typeof candidatesForSlot>[1]["category"]; requireTags?: string[]; preferTags?: string[] }, label: string) => {
    const ranked = candidatesForSlot(
      candidates,
      { category: slot.category, count: 1, requireTags: slot.requireTags as never, preferTags: slot.preferTags as never },
      profile,
      excluded,
    );
    if (ranked.length === 0) return;
    const pick = ranked[0];
    const block = prescribeBlock({ exercise: pick.exercise, meta: pick.meta, profile, micro, reduced, excluded });
    // Conditioning siempre va antes de la rutina de escalada, nunca después:
    // un bloque de Conditioning se inserta antes del primer bloque de
    // escalada del día en vez de al final; un bloque de escalada se agrega
    // al final (después de cualquier Conditioning ya presente).
    if (slot.category === "Conditioning") {
      const climbingIdx = lastTrainingDay.blocks.findIndex((b) => CLIMBING_CATEGORIES.includes(b.category));
      if (climbingIdx >= 0) lastTrainingDay.blocks.splice(climbingIdx, 0, block);
      else lastTrainingDay.blocks.push(block);
    } else {
      lastTrainingDay.blocks.push(block);
    }
    if (lastTrainingDay.day_focus && !lastTrainingDay.day_focus.includes(label)) {
      lastTrainingDay.day_focus += ` + ${label}`;
    }
  };

  if (!hasTag(ANTAGONIST_TAGS as unknown as string[])) inject({ category: "Conditioning", requireTags: ["push"] }, "antagonistas");
  if (!hasTag(["core"])) inject({ category: "Conditioning", requireTags: ["core"] }, "core");

  // Los 3 pilares de escalada (Aerobic Base, Power Endurance, Strength and
  // Power) son requisito fijo todas las semanas -- red de seguridad para
  // cuando el atleta entrena solo 2 días (no entran como día dedicado) o
  // cuando una lesión sustituyó el ejercicio original por otra categoría.
  if (!hasCategory("Aerobic Base")) inject({ category: "Aerobic Base" }, "base aeróbica");
  if (!hasCategory("Power Endurance")) inject({ category: "Power Endurance" }, "resistencia");
  if (!hasCategory("Strength and Power")) inject({ category: "Strength and Power", preferTags: ["climbing"] }, "fuerza de escalada");
}

export function generateMesocyclePlan(params: {
  athlete: Athlete;
  evaluation: Evaluation | null;
  exercises: Exercise[];
  previousMesocycles: number;
}): AiMesocyclePlan {
  const { athlete, evaluation, exercises, previousMesocycles } = params;
  if (!exercises.length) throw new RulesPlannerError("El catálogo de ejercicios está vacío.");

  const profile = deriveProfile(athlete, evaluation);
  const phase = phaseForMesocycle(previousMesocycles);
  const skeleton = buildSkeleton(profile, phase);
  const candidates = buildCandidates(exercises);

  const { byDay, excluded, reduced } = selectWeekExercises(skeleton[0].days, candidates, profile, previousMesocycles);

  const weeks: AiWeek[] = skeleton.map((weekSkeleton, wi) => {
    const micro = MICROCYCLE_TEMPLATE[wi];
    const days: AiDay[] = weekSkeleton.days.map((day) => {
      if (!day.focus) {
        return { day_of_week: day.dayOfWeek as AiDay["day_of_week"], day_focus: null, is_rest: true, blocks: [] };
      }
      const template = DAY_TEMPLATES[day.focus];
      const picked = byDay.get(day.dayOfWeek) ?? [];
      const blocks = picked.map((c) =>
        prescribeBlock({ exercise: c.exercise, meta: c.meta, profile, micro, reduced, excluded }),
      );
      return {
        day_of_week: day.dayOfWeek as AiDay["day_of_week"],
        day_focus: template.label,
        is_rest: false,
        blocks,
      };
    });

    const week: AiWeek = {
      week_number: weekSkeleton.weekNumber,
      load_type: weekSkeleton.loadType,
      focus: `${phase.name}: ${MICROCYCLE_TEMPLATE[wi].focus}`,
      distribution: `${days.filter((d) => !d.is_rest).length} días de entrenamiento, ${days.filter((d) => d.is_rest).length} de descanso`,
      days,
    };
    ensureWeeklyGuarantees(week, candidates, profile, micro, reduced, excluded);
    return week;
  });

  // Tests de línea base: primera sesión de la semana 1, después del
  // calentamiento (nunca antes -- un test de fuerza máxima necesita entrar
  // en calor primero).
  const firstTraining = weeks[0].days.find((d) => !d.is_rest);
  if (firstTraining && MICROCYCLE_TEMPLATE[0].allowTests && !profile.conservative) {
    const insertAt = firstTraining.blocks[0]?.category === "Flexibility" ? 1 : 0;
    firstTraining.blocks.splice(insertAt, 0, ...baselineBlocks(profile, candidates, excluded));
  }

  // Garantía: semana 4 (descarga) con como máximo ~60% de los bloques de la 3.
  // Al recortar, nunca se toca el bloque 0 (calentamiento general, siempre
  // primero) y se prioriza sacar Conditioning/cierre antes que el
  // calentamiento de escalada o el contenido principal -- si no, un recorte
  // agresivo podía comerse la rutina de escalada y dejar solo el
  // Conditioning que ahora va antes en el orden del día.
  const CLIMBING_CATEGORIES_TRIM = ["Aerobic Base", "Power Endurance", "Strength and Power", "Fingerboard"];
  const countBlocks = (w: AiWeek) => w.days.reduce((s, d) => s + d.blocks.length, 0);
  const cap = Math.max(1, Math.floor(countBlocks(weeks[2]) * 0.6));
  while (countBlocks(weeks[3]) > cap) {
    const day = [...weeks[3].days].reverse().find((d) => d.blocks.length > 0);
    if (!day) break;
    let removeIdx = day.blocks.length - 1;
    for (let i = day.blocks.length - 1; i >= 1; i--) {
      if (!CLIMBING_CATEGORIES_TRIM.includes(day.blocks[i].category)) {
        removeIdx = i;
        break;
      }
    }
    day.blocks.splice(removeIdx, 1);
    if (day.blocks.length === 0) {
      day.is_rest = true;
      day.day_focus = null;
    }
  }

  const rationaleParts = [
    `Generado por motor de reglas (fase ${phase.name}, nivel ${profile.level}, disciplina ${profile.discipline}).`,
    `Días de entrenamiento: ${profile.trainingDays.join(", ")}.`,
    profile.missingBaselines.length ? `Tests de línea base en semana 1: ${profile.missingBaselines.join(", ")}.` : null,
    profile.restrictions.length
      ? `Restricciones aplicadas: ${profile.restrictions.map((r) => `${r.zone} (${r.source})`).join("; ")}.`
      : "Sin restricciones por dolor/lesión.",
    profile.conservative ? "Modo conservador por screening de salud positivo (RPE máximo 7, sin tests máximos)." : null,
    profile.transversalRules ? `Reglas transversales del atleta: ${profile.transversalRules}` : null,
  ].filter(Boolean);

  return {
    name: `Mesociclo ${previousMesocycles + 1} - ${phase.label}`,
    phase: phase.label,
    rationale: rationaleParts.join(" "),
    weeks,
  };
}
