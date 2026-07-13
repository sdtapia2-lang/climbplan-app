export type Athlete = {
  id: string;
  name: string;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  wingspan_cm: number | null;
  boulder_indoor_max: string | null;
  boulder_outdoor_max: string | null;
  sport_indoor_max: string | null;
  sport_outdoor_max: string | null;
  consolidated_grade: string | null;
  climbing_style: string | null;
  strengths: string | null;
  weaknesses: string | null;
  main_goal: string | null;
  secondary_goal: string | null;
  current_limiter: string | null;
  periodization_format: string | null;
  target_horizon: string | null;
  equipment: string[];
  has_active_injury: boolean;
  injury_location: string | null;
  injury_description: string | null;
  injury_diagnosis: string | null;
  injury_since: string | null;
  injury_restrictions: string | null;
  pain_threshold: number | null;
  injury_strapping: string | null;
  injury_professional_notes: string | null;
  injury_history: { injury: string; year: string; status: string }[];
  medical_conditions: string | null;
  general_notes: string | null;
  transversal_rules: string | null;
  created_at: string;
  updated_at: string;
};

export const EXERCISE_CATEGORIES = [
  "Aerobic Base",
  "Conditioning",
  "Power Endurance",
  "Strength and Power",
  "Flexibility",
  "Otro",
] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const EQUIPMENT_OPTIONS = [
  "Pared boulder",
  "Campus board",
  "Fingerboard",
  "Tension/Kilter/Moonboard",
  "Barra dominadas",
  "Pesas",
  "Tindeq Progressor",
  "Banda elastica",
  "Poleas",
  "Spray wall",
] as const;

export type Exercise = {
  id: string;
  name: string;
  category: string;
  equipment_required: string[];
  typical_sets: string | null;
  typical_reps: string | null;
  typical_time: string | null;
  typical_duration: string | null;
  typical_effort: string | null;
  description: string | null;
  is_benchmark: boolean;
  created_at: string;
};

export type Mesocycle = {
  id: string;
  athlete_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  phase: string | null;
  status: string;
  ref_weight_kg: number | null;
  max_rpe_week: number | null;
  created_at: string;
  updated_at: string;
};

export type Week = {
  id: string;
  mesocycle_id: string;
  week_number: number;
  load_type: string | null;
  focus: string | null;
  distribution: string | null;
};

export const DAYS_OF_WEEK = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
] as const;

export type Day = {
  id: string;
  week_id: string;
  day_of_week: string;
  day_focus: string | null;
  is_rest: boolean;
  position: number;
};

export type Block = {
  id: string;
  day_id: string;
  exercise_id: string | null;
  exercise_name_freetext: string | null;
  category: string | null;
  rpe_target: string | null;
  sets: string | null;
  reps_or_time: string | null;
  time: string | null;
  load: string | null;
  rest: string | null;
  kinesio_notes: string | null;
  position: number;
  actual_sets: string | null;
  actual_reps_or_time: string | null;
  actual_load: string | null;
  actual_rpe: string | null;
  pain_during: number | null;
  comment: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

export type Evaluation = {
  id: string;
  athlete_id: string;
  eval_date: string;
  weight_kg: number | null;
  height_cm: number | null;
  wingspan_cm: number | null;
  health_screening: Record<string, boolean>;
  pain_by_zone: Record<string, number>;
  shoulder_ir: string | null;
  shoulder_er: string | null;
  wrist_mobility: string | null;
  deep_squat: boolean | null;
  thomas_test: string | null;
  mobility_notes: string | null;
  pullups_max: string | null;
  horizontal_push: string | null;
  plank_seconds: number | null;
  lsit_seconds: number | null;
  vertical_jump_cm: number | null;
  left_mvc_kg: number | null;
  left_mvc_bw_pct: number | null;
  left_cf_reps: number | null;
  left_cf_avg_force_kg: number | null;
  left_cf_drop_pct: number | null;
  left_rfd_100: number | null;
  left_rfd_150: number | null;
  left_rfd_200: number | null;
  left_rfd_250: number | null;
  right_mvc_kg: number | null;
  right_mvc_bw_pct: number | null;
  right_cf_reps: number | null;
  right_cf_avg_force_kg: number | null;
  right_cf_drop_pct: number | null;
  right_rfd_100: number | null;
  right_rfd_150: number | null;
  right_rfd_200: number | null;
  right_rfd_250: number | null;
  asymmetry_mvc_pct: number | null;
  asymmetry_cf_pct: number | null;
  arc_duration_min: number | null;
  arc_rpe: number | null;
  arc_completed: boolean | null;
  endurance_notes: string | null;
  boulder_redpoint: string | null;
  boulder_onsight: string | null;
  sport_redpoint: string | null;
  sport_onsight: string | null;
  summary_flags: { area: string; finding: string; implication: string }[];
  evaluator_notes: string | null;
  created_at: string;
};

export const PAIN_ZONES = [
  ["shoulder_l", "Hombro izq"],
  ["shoulder_r", "Hombro der"],
  ["elbow_l", "Codo izq"],
  ["elbow_r", "Codo der"],
  ["wrist_l", "Muneca izq"],
  ["wrist_r", "Muneca der"],
  ["fingers_l", "Dedos izq"],
  ["fingers_r", "Dedos der"],
  ["low_back", "Espalda baja"],
  ["knee_l", "Rodilla izq"],
  ["knee_r", "Rodilla der"],
] as const;

export type CheckIn = {
  id: string;
  athlete_id: string;
  week_id: string | null;
  checkin_date: string;
  sleep_quality: number | null;
  motivation: number | null;
  adherence_pct: number | null;
  pain_by_zone: Record<string, number>;
  comment: string | null;
  created_at: string;
};
