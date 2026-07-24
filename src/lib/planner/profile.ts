// Etapa 1 del pipeline: derivar el perfil de planificación (nivel, déficits,
// restricciones, agenda, equipamiento) desde la ficha del atleta y su
// evaluación más reciente. Traduce a código las reglas 3, 4 y 7 del sistema
// actual (tests de línea base, progresión de dedos, lesiones → restricciones).
import { DAYS_OF_WEEK, type Athlete, type Evaluation } from "@/lib/types";
import type { BaselineNeed, Deficits, Level, PlannerProfile, Restriction } from "./types";
import { normalizePainZone, zoneFromFreeText, PAIN_RULES } from "./knowledge/painRules";
import { DEFAULT_DAYS_BY_LEVEL } from "./knowledge/dayTemplates";

function normalizeEquip(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Nivel a partir del grado de boulder consolidado/indoor (escala V). */
function deriveLevel(athlete: Athlete, evaluation: Evaluation | null): Level {
  const grades = [
    athlete.consolidated_grade,
    athlete.boulder_indoor_max,
    athlete.boulder_outdoor_max,
    evaluation?.boulder_redpoint,
  ];
  let maxV: number | null = null;
  for (const g of grades) {
    const m = g?.match(/v(\d+)/i);
    if (m) maxV = Math.max(maxV ?? 0, Number(m[1]));
  }
  if (maxV === null) {
    // Sin grado de boulder: usar años escalando como aproximación
    if ((athlete.years_climbing ?? 0) >= 5) return "intermedio";
    return "principiante";
  }
  if (maxV <= 3) return "principiante";
  if (maxV <= 6) return "intermedio";
  return "avanzado";
}

/** Umbral de MVC %BW "bajo" por nivel (referencia usada con Diego/Seba). */
const MVC_BW_THRESHOLD: Record<Level, number> = {
  principiante: 40,
  intermedio: 50,
  avanzado: 60,
};

function deriveDeficits(level: Level, ev: Evaluation | null): Deficits {
  if (!ev) {
    return { fingerStrength: false, fingerEndurance: false, aerobicBase: true, asymmetry: false, coreStability: false, mobility: false };
  }
  const bwPcts = [ev.left_mvc_bw_pct, ev.right_mvc_bw_pct].filter((v): v is number => v != null);
  const fingerStrength = bwPcts.length > 0 && Math.min(...bwPcts) < MVC_BW_THRESHOLD[level];
  const drops = [ev.left_cf_drop_pct, ev.right_cf_drop_pct].filter((v): v is number => v != null);
  const fingerEndurance = drops.length > 0 && Math.max(...drops) > 50;
  const aerobicBase = ev.arc_duration_min == null || ev.arc_completed === false || (ev.arc_rpe ?? 0) >= 8;
  const asymmetry = (ev.asymmetry_mvc_pct ?? 0) > 15;
  const coreStability = (ev.plank_seconds != null && ev.plank_seconds < 60) || (ev.lsit_seconds != null && ev.lsit_seconds < 10);
  const mobility =
    (ev.frog_l ?? "") !== (ev.frog_r ?? "") ||
    (ev.thomas_l ?? "") !== (ev.thomas_r ?? "") ||
    (ev.shoulder_ir_l ?? "") !== (ev.shoulder_ir_r ?? "");
  return { fingerStrength, fingerEndurance, aerobicBase, asymmetry, coreStability, mobility };
}

function deriveMissingBaselines(ev: Evaluation | null): BaselineNeed[] {
  const missing: BaselineNeed[] = [];
  if (!ev || (ev.left_mvc_kg == null && ev.right_mvc_kg == null)) missing.push("finger_max");
  if (!ev || (ev.left_cf_reps == null && ev.right_cf_reps == null)) missing.push("critical_force");
  if (!ev || ev.arc_duration_min == null) missing.push("arc");
  if (!ev || ev.weighted_pullup_kg == null) missing.push("pullup_max");
  return missing;
}

function deriveRestrictions(athlete: Athlete, ev: Evaluation | null): Restriction[] {
  const byZone = new Map<string, Restriction>();
  const add = (r: Restriction) => {
    const prev = byZone.get(r.zone);
    if (!prev || r.level > prev.level) byZone.set(r.zone, r);
  };

  // Dolor por zona reportado en la evaluación (>=3 se considera)
  for (const [key, value] of Object.entries(ev?.pain_by_zone ?? {})) {
    const zone = normalizePainZone(key);
    if (zone && value >= 3) add({ zone, level: value, source: `dolor ${value}/10 en evaluación` });
  }

  // Lesión activa de la ficha (severidad estimada: 6, o el umbral de dolor declarado)
  if (athlete.has_active_injury) {
    const zone = zoneFromFreeText(athlete.injury_location);
    if (zone) add({ zone, level: Math.max(athlete.pain_threshold ?? 6, 6), source: `lesión activa: ${athlete.injury_location}` });
  }

  // Historial de lesiones no resueltas (severidad conservadora: 4 → reducir, no excluir)
  for (const injury of athlete.injury_history ?? []) {
    if (/cronic|activa|en curso|sin resolver|recuperando/i.test(injury.status ?? "")) {
      const zone = zoneFromFreeText(injury.injury);
      if (zone) add({ zone, level: 4, source: `historial: ${injury.injury} (${injury.status})` });
    }
  }

  return [...byZone.values()];
}

export function deriveProfile(athlete: Athlete, evaluation: Evaluation | null): PlannerProfile {
  const level = deriveLevel(athlete, evaluation);
  const declared = new Set((athlete.equipment ?? []).map(normalizeEquip));
  const hasFingerboard = declared.has("fingerboard") || declared.has("regleta de lastre");
  const equipment = new Set(declared);
  // Lo que no requiere equipo siempre es elegible; peso corporal y colchoneta
  // se asumen disponibles para cualquier atleta.
  equipment.add("peso corporal");
  equipment.add("colchoneta");
  // Alias: una fingerboard sirve como regleta de lastre (Lifting Edge) y
  // viceversa — el catálogo de dedos usa "Regleta de lastre" como equipo.
  if (hasFingerboard) {
    equipment.add("fingerboard");
    equipment.add("regleta de lastre");
  }
  // Una barra de dominadas cubre los ejercicios de barra fija que el catálogo
  // lista con equipo "Fingerboard" (dominadas, lock offs, core en barra).
  if (equipment.has("barra dominadas")) equipment.add("fingerboard");

  const restrictions = deriveRestrictions(athlete, evaluation);
  const hardExcludedZones = new Set(restrictions.filter((r) => r.level >= PAIN_RULES[r.zone].excludeAt).map((r) => r.zone));
  const activeInjury = hardExcludedZones.size > 0;
  const fingerInjuryHard = hardExcludedZones.has("fingers");

  const configuredDays = (athlete.training_days ?? []).filter((d) => (DAYS_OF_WEEK as readonly string[]).includes(d));
  let trainingDays = configuredDays.length >= 2 ? [...configuredDays] : [...DEFAULT_DAYS_BY_LEVEL[level]];
  // Respetar la cantidad de días de descanso pedida (si deja al menos 2 de entreno)
  const restDays = athlete.rest_days_per_week;
  if (restDays != null && restDays >= 1) {
    const maxTraining = Math.max(2, 7 - restDays);
    if (trainingDays.length > maxTraining) trainingDays = trainingDays.slice(0, maxTraining);
  }
  // Lesión activa: más recuperación, tope de 4 días de entrenamiento/semana
  // (al menos 3 de descanso) aunque el atleta tenga configurados más días.
  if (activeInjury && trainingDays.length > 4) trainingDays = trainingDays.slice(0, 4);
  // Garantía dura: al menos 1 día de descanso por semana (no negociable)
  if (trainingDays.length > 6) trainingDays = trainingDays.slice(0, 6);
  trainingDays.sort((a, b) => DAYS_OF_WEEK.indexOf(a as (typeof DAYS_OF_WEEK)[number]) - DAYS_OF_WEEK.indexOf(b as (typeof DAYS_OF_WEEK)[number]));

  const conservative = Object.values(evaluation?.health_screening ?? {}).some(Boolean);

  const discipline =
    athlete.discipline === "Boulder" || athlete.discipline === "Deportiva" || athlete.discipline === "Ambas"
      ? athlete.discipline
      : "Ambas";

  const mvcs = [evaluation?.left_mvc_kg, evaluation?.right_mvc_kg].filter((v): v is number => v != null);

  return {
    level,
    discipline,
    deficits: deriveDeficits(level, evaluation),
    missingBaselines: deriveMissingBaselines(evaluation),
    restrictions,
    activeInjury,
    fingerInjuryHard,
    conservative,
    trainingDays,
    equipment,
    hasFingerboard,
    hasTindeq: declared.has("tindeq progressor"),
    transversalRules: athlete.transversal_rules,
    weightKg: evaluation?.weight_kg ?? athlete.weight_kg,
    weightedPullupKg: evaluation?.weighted_pullup_kg ?? null,
    benchPressKg: evaluation?.bench_press_kg ?? null,
    deadliftKg: evaluation?.deadlift_kg ?? null,
    maxMvcKg: mvcs.length ? Math.max(...mvcs) : null,
  };
}

export { normalizeEquip };
