// Etapa 4 del pipeline: prescripción de series/reps/RPE/carga/descanso por
// semana, partiendo de los typical_* del catálogo y escalando por microciclo
// (progresión RPE 5 → 6-7 → descarga de los planes de Noceti; dedos con
// carga +5-10% en Carga y +1 serie en Choque, nunca ambos — regla Cata/Diego).
import type { Exercise } from "@/lib/types";
import type { AiBlock } from "@/lib/ai/mesocycleSchema";
import type { PlannerProfile } from "./types";
import type { ExerciseMeta } from "./knowledge/exerciseMeta";
import { EFFORT_TO_RPE, DEFAULT_RPE, type MicrocycleWeek } from "./knowledge/microcycles";
import { PAIN_RULES, kinesioNoteFor } from "./knowledge/painRules";
import type { PainZoneGroup } from "./types";

function parseSets(typicalSets: string | null): number | null {
  if (!typicalSets) return null;
  const m = typicalSets.match(/\d+/);
  return m ? Number(m[0]) : null;
}

/** Descanso: se parsea del texto "Descanso: ..." embebido en la descripción. */
function parseRest(description: string | null): string | null {
  const m = description?.match(/Descanso:\s*([^.]+)/);
  return m ? m[1].trim() : null;
}

function clampRpe(rpe: number, micro: MicrocycleWeek, profile: PlannerProfile): number {
  let max = micro.maxRpe ?? 10;
  if (profile.conservative) max = Math.min(max, 7);
  return Math.min(Math.max(rpe, 2), max);
}

/** Carga textual concreta cuando hay dato de evaluación relevante. */
function loadFor(exercise: Exercise, meta: ExerciseMeta, profile: PlannerProfile, micro: MicrocycleWeek): string | null {
  const name = exercise.name.toLowerCase();

  // Dedos en fingerboard: % del MVC medido, con la progresión del microciclo
  if (exercise.category === "Fingerboard" && profile.maxMvcKg) {
    const basePct = 0.8; // Cata: no-hang al 80-85% del máximo
    const pct = micro.fingerProgression === "load" ? 0.87 : micro.fingerProgression === "deload" ? 0.7 : basePct;
    return `${Math.round(profile.maxMvcKg * pct)} kg (~${Math.round(pct * 100)}% del MVC)`;
  }
  // Dominadas lastradas: % del lastre máximo evaluado
  if (/dominada/.test(name) && meta.tags.includes("pull") && profile.weightedPullupKg) {
    const pct = micro.loadType === "Descarga" ? 0.5 : micro.loadType === "Ajuste" ? 0.6 : 0.75;
    return `+${Math.max(0, Math.round(profile.weightedPullupKg * pct))} kg de lastre (~${Math.round(pct * 100)}% del test)`;
  }
  if (/press de banca|press de pecho/.test(name) && profile.benchPressKg) {
    const pct = micro.loadType === "Descarga" ? 0.5 : 0.7;
    return `${Math.round(profile.benchPressKg * pct)} kg (~${Math.round(pct * 100)}% del test)`;
  }
  if (/peso muerto|rack pull/.test(name) && profile.deadliftKg) {
    const pct = micro.loadType === "Descarga" ? 0.5 : 0.7;
    return `${Math.round(profile.deadliftKg * pct)} kg (~${Math.round(pct * 100)}% del test)`;
  }
  if (exercise.category === "Conditioning") return "RPE como guía";
  return null;
}

export function prescribeBlock(params: {
  exercise: Exercise;
  meta: ExerciseMeta;
  profile: PlannerProfile;
  micro: MicrocycleWeek;
  reduced: Map<PainZoneGroup, number>;
  excluded?: Set<PainZoneGroup>;
}): AiBlock {
  const { exercise, meta, profile, micro, reduced, excluded } = params;

  const baseSets = parseSets(exercise.typical_sets);
  let sets = baseSets != null ? Math.max(1, Math.round(baseSets * micro.volumeMult)) : null;
  // Dedos: el volumen solo sube en la semana de volumen (nunca junto con carga)
  if (exercise.category === "Fingerboard" && baseSets != null) {
    sets =
      micro.fingerProgression === "volume"
        ? baseSets + 1
        : micro.fingerProgression === "deload"
          ? Math.max(1, Math.round(baseSets * 0.55))
          : baseSets;
  }

  const baseRpe = EFFORT_TO_RPE[exercise.typical_effort ?? ""] ?? DEFAULT_RPE;
  let rpe = clampRpe(baseRpe + micro.rpeShift, micro, profile);

  // Zonas con dolor moderado: RPE -1 adicional + nota kinesiológica
  const notes: string[] = [];
  const touchedReduced = [...meta.zones, ...meta.lightZones].filter((z) => reduced.has(z));
  if (touchedReduced.length > 0) {
    rpe = Math.max(2, rpe - 1);
    for (const z of touchedReduced) notes.push(kinesioNoteFor(z, reduced.get(z)!, "reduce"));
  }
  // Carga liviana sobre una zona excluida (ej. escalada aeróbica con lesión
  // de dedos): se mantiene pero a intensidad mínima y con nota explícita.
  const touchedLight = meta.lightZones.filter((z) => excluded?.has(z));
  if (touchedLight.length > 0) {
    rpe = Math.min(rpe, 4);
    for (const z of touchedLight) {
      notes.push(
        `${kinesioNoteFor(z, 5, "reduce")} Solo intensidad baja: presas grandes/rombas, detener ante cualquier dolor en ${PAIN_RULES[z].zoneLabel}.`,
      );
    }
  }
  if (profile.deficits.asymmetry && meta.tags.includes("unilateral")) {
    notes.push("Trabajo unilateral por asimetría >15% entre manos: empezar por el lado débil e igualar reps.");
  }
  if (micro.loadType === "Descarga") {
    notes.push("Semana de descarga: prioridad recuperación, no buscar máximos.");
  }

  return {
    exercise_name: exercise.name,
    is_catalog_exercise: true,
    non_catalog_reason: null,
    category: exercise.category as AiBlock["category"],
    rpe_target: String(rpe),
    sets: sets != null ? String(sets) : (exercise.typical_sets ?? null),
    reps_or_time: exercise.typical_reps ?? exercise.typical_time ?? null,
    time: exercise.typical_time ?? null,
    load: loadFor(exercise, meta, profile, micro),
    rest: parseRest(exercise.description) ?? (exercise.category === "Conditioning" ? "2-3 min" : "3 min"),
    kinesio_notes: notes.length ? notes.join(" ") : null,
  };
}

export { PAIN_RULES };
