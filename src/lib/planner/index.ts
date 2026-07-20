// API pública del motor de reglas, con firmas espejo de src/lib/ai/ para que
// las rutas puedan elegir motor sin cambiar nada más.
import type { Athlete, Evaluation, Exercise } from "@/lib/types";
import type { AiMesocyclePlan } from "@/lib/ai/mesocycleSchema";
import { validateMesocyclePlan } from "@/lib/ai/generateMesocycle";
import { generateMesocyclePlan, RulesPlannerError } from "./generatePlan";

export const RULES_ENGINE_MODEL = "rules-engine/v1";

export { RulesPlannerError };
export { adjustMesocyclePlanRules } from "./adjustPlan";

export function generateInitialMesocyclePlanRules(
  athlete: Athlete,
  evaluation: Evaluation,
  exercises: Exercise[],
): { result: AiMesocyclePlan; model: string } {
  const result = generateMesocyclePlan({ athlete, evaluation, exercises, previousMesocycles: 0 });
  assertValid(result, exercises);
  return { result, model: RULES_ENGINE_MODEL };
}

export function generateNextMesocyclePlanRules(params: {
  athlete: Athlete;
  latestEvaluation: Evaluation | null;
  exercises: Exercise[];
  previousMesocycles: number;
}): { result: AiMesocyclePlan; model: string } {
  const result = generateMesocyclePlan({
    athlete: params.athlete,
    evaluation: params.latestEvaluation,
    exercises: params.exercises,
    previousMesocycles: params.previousMesocycles,
  });
  assertValid(result, params.exercises);
  return { result, model: RULES_ENGINE_MODEL };
}

function assertValid(plan: AiMesocyclePlan, exercises: Exercise[]) {
  const issues = validateMesocyclePlan(plan, exercises);
  if (issues.length > 0) {
    throw new RulesPlannerError(`El plan generado por reglas no pasó la validación: ${issues.join(" ")}`);
  }
}
