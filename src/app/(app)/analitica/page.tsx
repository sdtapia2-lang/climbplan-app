"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { Card, Spinner } from "@/components/ui";

type Stats = {
  adherencePct: number;
  avgRpe: number | null;
  completedBlocks: number;
  totalBlocks: number;
};

type WeekPoint = {
  key: string;
  label: string;
  pct: number;
};

function weekLabel(mesoStart: string | null, weekNumber: number): string {
  if (!mesoStart) return `S${weekNumber}`;
  const d = new Date(mesoStart);
  d.setDate(d.getDate() + (weekNumber - 1) * 7);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export default function AnalyticsPage() {
  const { athlete, athleteId } = useAthlete();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ adherencePct: 0, avgRpe: null, completedBlocks: 0, totalBlocks: 0 });
  const [weeklyAdherence, setWeeklyAdherence] = useState<WeekPoint[]>([]);

  useEffect(() => {
    if (!athleteId) return;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("mesocycles")
        .select("id, name, start_date, weeks(id, week_number, days(id, is_rest, blocks(completed, actual_rpe)))")
        .eq("athlete_id", athleteId)
        .order("start_date", { ascending: true });

      let total = 0;
      let completed = 0;
      let rpeSum = 0;
      let rpeCount = 0;
      const weekPoints: WeekPoint[] = [];

      for (const meso of data ?? []) {
        const weeksSorted = [...(meso.weeks ?? [])].sort((a, b) => a.week_number - b.week_number);
        for (const week of weeksSorted) {
          let weekTotal = 0;
          let weekCompleted = 0;
          for (const day of week.days ?? []) {
            if (day.is_rest) continue;
            for (const block of day.blocks ?? []) {
              total += 1;
              weekTotal += 1;
              if (block.completed) {
                completed += 1;
                weekCompleted += 1;
              }
              const rpe = parseFloat(block.actual_rpe ?? "");
              if (!isNaN(rpe)) {
                rpeSum += rpe;
                rpeCount += 1;
              }
            }
          }
          if (weekTotal > 0) {
            weekPoints.push({
              key: week.id,
              label: weekLabel(meso.start_date, week.week_number),
              pct: Math.round((weekCompleted / weekTotal) * 100),
            });
          }
        }
      }

      setStats({
        adherencePct: total > 0 ? Math.round((completed / total) * 100) : 0,
        avgRpe: rpeCount > 0 ? Math.round((rpeSum / rpeCount) * 10) / 10 : null,
        completedBlocks: completed,
        totalBlocks: total,
      });
      setWeeklyAdherence(weekPoints.slice(-6));
      setLoading(false);
    })();
  }, [athleteId]);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Analitica &mdash; {athlete?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <p className="font-[family-name:var(--font-heading)] text-3xl text-[var(--color-accent-700)]">{stats.adherencePct}%</p>
          <p className="text-sm text-[var(--color-text)]/55 mt-1">Adherencia promedio</p>
        </Card>
        <Card className="text-center">
          <p className="font-[family-name:var(--font-heading)] text-3xl text-[var(--color-accent-700)]">{stats.avgRpe ?? "—"}</p>
          <p className="text-sm text-[var(--color-text)]/55 mt-1">RPE promedio general</p>
        </Card>
        <Card className="text-center">
          <p className="font-[family-name:var(--font-heading)] text-3xl text-[var(--color-accent-700)]">{stats.completedBlocks}</p>
          <p className="text-sm text-[var(--color-text)]/55 mt-1">Bloques completados</p>
        </Card>
      </div>

      {weeklyAdherence.length > 0 && (
        <Card>
          <p className="text-sm font-medium mb-4">Adherencia semanal</p>
          <div className="flex items-end gap-3 h-40">
            {weeklyAdherence.map((w) => (
              <div key={w.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <span className="text-xs text-[var(--color-text)]/60">{w.pct}%</span>
                <div
                  className="w-full rounded-t-md bg-[var(--color-accent-500)]"
                  style={{ height: `${Math.max(w.pct, 3)}%` }}
                />
                <span className="text-[11px] text-[var(--color-text)]/50 mt-1">{w.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="text-xs text-[var(--color-text)]/40 mt-4">
        Calculado sobre {stats.totalBlocks} bloques de entrenamiento cargados en todos los mesociclos del atleta.
      </p>
    </div>
  );
}
