import type { Mesocycle, Week } from "@/lib/types";

export function computeCurrentWeek(mesocycle: Mesocycle, weeks: Week[]): Week | null {
  if (weeks.length === 0) return null;
  if (!mesocycle.start_date) return weeks[0];
  const start = new Date(mesocycle.start_date);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const idx = Math.min(Math.max(Math.floor(diffDays / 7), 0), weeks.length - 1);
  return weeks[idx] ?? weeks[0];
}
