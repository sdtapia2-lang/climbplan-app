// Microciclos y fases destilados de los planes reales de referencia:
// - Noceti (Escalada/Físico Seba Tapia Kinup): microciclos Ajuste → Carga →
//   Choque → Descarga; físico RPE 5 (sem 1) → 6-7 (sem 2-3), series 3 → 4 en
//   Choque, descarga a menor frecuencia/volumen; ciclos Acumulación →
//   Transformación → Realización a lo largo de los mesociclos.
// - Fobital (Diego Sepúlveda Mar-Abr): descarga = 50% volumen y quizás
//   10-30% intensidad; máximo 2 días seguidos de carga.
// - Cata (Seba Dic-Ene): semana 1 de adaptación con menos frecuencia; subir
//   cargas máx. 10% por semana (al subir carga, bajar reps); descarga con 1
//   sola serie por ejercicio.
// - Diego/Plan para generar mesociclo.docx: estructura moderada → alta →
//   alta → descarga (50-60% volumen), tests de línea base en semana 1.

export type MicrocycleWeek = {
  week: 1 | 2 | 3 | 4;
  loadType: string;
  focus: string;
  /** Multiplicador de volumen sobre las series base del catálogo. */
  volumeMult: number;
  /** Corrimiento del RPE objetivo respecto del RPE base del ejercicio. */
  rpeShift: number;
  /** Tope duro de RPE para la semana (null = sin tope extra). */
  maxRpe: number | null;
  /** Si la semana admite tests (línea base solo en semana 1). */
  allowTests: boolean;
  /** Progresión de dedos con fingerboard: qué sube esta semana (nunca ambos). */
  fingerProgression: "base" | "load" | "volume" | "deload";
};

export const MICROCYCLE_TEMPLATE: readonly MicrocycleWeek[] = [
  {
    week: 1,
    loadType: "Ajuste",
    focus: "Adaptación y línea base",
    volumeMult: 0.85,
    rpeShift: -1,
    maxRpe: 7,
    allowTests: true,
    fingerProgression: "base",
  },
  {
    week: 2,
    loadType: "Carga",
    focus: "Progresión de carga",
    volumeMult: 1.0,
    rpeShift: 0,
    maxRpe: null,
    allowTests: false,
    fingerProgression: "load", // +5-10% carga, mismo volumen (regla Cata/Diego)
  },
  {
    week: 3,
    loadType: "Choque",
    focus: "Pico de volumen",
    volumeMult: 1.15,
    rpeShift: 0,
    maxRpe: null,
    allowTests: false,
    fingerProgression: "volume", // +1 serie, misma carga (Noceti/Cata: series 3→4)
  },
  {
    week: 4,
    loadType: "Descarga",
    focus: "Recuperación activa",
    volumeMult: 0.55, // Fobital/Diego: 50-60% del volumen
    rpeShift: -2,
    maxRpe: 6, // nunca testear máximos en descarga
    allowTests: false,
    fingerProgression: "deload",
  },
] as const;

// Fases de mesociclo (rotación entre mesociclos sucesivos), de los ciclos
// reales de Noceti: Acumulación (capacidad/volumen) → Transformación
// (fuerza/intensidad, Limit Bouldering) → Realización (rendimiento).
export type MesocyclePhase = {
  name: string;
  label: string;
  /** Foco de escalada dominante de la fase (reemplaza escalada_capacidad). */
  climbingEmphasis: "escalada_capacidad" | "escalada_intensidad" | "escalada_resistencia";
};

export const MESOCYCLE_PHASES: readonly MesocyclePhase[] = [
  { name: "Acumulación", label: "Base / Acumulación", climbingEmphasis: "escalada_capacidad" },
  { name: "Transformación", label: "Fuerza / Transformación", climbingEmphasis: "escalada_intensidad" },
  { name: "Realización", label: "Rendimiento / Realización", climbingEmphasis: "escalada_resistencia" },
] as const;

/** Mapa de typical_effort del catálogo → RPE base. */
export const EFFORT_TO_RPE: Record<string, number> = {
  "Very Easy Effort": 3,
  "Easy Effort": 5,
  "Moderate Effort": 6,
  "Hard Effort": 7,
  "Very Hard Effort": 8,
  "Speed and Power": 8,
  "Hard but playful": 7,
  "Moderate to Max": 7,
  Building: 8,
};

export const DEFAULT_RPE = 6;
