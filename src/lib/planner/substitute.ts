// Etapa de sustitución: alternativas a un ejercicio cuando duele durante la
// sesión (Fase 3.1 del plan de entrevistas, pedido #4 de Suri: "que la app le
// diga qué hacer en vez de ese ejercicio cuando algo duele"). Reutiliza el
// mismo motor de reglas que arma el plan (selection.ts, painRules.ts,
// exerciseMeta.ts) en vez de duplicar el filtrado por equipamiento/seguridad.
import type { Athlete, Block, Evaluation, Exercise, ExerciseCategory } from "@/lib/types";
import { deriveProfile } from "./profile";
import { classifyExercise } from "./knowledge/exerciseMeta";
import { PAIN_RULES, kinesioNoteFor, normalizePainZone } from "./knowledge/painRules";
import { candidatesForSlot, zoneActions } from "./selection";
import type { DaySlot } from "./knowledge/dayTemplates";

export type AlternativeSuggestion = {
  exercise: Exercise;
  /** Nota lista para guardar en blocks.kinesio_notes al aplicar el cambio. */
  note: string;
};

/**
 * Alternativas rankeadas para reemplazar `block` cuando duele la zona
 * reportada, filtradas por la misma categoría/equipamiento/seguridad que usa
 * el generador de mesociclos -- nunca sugiere algo que vuelva a cargar la
 * zona dolorida, y prioriza los tags de PAIN_RULES[zona].preferInstead.
 */
export function suggestAlternatives(params: {
  block: Pick<Block, "category" | "exercise_id">;
  /** Clave de zona con sufijo _l/_r (Block.pain_zone / PAIN_ZONES), o ya normalizada (checkins.pain_by_zone). */
  painZoneKey: string;
  painLevel: number;
  exercises: Exercise[];
  athlete: Athlete;
  evaluation: Evaluation | null;
  limit?: number;
}): AlternativeSuggestion[] {
  const { block, painZoneKey, painLevel, exercises, athlete, evaluation, limit = 3 } = params;
  const zone = normalizePainZone(painZoneKey);
  if (!zone || !block.category) return [];

  const profile = deriveProfile(athlete, evaluation);
  const { excluded } = zoneActions(profile);
  excluded.add(zone);

  const slot: DaySlot = {
    category: block.category as ExerciseCategory,
    count: limit,
    preferTags: PAIN_RULES[zone].preferInstead,
  };

  const candidates = exercises
    .filter((e) => e.id !== block.exercise_id)
    .map((exercise) => ({ exercise, meta: classifyExercise(exercise) }));

  const ranked = candidatesForSlot(candidates, slot, profile, excluded);
  const action = painLevel >= PAIN_RULES[zone].excludeAt ? "exclude" : "reduce";
  const note = kinesioNoteFor(zone, painLevel, action);

  return ranked.slice(0, limit).map((c) => ({ exercise: c.exercise, note }));
}
