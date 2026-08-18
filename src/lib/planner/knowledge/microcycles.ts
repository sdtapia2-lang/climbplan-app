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
  week: 1 | 2 | 3 | 4 | 5 | 6;
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

/**
 * Microciclo de N semanas (2-6, Fase 5a -- Rorro: "microciclo 7, puede bajar
 * a 5 o 3; mesociclo ~4 semanas, puede acortarse a 2-3"). Primera semana
 * siempre Ajuste, última siempre Descarga (nunca se testean máximos ahí); las
 * semanas intermedias suben el volumen linealmente de Carga (1.0x, igual que
 * antes) a Choque (1.15x, el pico justo antes de la descarga, mismo valor
 * que el mesociclo de referencia de 4 semanas usaba en su semana 3) -- con
 * weekCount=4 este algoritmo reproduce exactamente los 4 valores fijos que
 * tenía este módulo antes de generalizarse.
 */
export function microcycleTemplateFor(weekCount: number): MicrocycleWeek[] {
  const n = Math.min(6, Math.max(2, Math.round(weekCount)));
  const middleCount = n - 2;
  const weeks: MicrocycleWeek[] = [
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
  ];
  for (let i = 0; i < middleCount; i++) {
    const isPeak = i === middleCount - 1 && middleCount > 1;
    const t = middleCount <= 1 ? 0 : i / (middleCount - 1);
    weeks.push({
      week: (i + 2) as MicrocycleWeek["week"],
      loadType: isPeak ? "Choque" : "Carga",
      focus: isPeak ? "Pico de volumen" : "Progresión de carga",
      volumeMult: 1.0 + t * 0.15,
      rpeShift: 0,
      maxRpe: null,
      allowTests: false,
      fingerProgression: isPeak ? "volume" : "load", // Noceti/Cata: series 3→4 en el pico; +5-10% carga en las intermedias
    });
  }
  weeks.push({
    week: n as MicrocycleWeek["week"],
    loadType: "Descarga",
    focus: "Recuperación activa",
    volumeMult: 0.55, // Fobital/Diego: 50-60% del volumen
    rpeShift: -2,
    maxRpe: 6, // nunca testear máximos en descarga
    allowTests: false,
    fingerProgression: "deload",
  });
  return weeks;
}

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
