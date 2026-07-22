// Etapa 3 del pipeline: selección de ejercicios del catálogo para cada slot
// del esqueleto. Filtro por equipamiento y seguridad (dolor/lesión), score
// determinista por déficits, rotación por índice de mesociclo (variedad sin
// aleatoriedad) y garantías estructurales (antagonistas + core semanales).
import type { Exercise } from "@/lib/types";
import type { PainZoneGroup, PlannerProfile, Tag } from "./types";
import { classifyExercise, type ExerciseMeta } from "./knowledge/exerciseMeta";
import { PAIN_RULES } from "./knowledge/painRules";
import { normalizeEquip } from "./profile";
import type { DaySlot } from "./knowledge/dayTemplates";

export type CandidateExercise = {
  exercise: Exercise;
  meta: ExerciseMeta;
};

export function buildCandidates(exercises: Exercise[]): CandidateExercise[] {
  return exercises.map((exercise) => ({ exercise, meta: classifyExercise(exercise) }));
}

function equipmentOk(exercise: Exercise, profile: PlannerProfile): boolean {
  const required = Array.isArray(exercise.equipment_required) ? exercise.equipment_required : [];
  return required.every((eq) => profile.equipment.has(normalizeEquip(eq)));
}

/** Zonas excluidas (dolor >= excludeAt) y a reducir (>= reduceAt). */
export function zoneActions(profile: PlannerProfile): { excluded: Set<PainZoneGroup>; reduced: Map<PainZoneGroup, number> } {
  const excluded = new Set<PainZoneGroup>();
  const reduced = new Map<PainZoneGroup, number>();
  for (const r of profile.restrictions) {
    const rule = PAIN_RULES[r.zone];
    if (r.level >= rule.excludeAt) excluded.add(r.zone);
    else if (r.level >= rule.reduceAt) reduced.set(r.zone, r.level);
  }
  return { excluded, reduced };
}

/** Minutos totales de "typical_duration" (ej. "19 min", "1h 30m"), o null si no se puede parsear. */
function durationMinutes(exercise: { typical_duration: string | null }): number | null {
  const s = exercise.typical_duration;
  if (!s) return null;
  const h = s.match(/(\d+)\s*h/i);
  const m = s.match(/(\d+)\s*m/i);
  if (!h && !m) return null;
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

function score(candidate: CandidateExercise, profile: PlannerProfile, slot: DaySlot): number {
  const { meta, exercise } = candidate;
  let s = 0;
  for (const tag of slot.preferTags ?? []) if (meta.tags.includes(tag)) s += 3;
  // Calentamiento de escalada: preferir sesiones cortas (~10-20 min), no la
  // sesión aeróbica principal del día.
  if (slot.preferShortDuration) {
    const mins = durationMinutes(exercise);
    if (mins != null && mins >= 8 && mins <= 22) s += 4;
    else if (mins != null && mins > 22) s -= 2;
  }
  // Déficits del atleta suben ejercicios relevantes
  if (profile.deficits.fingerStrength && meta.tags.includes("fingers")) s += 2;
  if (profile.deficits.aerobicBase && exercise.category === "Aerobic Base") s += 2;
  if (profile.deficits.fingerEndurance && exercise.category === "Power Endurance") s += 2;
  if (profile.deficits.coreStability && meta.tags.includes("core")) s += 2;
  if (profile.deficits.asymmetry && meta.tags.includes("unilateral")) s += 2;
  if (profile.deficits.mobility && meta.tags.includes("mobility")) s += 1;
  // Los tests solo suman cuando se piden explícitamente (semana 1)
  if (meta.tags.includes("test")) s -= 5;
  // Conservador: bajar ejercicios de máxima intensidad
  if (profile.conservative && /Very Hard|Speed and Power/.test(exercise.typical_effort ?? "")) s -= 2;
  return s;
}

export function candidatesForSlot(
  all: CandidateExercise[],
  slot: DaySlot,
  profile: PlannerProfile,
  excluded: Set<PainZoneGroup>,
): CandidateExercise[] {
  return all
    .filter((c) => c.exercise.category === slot.category)
    .filter((c) => equipmentOk(c.exercise, profile))
    .filter((c) => !c.meta.zones.some((z) => excluded.has(z)))
    .filter((c) => (slot.requireTags ?? []).every((t) => c.meta.tags.includes(t)))
    .sort((a, b) => {
      const diff = score(b, profile, slot) - score(a, profile, slot);
      if (diff !== 0) return diff;
      return a.exercise.name.localeCompare(b.exercise.name, "es");
    });
}

/**
 * Elige `count` ejercicios del ranking, rotando el punto de partida según el
 * número de mesociclos previos (variedad determinista entre mesociclos) y
 * evitando repetir un ejercicio ya usado esa semana.
 */
export function pickForSlot(
  ranked: CandidateExercise[],
  count: number,
  rotation: number,
  usedThisWeek: Set<string>,
): CandidateExercise[] {
  const picked: CandidateExercise[] = [];
  if (ranked.length === 0) return picked;
  const start = rotation % ranked.length;
  for (let i = 0; i < ranked.length && picked.length < count; i++) {
    const c = ranked[(start + i) % ranked.length];
    if (usedThisWeek.has(c.exercise.name)) continue;
    picked.push(c);
    usedThisWeek.add(c.exercise.name);
  }
  // Si todos estaban usados (semana con muchos slots iguales), permitir repetición
  for (let i = 0; picked.length < count && i < ranked.length; i++) {
    const c = ranked[(start + i) % ranked.length];
    if (!picked.includes(c)) picked.push(c);
  }
  return picked;
}

/** Tags de antagonista aceptados por la garantía estructural (regla 5). */
export const ANTAGONIST_TAGS: Tag[] = ["push", "finger_extensors", "shoulder_stability"];
