// Estima la duración de un bloque/sesión de entrenamiento a partir de los
// campos ya prescritos (sets, reps_or_time, time, rest), sin depender de un
// campo de duración separado que el plan no guarda. Cubre los formatos reales
// del catálogo/motor de reglas: "8 reps", "60s", "8s x 6 reps", "20m" (ARC
// continuo), etc.
import { parseRestSeconds, parseSetsCount } from "./parseRest";

type TimedBlock = {
  sets: string | null;
  reps_or_time: string | null;
  time: string | null;
  rest: string | null;
};

/** Segundos de trabajo por serie, y si el texto describe una duración continua
 * (ej. "20m" de ARC) en vez de un ritmo serie a serie. */
function parseWorkSecondsPerSet(
  reps_or_time: string | null,
  time: string | null,
): { seconds: number; isContinuous: boolean } {
  const text = (reps_or_time || time || "").toLowerCase().trim();
  if (!text) return { seconds: 30, isContinuous: false };

  // "8s x 6 reps" / "60s x 4 reps" — tiempo por repetición x cantidad de reps
  const perRepMatch = text.match(/(\d+)\s*s\s*x\s*(\d+)\s*reps?/);
  if (perRepMatch) {
    return { seconds: Number(perRepMatch[1]) * Number(perRepMatch[2]), isContinuous: false };
  }

  // Solo número de reps ("8 reps", "10 reps") — peso corporal, ritmo ~3s/rep
  const repsOnlyMatch = text.match(/^(\d+)\s*reps?$/);
  if (repsOnlyMatch) {
    return { seconds: Number(repsOnlyMatch[1]) * 3, isContinuous: false };
  }

  // Duración continua tipo ARC/aeróbico ("20m", "60m") sin "x reps"
  const minMatch = text.match(/^(\d+)\s*m(?:in)?$/);
  if (minMatch) {
    return { seconds: Number(minMatch[1]) * 60, isContinuous: true };
  }

  // Segundos sueltos ("30s", "60s") — hold único
  const secMatch = text.match(/^(\d+)\s*s(?:eg)?$/);
  if (secMatch) {
    return { seconds: Number(secMatch[1]), isContinuous: false };
  }

  return { seconds: 30, isContinuous: false };
}

/** Minutos estimados para un bloque: series x (trabajo + descanso entre series). */
export function estimateBlockMinutes(block: TimedBlock): number {
  const { seconds: workSeconds, isContinuous } = parseWorkSecondsPerSet(block.reps_or_time, block.time);
  if (isContinuous) {
    return Math.max(1, Math.round(workSeconds / 60));
  }
  const sets = parseSetsCount(block.sets);
  const restSeconds = parseRestSeconds(block.rest) ?? 60;
  const totalSeconds = sets * workSeconds + Math.max(0, sets - 1) * restSeconds;
  return Math.max(1, Math.round(totalSeconds / 60));
}

/** Minutos estimados para toda una sesión (suma de sus bloques). */
export function estimateSessionMinutes(blocks: TimedBlock[]): number {
  return blocks.reduce((sum, b) => sum + estimateBlockMinutes(b), 0);
}
