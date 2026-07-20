// Clasificación funcional del catálogo: qué zonas carga cada ejercicio (para
// las reglas de seguridad por dolor/lesión) y qué tags funcionales tiene
// (para las garantías de antagonistas/core y la selección por déficit).
//
// En vez de enumerar 194 entradas, se clasifica por reglas declarativas de
// categoría + palabras clave del nombre, con un mapa de excepciones para los
// casos que las reglas generales no capturan. Esto cubre automáticamente
// ejercicios nuevos que un entrenador agregue por la UI (fallback defensivo:
// clasificación conservadora por categoría).
import type { Exercise } from "@/lib/types";
import type { PainZoneGroup, Tag } from "../types";

export type ExerciseMeta = {
  /** Zonas con carga PESADA: se excluyen con dolor >= excludeAt. */
  zones: PainZoneGroup[];
  /** Zonas con carga LIVIANA: no excluyen, solo reducen RPE + nota (los
   * planes de referencia mantienen escalada suave con lesión de dedos). */
  lightZones: PainZoneGroup[];
  tags: Tag[];
};

type KeywordRule = {
  pattern: RegExp;
  zones?: PainZoneGroup[];
  tags?: Tag[];
};

// Reglas por palabra clave sobre el nombre (en minúsculas, sin acentos).
// Se aplican TODAS las que matcheen (zonas y tags se acumulan).
const KEYWORD_RULES: KeywordRule[] = [
  // Tracción (dominadas, remos, lock offs, negativas, activaciones)
  { pattern: /dominada|traccion|remo|pullover|lock off|negativa|activacion|espalda al vacio|generacion de potencia/, zones: ["elbow", "shoulder"], tags: ["pull"] },
  { pattern: /curl de biceps|curl martillo/, zones: ["elbow"], tags: ["pull"] },
  // Empuje (press, flexiones, fondos, aperturas, tríceps)
  { pattern: /press|flexion|fondo|apertura|triceps|push/, zones: ["shoulder", "wrist"], tags: ["push"] },
  { pattern: /compresion|calistenia/, zones: ["shoulder"], tags: ["push"] },
  // Estabilidad de hombro / antagonistas escapulares (cargan poco: rehab)
  { pattern: /rotacion(es)? de hombro|face pulls|retraccion escapular|iyt|encogimiento de hombros|elevacion lateral|hombros a prueba de balas|dislocacion/, tags: ["push", "shoulder_stability"] },
  // Antebrazo / extensores (antagonistas de dedos)
  { pattern: /antebrazo|curl inverso/, zones: ["wrist", "elbow"], tags: ["finger_extensors"] },
  // Core
  { pattern: /core|plancha|hollow|pallof|enhebrar la aguja/, tags: ["core"] },
  { pattern: /copenhague/, zones: ["knee"], tags: ["core"] },
  // Piernas / cadera / bisagra
  { pattern: /sentadilla|peso muerto|zancada|puente|swing|rack pull|hip|powerlifting|tension - manos fijas|constructor de tension/, zones: ["low_back", "knee"], tags: ["legs"] },
  // Dedos / campus
  { pattern: /campus/, zones: ["fingers", "elbow", "shoulder"], tags: ["fingers", "power", "climbing"] },
  { pattern: /sin pies/, zones: ["fingers", "shoulder"], tags: ["power"] },
  // Unilateral
  { pattern: /un brazo|una pierna|unipodal|arquero/, tags: ["unilateral"] },
  // Tests
  { pattern: /test/, tags: ["test"] },
];

// Base por categoría (siempre presente, las keywords suman encima).
// La escalada aeróbica carga los dedos de forma LIVIANA: con lesión de dedos
// se mantiene a intensidad baja (criterio de los planes de referencia), en
// cambio dedos/board/campus cargan PESADO y se excluyen.
const CATEGORY_BASE: Record<string, ExerciseMeta> = {
  "Aerobic Base": { zones: [], lightZones: ["fingers"], tags: ["climbing"] },
  "Power Endurance": { zones: ["fingers"], lightZones: ["elbow"], tags: ["climbing"] },
  "Strength and Power": { zones: ["fingers", "shoulder"], lightZones: [], tags: ["climbing", "power"] },
  Fingerboard: { zones: ["fingers"], lightZones: ["elbow"], tags: ["fingers", "pull"] },
  Conditioning: { zones: [], lightZones: [], tags: [] },
  Flexibility: { zones: [], lightZones: [], tags: ["mobility"] },
  Otro: { zones: [], lightZones: [], tags: [] },
};

// Excepciones puntuales que las reglas generales clasifican mal.
const OVERRIDES: Record<string, Partial<ExerciseMeta>> = {
  // Es una superserie de tracción, no un ejercicio de empuje
  "Superserie de Potencia de Tracción": { zones: ["elbow", "shoulder"], tags: ["pull", "power"] },
  "Tracciones Anchas - Fuerza": { zones: ["elbow", "shoulder"], tags: ["pull"] },
  "Tracciones de Potencia": { zones: ["elbow", "shoulder"], tags: ["pull", "power"] },
  // Estiramiento pasivo de dedos: moviliza, no carga
  "Estiramientos de Dedos - Estático Pasivo": { zones: [], tags: ["mobility", "finger_extensors"] },
  "Flexibilidad de Antebrazo": { zones: [], tags: ["mobility", "finger_extensors"] },
  "Estiramiento de Muñeca - Estático Pasivo": { zones: [], tags: ["mobility"] },
  // Rutina general de calistenia: empuje + core, apta como antagonista
  "Rutina de Calistenia de 10 Minutos para Escaladores": { zones: [], tags: ["push", "core"] },
  // Kilometraje de boulder muy fácil: carga liviana de dedos, apto en rehab
  "Kilometraje de Boulder AC": { zones: [], lightZones: ["fingers"], tags: ["climbing"] },
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function classifyExercise(exercise: Pick<Exercise, "name" | "category">): ExerciseMeta {
  const base = CATEGORY_BASE[exercise.category] ?? { zones: [], lightZones: [], tags: [] };
  const zones = new Set<PainZoneGroup>(base.zones);
  const lightZones = new Set<PainZoneGroup>(base.lightZones);
  const tags = new Set<Tag>(base.tags);

  const name = normalize(exercise.name);
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(name)) {
      rule.zones?.forEach((z) => zones.add(z));
      rule.tags?.forEach((t) => tags.add(t));
    }
  }

  const override = OVERRIDES[exercise.name];
  if (override) {
    if (override.zones) {
      zones.clear();
      override.zones.forEach((z) => zones.add(z));
    }
    if (override.lightZones) {
      lightZones.clear();
      override.lightZones.forEach((z) => lightZones.add(z));
    }
    if (override.tags) {
      tags.clear();
      override.tags.forEach((t) => tags.add(t));
    }
  }

  // Una zona pesada nunca es a la vez liviana
  for (const z of zones) lightZones.delete(z);

  return { zones: [...zones], lightZones: [...lightZones], tags: [...tags] };
}
