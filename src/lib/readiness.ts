// Puntaje de disponibilidad pre-sesión (Fase 1.2). Pedido explícito de Rorro:
// "autoevaluación pre-sesión con puntaje... que ayuda a graduar la sesión".
//
// Los umbrales de sueño/motivación replican `lowRecovery` en
// src/lib/planner/adjustPlan.ts (sleep_quality <= 4 || motivation <= 4) para
// que el ajuste semanal por check-in y esta sugerencia inmediata nunca se
// contradigan. La fatiga de dedos pesa aparte: Rorro la pidió diferenciada
// porque en escalada un dedo cargado no es lo mismo que fatiga general.
//
// Este score es solo una sugerencia mostrada al atleta antes de empezar la
// sesión — nunca modifica el plan por su cuenta (eso lo sigue haciendo
// /api/adjust-mesocycle sobre el check-in semanal real).

export type ReadinessInput = {
  sleep_quality: number | null; // 0-10
  fatigue_general: number | null; // 0-10
  fatigue_fingers: number | null; // 0-10
  motivation: number | null; // 0-10
};

export type ReadinessResult = {
  score: number; // 0-100
  suggestion: string | null;
};

function penalty(value: number | null, mid: number, high: number, midCost: number, highCost: number): number {
  if (value == null) return 0;
  if (value >= high) return highCost;
  if (value >= mid) return midCost;
  return 0;
}

export function computeReadiness(input: ReadinessInput): ReadinessResult {
  let score = 100;

  // Sueño va invertido (menos calidad = peor), el resto es "cuánto molesta".
  const sleepDeficit = input.sleep_quality == null ? null : 10 - input.sleep_quality;
  score -= penalty(sleepDeficit, 4, 6, 10, 25); // sleep_quality <= 6 → -10; <= 4 → -25
  score -= penalty(input.fatigue_general, 5, 7, 10, 25);
  score -= penalty(input.fatigue_fingers, 5, 7, 8, 15);
  const motivationDeficit = input.motivation == null ? null : 10 - input.motivation;
  score -= penalty(motivationDeficit, 4, 6, 5, 15); // motivation <= 6 → -5; <= 4 → -15

  score = Math.max(0, Math.min(100, Math.round(score)));

  let suggestion: string | null = null;
  if (score < 40) {
    suggestion = "Bajá el RPE de hoy y considerá cortar la sesión antes si aparece dolor.";
  } else if (score < 65) {
    suggestion = "Arrancá con el calentamiento y ajustá el RPE según cómo te sientas en las primeras series.";
  }

  return { score, suggestion };
}
