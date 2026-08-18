import { DAYS_OF_WEEK } from "./types";

/**
 * Antes de este módulo había tres definiciones de adherencia distintas y
 * contradictorias: el dashboard del entrenador contaba todos los bloques del
 * mesociclo activo (incluidas semanas futuras, lo que hacía que una semana 1
 * perfecta mostrara ~25%), /analitica contaba el histórico completo de todos
 * los mesociclos, y checkins.adherence_pct es un tercer número, autorreportado
 * por el atleta. Este módulo unifica el cálculo objetivo (a partir de
 * blocks.completed) en un solo lugar; el autorreportado se mantiene aparte y
 * rotulado como tal en la UI -- la diferencia entre ambos es la señal de
 * honestidad que interesa mostrarle al entrenador.
 */

type AdherenceBlock = { completed: boolean | null };
type AdherenceDay = { is_rest: boolean; blocks: AdherenceBlock[] | null };
type AdherenceWeek = { week_number: number; days: AdherenceDay[] | null };
type AdherenceMesocycle = { start_date: string | null; weeks: AdherenceWeek[] | null };

export type AdherenceScope = "elapsed" | "lifetime";

export type AdherenceResult = {
  completed: number;
  total: number;
  /** null si no hay ningún bloque contable (mesociclo vacío o todo semanas futuras). */
  pct: number | null;
};

/**
 * Número de semana que ya empezó según la fecha de hoy, con la misma
 * aritmética que src/lib/weeks.ts:computeCurrentWeek (día 0-6 => semana 1,
 * día 7-13 => semana 2, etc.), acotado a la última semana existente. Sin
 * start_date no hay forma de saber qué semana es "hoy", así que se asume
 * conservadoramente que solo la primera semana venció -- mismo fallback que
 * computeCurrentWeek ya usa.
 */
function elapsedWeekNumber(startDate: string | null, weeks: { week_number: number }[]): number | null {
  if (weeks.length === 0) return null;
  const sorted = [...weeks].sort((a, b) => a.week_number - b.week_number);
  if (!startDate) return sorted[0].week_number;
  const start = new Date(startDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const idx = Math.min(Math.max(Math.floor(diffDays / 7), 0), sorted.length - 1);
  return sorted[idx]?.week_number ?? sorted[0].week_number;
}

/**
 * Calcula adherencia (bloques completados / bloques totales, excluyendo días
 * de descanso) sobre uno o más mesociclos.
 *
 * - scope "elapsed" (default): solo cuenta semanas que ya empezaron respecto a
 *   hoy. Es lo que debe usar cualquier pantalla que muestre "cómo viene" un
 *   mesociclo en curso -- si no, un atleta perfecto en semana 1 de 4 arranca
 *   en ~25% sin haber fallado nada.
 * - scope "lifetime": cuenta todo, semanas futuras incluidas. Útil para un
 *   resumen histórico de mesociclos ya completados, donde no hay "futuro" que
 *   distorsione el número.
 */
export function computeAdherence(
  mesocycles: AdherenceMesocycle[],
  opts: { scope?: AdherenceScope } = {},
): AdherenceResult {
  const scope = opts.scope ?? "elapsed";
  let total = 0;
  let completed = 0;
  for (const meso of mesocycles) {
    const weeks = meso.weeks ?? [];
    const cutoff = scope === "elapsed" ? elapsedWeekNumber(meso.start_date, weeks) : null;
    for (const week of weeks) {
      if (cutoff !== null && week.week_number > cutoff) continue;
      for (const day of week.days ?? []) {
        if (day.is_rest) continue;
        for (const block of day.blocks ?? []) {
          total += 1;
          if (block.completed) completed += 1;
        }
      }
    }
  }
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : null };
}

/**
 * Fecha calendario en la que "debería" caer un día de un mesociclo, a partir
 * de su fecha de inicio + semana + nombre de día. Hoy el código nunca calcula
 * esto en ningún lado, y es lo que hace falta para detectar el caso real que
 * describió un entrenador en las entrevistas: un atleta que cambia el orden o
 * la frecuencia de sus sesiones sin avisar, cosa que "días vencidos vs.
 * completados" no distingue de "entrenó otro día de la semana".
 */
export function plannedDateForDay(
  mesocycleStartDate: string | null,
  weekNumber: number,
  dayOfWeek: string,
): Date | null {
  if (!mesocycleStartDate) return null;
  const dayIdx = DAYS_OF_WEEK.indexOf(dayOfWeek as (typeof DAYS_OF_WEEK)[number]);
  if (dayIdx === -1) return null;
  const start = new Date(mesocycleStartDate);
  const offsetDays = (weekNumber - 1) * 7 + dayIdx;
  const planned = new Date(start);
  planned.setDate(planned.getDate() + offsetDays);
  return planned;
}
