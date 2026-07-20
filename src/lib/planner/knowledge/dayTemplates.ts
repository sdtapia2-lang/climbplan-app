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
};

export type DayTemplate = {
  label: string; // day_focus visible
  slots: DaySlot[];
};

export const DAY_TEMPLATES: Record<DayFocus, DayTemplate> = {
  escalada_capacidad: {
    // Noceti "Capacidad Boulder" / ARC: volumen de escalada a intensidad media
    label: "Escalada - capacidad y técnica",
    slots: [
      { category: "Aerobic Base", count: 1 },
      { category: "Flexibility", count: 1, preferTags: ["mobility"] },
    ],
  },
  escalada_intensidad: {
    // Noceti "Boulder Corto"/"Limit" + Fobital "boulder duro": fuerza/potencia
    label: "Escalada - fuerza e intensidad",
    slots: [
      { category: "Strength and Power", count: 1, preferTags: ["climbing"] },
      { category: "Flexibility", count: 1, preferTags: ["mobility"] },
    ],
  },
  escalada_resistencia: {
    // Noceti "Boulder Largo" / Cata "Resistencia": fuerza-resistencia
    label: "Escalada - resistencia",
    slots: [
      { category: "Power Endurance", count: 1 },
      { category: "Flexibility", count: 1, preferTags: ["mobility"] },
    ],
  },
  dedos_fuerza: {
    // Cata: protocolo de dedos en regleta + antagonistas de antebrazo
    label: "Fuerza de dedos y antagonistas",
    slots: [
      { category: "Fingerboard", count: 1 },
      { category: "Conditioning", count: 1, requireTags: ["finger_extensors"] },
      { category: "Conditioning", count: 1, requireTags: ["core"] },
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
      { category: "Flexibility", count: 1, preferTags: ["mobility"] },
    ],
  },
  movilidad: {
    label: "Movilidad y recuperación",
    slots: [{ category: "Flexibility", count: 2, preferTags: ["mobility"] }],
  },
};

// Orden de focos por cantidad de días disponibles. La fase del mesociclo
// puede reemplazar escalada_capacidad por su énfasis (ver skeleton.ts). La
// disciplina ajusta: Deportiva prioriza resistencia, Boulder intensidad.
export const WEEK_LAYOUTS: Record<number, DayFocus[]> = {
  2: ["escalada_capacidad", "fisico_fuerza"],
  3: ["escalada_capacidad", "fisico_fuerza", "escalada_intensidad"],
  4: ["escalada_capacidad", "fisico_fuerza", "escalada_intensidad", "dedos_fuerza"],
  5: ["escalada_capacidad", "fisico_fuerza", "escalada_intensidad", "dedos_fuerza", "fisico_core_antagonistas"],
  6: [
    "escalada_capacidad",
    "fisico_fuerza",
    "escalada_intensidad",
    "dedos_fuerza",
    "escalada_resistencia",
    "fisico_core_antagonistas",
  ],
};

/** Días de entrenamiento por defecto cuando el atleta no configuró agenda. */
export const DEFAULT_DAYS_BY_LEVEL = {
  principiante: ["Lunes", "Miércoles", "Viernes"],
  intermedio: ["Lunes", "Miércoles", "Viernes", "Sábado"],
  avanzado: ["Lunes", "Martes", "Jueves", "Viernes", "Sábado"],
} as const;
