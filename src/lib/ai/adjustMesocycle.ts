import { ADJUSTMENT_MODEL } from "./client";
import { AiAdjustmentSchema, type AiAdjustmentPlan } from "./mesocycleSchema";
import { buildSystemPrompt, buildAdjustmentUserPrompt } from "./mesocyclePrompt";
import { callWithValidation, MesocycleGenerationError } from "./generateMesocycle";
import type { Athlete, CheckIn, Exercise } from "@/lib/types";

export { MesocycleGenerationError };

export function validateAdjustmentPlan(plan: AiAdjustmentPlan, exercises: Exercise[], allowedWeekNumbers: number[]): string[] {
  const catalogNames = new Set(exercises.map((e) => e.name.trim().toLowerCase()));
  const allowed = new Set(allowedWeekNumbers);
  const issues: string[] = [];

  for (const week of plan.weeks) {
    if (!allowed.has(week.week_number)) {
      issues.push(`La semana ${week.week_number} no es una semana futura elegible -- no se puede ajustar.`);
      continue;
    }
    for (const day of week.days) {
      for (const block of day.blocks) {
        if (block.is_catalog_exercise) {
          if (!catalogNames.has(block.exercise_name.trim().toLowerCase())) {
            issues.push(`Semana ${week.week_number} ${day.day_of_week}: "${block.exercise_name}" no existe en el catálogo pero is_catalog_exercise=true.`);
          }
        } else if (!block.non_catalog_reason?.trim()) {
          issues.push(`Semana ${week.week_number} ${day.day_of_week}: "${block.exercise_name}" tiene is_catalog_exercise=false sin non_catalog_reason.`);
        }
      }
    }
  }

  return issues;
}

export async function adjustMesocyclePlan(params: {
  athlete: Athlete;
  mesocycleName: string;
  checkin: CheckIn;
  recentCheckins: CheckIn[];
  finishedWeekBlocks: Parameters<typeof buildAdjustmentUserPrompt>[0]["finishedWeekBlocks"];
  futureWeeks: Parameters<typeof buildAdjustmentUserPrompt>[0]["futureWeeks"];
  exercises: Exercise[];
}) {
  const allowedWeekNumbers = params.futureWeeks.map((w) => w.week_number);
  return callWithValidation({
    model: ADJUSTMENT_MODEL,
    system: buildSystemPrompt(params.exercises),
    userPrompt: buildAdjustmentUserPrompt(params),
    schema: AiAdjustmentSchema,
    validate: (plan) => validateAdjustmentPlan(plan, params.exercises, allowedWeekNumbers),
    maxTokens: 8000,
  });
}
