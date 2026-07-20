import type { Athlete, Evaluation, Exercise } from "@/lib/types";

// Zonas de dolor normalizadas (las keys de evaluación son estas mismas; las de
// check-in vienen con sufijo _l/_r y se normalizan a estas).
export const PAIN_ZONE_GROUPS = ["fingers", "wrist", "elbow", "shoulder", "low_back", "knee"] as const;
export type PainZoneGroup = (typeof PAIN_ZONE_GROUPS)[number];

// Tags funcionales de un ejercicio (para garantías estructurales y selección).
export type Tag =
  | "pull"
  | "push"
  | "core"
  | "legs"
  | "unilateral"
  | "finger_extensors"
  | "shoulder_stability"
  | "climbing"
  | "fingers"
  | "mobility"
  | "power"
  | "test";

// Foco de un día de entrenamiento (slot del esqueleto semanal).
export type DayFocus =
  | "escalada_capacidad"
  | "escalada_intensidad"
  | "escalada_resistencia"
  | "dedos_fuerza"
  | "fisico_fuerza"
  | "fisico_core_antagonistas"
  | "movilidad";

export type Level = "principiante" | "intermedio" | "avanzado";

export type Deficits = {
  fingerStrength: boolean;
  fingerEndurance: boolean;
  aerobicBase: boolean;
  asymmetry: boolean;
  coreStability: boolean;
  mobility: boolean;
};

export type BaselineNeed = "finger_max" | "critical_force" | "arc" | "pullup_max";

export type Restriction = {
  zone: PainZoneGroup;
  level: number; // 0-10 (dolor reportado o severidad estimada de la lesión)
  source: string; // texto para kinesio_notes (ej. "lesión activa: hombro", "dolor 6/10 en evaluación")
};

export type PlannerProfile = {
  level: Level;
  discipline: "Boulder" | "Deportiva" | "Ambas";
  deficits: Deficits;
  missingBaselines: BaselineNeed[];
  restrictions: Restriction[];
  conservative: boolean; // health_screening positivo → RPE cap 7, sin tests máximos
  trainingDays: string[]; // subset de DAYS_OF_WEEK, ordenado Lun→Dom
  equipment: Set<string>; // normalizado (lowercase, sin acentos)
  hasFingerboard: boolean;
  hasTindeq: boolean;
  transversalRules: string | null;
  weightKg: number | null;
  weightedPullupKg: number | null;
  benchPressKg: number | null;
  deadliftKg: number | null;
  maxMvcKg: number | null; // mayor MVC de ambas manos
};

export type WeekSkeletonDay = {
  dayOfWeek: string;
  focus: DayFocus | null; // null → descanso
};

export type WeekSkeleton = {
  weekNumber: 1 | 2 | 3 | 4;
  loadType: string;
  volumeMult: number;
  rpeShift: number;
  maxRpe: number | null;
  allowTests: boolean;
  days: WeekSkeletonDay[]; // 7 entradas, Lunes→Domingo
};

export type PlannerInput = {
  athlete: Athlete;
  evaluation: Evaluation | null;
  exercises: Exercise[];
  /** Cantidad de mesociclos previos del atleta (rotación de fase y variedad). */
  previousMesocycles: number;
};
