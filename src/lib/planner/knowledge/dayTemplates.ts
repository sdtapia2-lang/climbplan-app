// Layouts semanales y plantillas de día, destilados de los planes reales:
// - Fobital: 4 sesiones/semana (Escalada+Gym, Escalada, Gym, Escalada
//   rendimiento), máximo 2 días seguidos de carga; físico 2×/semana pre y
//   post escalada (tracción lastrada, press, peso muerto, sentadilla, core).
// - Cata: escalada 2-3×/semana + físico 2× + dedos 2-3× + muñecas; tipos de
//   sesión: board (1×), resistencia (1×), ruta (1×), técnica.
// - Noceti: sesiones de escalada por microciclo (Capacidad/Corto/Largo/Limit)
//   + físico 2×/semana en 3 circuitos (tracción+piernas+empuje / empuje+
//   cadera+hombro / core ×3).
import type { DayFocus, Tag } from "../types";
import type { ExerciseCategory } from "@/lib/types";

export type DaySlot = {
  /** Categoría del catálogo de la que se seleccionan los ejercicios del slot. */
  category: ExerciseCategory;
  /** Cantidad de ejercicios a seleccionar. */
  count: number;
  /** Tags preferidos (suben el score, no excluyen). */
  preferTags?: Tag[];
  /** Tags requeridos (filtro duro). */
  requireTags?: Tag[];
  /** Prefiere ejercicios con typical_duration corta (~10-20 min): para el
   * calentamiento de escalada de los días de Power Endurance/Strength. */
  preferShortDuration?: boolean;
};

export type DayTemplate = {
  label: string; // day_focus visible
  slots: DaySlot[];
};

// Orden fijo dentro de cada día: 1) calentamiento general fijo (rutina
// "General Warm Up", prependeada en generatePlan.ts, no es un slot de estos
// templates) 2) si hay Conditioning en el día, va primero (activación con
// fuerza general antes del trabajo de escalada, nunca después -- regla
// verificada en test-planner.ts) 3) en días de escalada de potencia/
// resistencia, calentamiento de escalada (Aerobic Base corto) 4) contenido
// principal 5) Flexibility de cierre al final.
const CLIMBING_WARMUP_SLOT: DaySlot = { category: "Aerobic Base", count: 1, preferShortDuration: true };
const COOLDOWN_SLOT: DaySlot = { category: "Flexibility", count: 1, preferTags: ["mobility"] };

