// Grupos musculares / partes del cuerpo por ejercicio -- taxonomia fija para
// que sirva de ayuda real al agrupar ejercicios o excluirlos ante una lesion
// (mas granular que las PAIN_ZONE_GROUPS de seguridad, pensada para uso
// descriptivo/editorial en el catalogo). Los valores aca son solo la
// clasificacion AUTOMATICA sugerida -- el criterio final lo define quien
// edita la planilla.
import type { Exercise } from "@/lib/types";
import type { PainZoneGroup } from "../types";

export const MUSCLE_GROUPS = [
  "Dedos",
  "Antebrazo",
  "Muñeca",
  "Codo",
  "Hombro",
  "Pecho",
  "Espalda",
  "Bíceps",
  "Tríceps",
  "Core",
  "Cadera",
  "Piernas",
  "Rodilla",
  "Movilidad general",
  "Escalada general",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

type KeywordRule = { pattern: RegExp; groups: MuscleGroup[] };

const KEYWORD_RULES: KeywordRule[] = [
  // "Descanso: ..." de los ejercicios de tracción en hangboard/barra dice
  // literal "lats, biceps, and forearms" -- van a Espalda+Bíceps+Antebrazo.
  { pattern: /activacion(es)?|lock offs?|negativa|generacion de potencia|espalda al vacio|densidad/, groups: ["Espalda", "Bíceps", "Antebrazo"] },
  { pattern: /remo|dominada|traccion(es)?|pullover|dorsales|encogimiento de hombros|face pulls|retraccion escapular|hanging row/, groups: ["Espalda"] },
  // Flexiones/fondos: el catálogo dice "triceps, chest, anterior delts"
  { pattern: /flexion(es)?|fondos|press ups|pseudo flexiones/, groups: ["Pecho", "Tríceps", "Hombro"] },
  { pattern: /pecho|press de banca|press de pecho|aperturas de pecho|aperturas inclinado/, groups: ["Pecho"] },
  { pattern: /biceps|curl martillo/, groups: ["Bíceps"] },
  { pattern: /triceps|patada de triceps/, groups: ["Tríceps"] },
  { pattern: /compresion|constructor de balas|prueba de balas/, groups: ["Hombro"] },
  { pattern: /hombro|press militar|press arnold|press de hombro|elevacion lateral|dislocacion|rotacion(es)? de hombro|rotacion externa/, groups: ["Hombro"] },
  { pattern: /core|plancha|hollow|pallof|enhebrar la aguja|copenhague|abdominal/, groups: ["Core"] },
  // "Tension Builder" y similares: workout de tren inferior (segun catalogo)
  { pattern: /constructor de tension/, groups: ["Piernas", "Cadera"] },
  { pattern: /sentadilla|zancada|goblet|cosaco|split|estocada/, groups: ["Piernas"] },
  { pattern: /cadera|gluteo|puente|hip thrust|isquiotibial/, groups: ["Cadera", "Piernas"] },
  { pattern: /rodilla/, groups: ["Rodilla"] },
  { pattern: /muneca/, groups: ["Muñeca"] },
  { pattern: /antebrazo|curl inverso/, groups: ["Antebrazo"] },
  { pattern: /codo/, groups: ["Codo"] },
  { pattern: /peso muerto|rack pull|powerlifting/, groups: ["Espalda", "Piernas"] },
  { pattern: /trx iyt|scapular|escapular/, groups: ["Espalda", "Hombro"] },
  { pattern: /push press|press de pesa rusa/, groups: ["Hombro", "Tríceps", "Piernas"] },
  { pattern: /swings con pesa rusa/, groups: ["Cadera", "Piernas", "Core"] },
  { pattern: /calistenia/, groups: ["Pecho", "Core"] },
];

const CATEGORY_DEFAULT: Record<string, MuscleGroup[]> = {
  Fingerboard: ["Dedos", "Antebrazo"],
  "Aerobic Base": ["Dedos"],
  "Power Endurance": ["Dedos", "Antebrazo"],
  "Strength and Power": ["Dedos", "Hombro"],
  Flexibility: ["Movilidad general"],
  Conditioning: [],
  Otro: [],
};

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Sugerencia automatica de grupos musculares, para revisar/editar a mano. */
export function suggestMuscleGroups(exercise: Pick<Exercise, "name" | "category">): MuscleGroup[] {
  const groups = new Set<MuscleGroup>(CATEGORY_DEFAULT[exercise.category] ?? []);
  const name = normalize(exercise.name);
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(name)) rule.groups.forEach((g) => groups.add(g));
  }
  if (groups.size === 0) groups.add("Movilidad general");
  return [...groups];
}

/**
 * Grupo muscular curado (columna muscle_groups) -> zona de dolor de
 * seguridad (PAIN_ZONE_GROUPS). Usado para que la exclusion por lesion del
 * generador se base en la clasificacion revisada a mano, no en un adivine
 * por palabras clave. "Movilidad general" y "Escalada general" no cargan
 * ninguna zona pesada por si solos.
 */
export const MUSCLE_GROUP_TO_PAIN_ZONE: Record<MuscleGroup, PainZoneGroup[]> = {
  Dedos: ["fingers"],
  Antebrazo: ["elbow", "wrist"],
  "Muñeca": ["wrist"],
  Codo: ["elbow"],
  Hombro: ["shoulder"],
  Pecho: ["shoulder"],
  Espalda: ["shoulder", "elbow"],
  "Bíceps": ["elbow"],
  "Tríceps": ["elbow"],
  Core: ["low_back"],
  Cadera: ["low_back"],
  Piernas: ["knee"],
  Rodilla: ["knee"],
  "Movilidad general": [],
  "Escalada general": [],
};

/** Convierte los grupos musculares curados de un ejercicio a zonas de dolor. */
export function muscleGroupsToPainZones(groups: readonly string[]): PainZoneGroup[] {
  const zones = new Set<PainZoneGroup>();
  for (const g of groups) {
    const mapped = MUSCLE_GROUP_TO_PAIN_ZONE[g as MuscleGroup];
    mapped?.forEach((z) => zones.add(z));
  }
  return [...zones];
}
