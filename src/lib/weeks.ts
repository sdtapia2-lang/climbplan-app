import type { Mesocycle, Week } from "@/lib/types";

/**
 * `start_date` viene como "YYYY-MM-DD" y `new Date(iso)` lo interpreta como
 * medianoche UTC, mientras que `new Date()` es hora local. Restar uno del otro
 * mezclaba husos: en UTC-4 la semana cambiaba a las 20:00 del día anterior.
 * Anclando ambos a medianoche local, el cambio de semana ocurre cuando cambia
 * el día del calendario del atleta.
 */
function localMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Días de calendario transcurridos desde el inicio. Se redondea en vez de
 * truncar porque un cambio de horario de verano deja diferencias de 23 o 25
 * horas entre dos medianoches locales, y truncar perdería un día entero.
 */
export function daysSinceStart(startDate: string, today: Date = new Date()): number {
  const diffMs = localMidnight(today).getTime() - parseLocalDate(startDate).getTime();
  return Math.round(diffMs / 86400000);
}

/** Índice (base 0) de la semana en curso según la fecha. Puede exceder el total si el mesociclo ya terminó. */
export function weeksElapsed(startDate: string, today: Date = new Date()): number {
  return Math.floor(daysSinceStart(startDate, today) / 7);
}

export function computeCurrentWeek(mesocycle: Mesocycle, weeks: Week[]): Week | null {
  if (weeks.length === 0) return null;
  if (!mesocycle.start_date) return weeks[0];
  const idx = Math.min(Math.max(weeksElapsed(mesocycle.start_date), 0), weeks.length - 1);
  return weeks[idx] ?? weeks[0];
}

/** True si la fecha de hoy ya pasó la última semana planificada. */
export function isMesocycleOver(mesocycle: Mesocycle, weeks: Week[], today: Date = new Date()): boolean {
  if (!mesocycle.start_date || weeks.length === 0) return false;
  return weeksElapsed(mesocycle.start_date, today) > weeks.length - 1;
}