export const DAY_TEMPLATES: Record<DayFocus, DayTemplate> = {
  escalada_capacidad: {
    // Noceti "Capacidad Boulder" / ARC: volumen de escalada a intensidad media
    label: "Escalada - capacidad y técnica",
    slots: [{ category: "Aerobic Base", count: 1 }, COOLDOWN_SLOT],
  },
  escalada_intensidad: {
    // Noceti "Boulder Corto"/"Limit" + Fobital "boulder duro": fuerza/potencia.
    // Con 4+ dias de entreno esta sesion combina fuerza general (Conditioning
    // tren superior/piernas) con el boulder de potencia en un mismo dia, en
    // vez de dedicarle un dia aparte (ver "consolida fisico_fuerza" en
    // buildWeekLayout mas abajo): sigue el criterio de "Sesiones combinadas
    // de fuerza y bulder" (Climb Strong, ref. video) -- agrupar cualidades
    // compatibles en una sola sesion en vez de repartir carga moderada todos
    // los dias, dejando asi un dia real libre para descanso/movilidad. El
    // volumen de fuerza general se recorta a 2 slots (no los 3 de
    // fisico_fuerza) para no convertir una sesion productiva en sobre-carga.
    label: "Escalada - fuerza e intensidad",
    slots: [
      { category: "Conditioning", count: 1, requireTags: ["pull"] },
      { category: "Conditioning", count: 1, requireTags: ["legs"] },
      CLIMBING_WARMUP_SLOT,
      { category: "Strength and Power", count: 1, preferTags: ["climbing"] },
      COOLDOWN_SLOT,
    ],
  },
  escalada_resistencia: {
    // Noceti "Boulder Largo" / Cata "Resistencia": fuerza-resistencia
    label: "Escalada - resistencia",
    slots: [CLIMBING_WARMUP_SLOT, { category: "Power Endurance", count: 1 }, COOLDOWN_SLOT],
  },
  dedos_fuerza: {
    // Cata: protocolo de dedos en regleta + antagonistas de antebrazo. El
    // Conditioning va antes del Fingerboard (regla: conditioning siempre
    // antes de la rutina de escalada, no después).
    label: "Fuerza de dedos y antagonistas",
    slots: [
      { category: "Conditioning", count: 1, requireTags: ["finger_extensors"] },
      { category: "Conditioning", count: 1, requireTags: ["core"] },
      { category: "Fingerboard", count: 1 },
    ],
  },
  fisico_fuerza: {
    // Noceti circuitos 1-2 + Fobital físico: tracción + piernas + empuje
    label: "Físico - fuerza general",
    slots: [
      { category: "Conditioning", count: 1, requireTags: ["pull"] },
      { category: "Conditioning", count: 1, requireTags: ["legs"] },
      { category: "Conditioning", count: 1, requireTags: ["push"] },
    ],
  },
  fisico_core_antagonistas: {
    // Noceti circuito 3 + regla de antagonistas obligatorios
    label: "Core, hombro y antagonistas",
    slots: [
      { category: "Conditioning", count: 1, requireTags: ["core"] },
      { category: "Conditioning", count: 1, preferTags: ["shoulder_stability"], requireTags: ["push"] },
      COOLDOWN_SLOT,
    ],
  },
  movilidad: {
    label: "Movilidad y recuperación",
    slots: [COOLDOWN_SLOT],
  },
};

// Los 3 pilares de escalada son un requisito fijo del entrenamiento (no una
// preferencia): siempre debe haber 1 día de Aerobic Base (capacidad), 1 de
// Power Endurance (resistencia) y 1 de Strength and Power (intensidad) por
// semana. Con 3+ días entran los tres como día dedicado; con solo 2 días no
// entran los tres como días separados, pero igual quedan garantizados como
// ejercicio individual via ensureWeeklyGuarantees en generatePlan.ts.
export const CORE_CLIMBING_FOCI: readonly DayFocus[] = ["escalada_capacidad", "escalada_resistencia", "escalada_intensidad"];
// fisico_fuerza ya no ocupa un dia propio a partir de 4 dias de entreno: su
// contenido (fuerza general tren superior/piernas) quedo absorbido dentro de
// escalada_intensidad (sesion combinada, ver arriba). El dia que eso libera
// se usa para core/antagonistas y recien despues movilidad real -- mas dias
// de descanso efectivo en vez de otro dia de carga moderada.
const EXTRA_FOCI: readonly DayFocus[] = ["dedos_fuerza", "fisico_core_antagonistas", "movilidad"];

function buildWeekLayout(count: number): DayFocus[] {
  const twoDay: DayFocus[] = ["escalada_capacidad", "fisico_fuerza"];
  if (count <= 2) return twoDay.slice(0, count);
  return [...CORE_CLIMBING_FOCI, ...EXTRA_FOCI].slice(0, count);
}

export const WEEK_LAYOUTS: Record<number, DayFocus[]> = {
  2: buildWeekLayout(2),
  3: buildWeekLayout(3),
  4: buildWeekLayout(4),
  5: buildWeekLayout(5),
  6: buildWeekLayout(6),
};

/** Días de entrenamiento por defecto cuando el atleta no configuró agenda. */
export const DEFAULT_DAYS_BY_LEVEL = {
  principiante: ["Lunes", "Miércoles", "Viernes"],
  intermedio: ["Lunes", "Miércoles", "Viernes", "Sábado"],
  avanzado: ["Lunes", "Martes", "Jueves", "Viernes", "Sábado"],
} as const;
