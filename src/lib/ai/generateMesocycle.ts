import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { createAnthropicClient, INITIAL_GENERATION_MODEL } from "./client";
import { AiMesocyclePlanSchema, type AiMesocyclePlan, type AiWeek } from "./mesocycleSchema";
import { buildSystemPrompt, buildInitialUserPrompt, buildNextMesocycleUserPrompt } from "./mesocyclePrompt";
import type { Athlete, Evaluation, Exercise } from "@/lib/types";

export class MesocycleGenerationError extends Error {}

function countBlocks(week: AiWeek): number {
  return week.days.reduce((sum, d) => sum + d.blocks.length, 0);
}

export function validateMesocyclePlan(plan: AiMesocyclePlan, exercises: Exercise[]): string[] {
  const catalogNames = new Set(exercises.map((e) => e.name.trim().toLowerCase()));
  const issues: string[] = [];

  for (const week of plan.weeks) {
    let restDays = 0;
    for (const day of week.days) {
      if (day.is_rest) restDays++;
      for (const block of day.blocks) {
        if (block.is_catalog_exercise) {
          if (!catalogNames.has(block.exercise_name.trim().toLowerCase())) {
            issues.push(`Semana ${week.week_number} ${day.day_of_week}: "${block.exercise_name}" no existe en el catalogo pero is_catalog_exercise=true.`);
          }
        } else if (!block.non_catalog_reason?.trim()) {
          issues.push(`Semana ${week.week_number} ${day.day_of_week}: "${block.exercise_name}" tiene is_catalog_exercise=false sin non_catalog_reason.`);
        }
      }
    }
    if (restDays < 1) {
      issues.push(`Semana ${week.week_number}: no tiene ningun dia de descanso (is_rest=true).`);
    }
  }

  const w3 = plan.weeks.find((w) => w.week_number === 3);
  const w4 = plan.weeks.find((w) => w.week_number === 4);
  if (w3 && w4 && countBlocks(w4) > countBlocks(w3)) {
    issues.push(`La semana 4 (descarga) tiene mas bloques (${countBlocks(w4)}) que la semana 3 (${countBlocks(w3)}) -- deberia ser una semana de menor volumen.`);
  }

  return issues;
}

/**
 * Llama a Claude con un schema Zod, valida el resultado con reglas de
 * negocio que el JSON schema no puede expresar, y reintenta una vez con un
 * mensaje correctivo si la validacion falla. Compartido entre la
 * generacion inicial/siguiente y el ajuste semanal.
 */
export async function callWithValidation<T>(params: {
  model: string;
  system: ReturnType<typeof buildSystemPrompt>;
  userPrompt: string;
  schema: z.ZodType<T>;
  validate: (parsed: T) => string[];
  maxTokens?: number;
}): Promise<{ result: T; model: string }> {
  const client = createAnthropicClient();
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: params.userPrompt }];
  const format = zodOutputFormat(params.schema);

  for (let attempt = 0; attempt < 2; attempt++) {
    let response;
    try {
      response = await client.messages.parse({
        model: params.model,
        max_tokens: params.maxTokens ?? 16000,
        system: params.system,
        messages,
        output_config: { format },
      });
    } catch (err) {
      throw new MesocycleGenerationError(err instanceof Error ? err.message : "Error llamando a la API de Claude.");
    }

    if (response.stop_reason === "refusal") {
      throw new MesocycleGenerationError("Claude rechazo generar el plan para este pedido.");
    }
    if (!response.parsed_output) {
      throw new MesocycleGenerationError("La IA no devolvio una respuesta con el formato esperado.");
    }

    const issues = params.validate(response.parsed_output);
    if (issues.length === 0) {
      return { result: response.parsed_output, model: params.model };
    }
    if (attempt === 1) {
      throw new MesocycleGenerationError(`El plan generado no paso la validacion despues de un reintento: ${issues.join(" ")}`);
    }
    messages.push({ role: "assistant", content: JSON.stringify(response.parsed_output) });
    messages.push({
      role: "user",
      content: `Tu respuesta anterior tiene estos problemas, corregilos y devolve el JSON de nuevo, completo:\n${issues.map((i) => `- ${i}`).join("\n")}`,
    });
  }
  throw new MesocycleGenerationError("No se pudo generar un plan valido.");
}

export async function generateInitialMesocyclePlan(athlete: Athlete, evaluation: Evaluation, exercises: Exercise[]) {
  return callWithValidation({
    model: INITIAL_GENERATION_MODEL,
    system: buildSystemPrompt(exercises),
    userPrompt: buildInitialUserPrompt(athlete, evaluation),
    schema: AiMesocyclePlanSchema,
    validate: (plan) => validateMesocyclePlan(plan, exercises),
  });
}

export async function generateNextMesocyclePlan(
  athlete: Athlete,
  latestEvaluation: Evaluation | null,
  pastMesocyclesSummary: string,
  allCheckinsSummary: string,
  exercises: Exercise[],
) {
  return callWithValidation({
    model: INITIAL_GENERATION_MODEL,
    system: buildSystemPrompt(exercises),
    userPrompt: buildNextMesocycleUserPrompt({ athlete, latestEvaluation, pastMesocyclesSummary, allCheckinsSummary }),
    schema: AiMesocyclePlanSchema,
    validate: (plan) => validateMesocyclePlan(plan, exercises),
  });
}
