import { z } from "zod";
import { DAYS_OF_WEEK, EXERCISE_CATEGORIES } from "@/lib/types";

export const AiBlockSchema = z.object({
  exercise_name: z.string(),
  is_catalog_exercise: z.boolean(),
  non_catalog_reason: z
    .string()
    .nullable()
    .describe("Obligatorio (no null) si is_catalog_exercise es false: por qué este bloque no es un ejercicio del catálogo."),
  category: z.enum(EXERCISE_CATEGORIES),
  rpe_target: z.string().nullable(),
  sets: z.string().nullable(),
  reps_or_time: z.string().nullable(),
  time: z.string().nullable(),
  load: z.string().nullable(),
  rest: z.string().nullable(),
  kinesio_notes: z.string().nullable(),
  routine_name: z
    .string()
    .nullable()
    .describe("Nombre de la Rutina de origen si este bloque es parte de una rutina de calentamiento (ej. 'General Warm Up'); null para un ejercicio suelto."),
});
export type AiBlock = z.infer<typeof AiBlockSchema>;

export const AiDaySchema = z.object({
  day_of_week: z.enum(DAYS_OF_WEEK),
  day_focus: z.string().nullable(),
  is_rest: z.boolean(),
  blocks: z.array(AiBlockSchema),
});
export type AiDay = z.infer<typeof AiDaySchema>;

export const AiWeekSchema = z.object({
  // Fase 5a: mesociclo de 2 a 6 semanas (antes siempre 4) -- mismo rango que
  // microcycleTemplateFor en planner/knowledge/microcycles.ts. Sin este
  // límite ampliado, ajustar (vía checkin) un mesociclo que un entrenador
  // extendió a mano a 5-6 semanas rechazaría cualquier semana futura > 4.
  week_number: z.number().int().min(1).max(6),
  load_type: z.string(),
  focus: z.string().nullable(),
  distribution: z.string().nullable(),
  days: z.array(AiDaySchema).length(7),
});
export type AiWeek = z.infer<typeof AiWeekSchema>;

// Generación inicial y "siguiente mesociclo": 4 semanas por defecto, ajustable a 2-6 (Fase 5a).
export const AiMesocyclePlanSchema = z.object({
  name: z.string(),
  phase: z.string(),
  rationale: z.string().describe("Resumen del razonamiento kinesiológico detrás del plan, para logging/debug."),
  weeks: z.array(AiWeekSchema).min(2).max(6),
});
export type AiMesocyclePlan = z.infer<typeof AiMesocyclePlanSchema>;

// Ajuste por check-in: solo las semanas futuras que la IA decide tocar.
export const AiAdjustmentSchema = z.object({
  rationale: z.string().describe("Resumen de qué se ajustó y por qué, en base al check-in y los bloques reales."),
  weeks: z.array(AiWeekSchema),
});
export type AiAdjustmentPlan = z.infer<typeof AiAdjustmentSchema>;
