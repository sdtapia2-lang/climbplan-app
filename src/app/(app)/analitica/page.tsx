"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { RequireRole } from "@/components/ProfileProvider";
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
  avgRpe: number | null;
};

type PainPoint = {
  key: string;
  label: string;
  avgPain: number;
};

function weekLabel(mesoStart: string | null, weekNumber: number): string {
  if (!mesoStart) return `S${weekNumber}`;
  const d = new Date(mesoStart);
  d.setDate(d.getDate() + (weekNumber - 1) * 7);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export default function AnalyticsPage() {
  return (
    <RequireRole roles={["admin", "entrenador"]} redirectTo="/">
      <AnalyticsPanel />
    </RequireRole>
  );
}

function AnalyticsPanel() {
  const { athlete, athleteId } = useAthlete();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ adherencePct: 0, avgRpe: null, completedBlocks: 0, totalBlocks: 0 });
  const [weeklyAdherence, setWeeklyAdherence] = useState<WeekPoint[]>([]);
  const [painTrend, setPainTrend] = useState<PainPoint[]>([]);

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
          let weekRpeSum = 0;
          let weekRpeCount = 0;
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
                weekRpeSum += rpe;
                weekRpeCount += 1;
              }
            }
          }
          if (weekTotal > 0) {
            weekPoints.push({
              key: week.id,
              label: weekLabel(meso.start_date, week.week_number),
              pct: Math.round((weekCompleted / weekTotal) * 100),
              avgRpe: weekRpeCount > 0 ? Math.round((weekRpeSum / weekRpeCount) * 10) / 10 : null,
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

      const { data: checkinRows } = await supabase
        .from("checkins")
        .select("id, checkin_date, pain_by_zone")
        .eq("athlete_id", athleteId)
        .order("checkin_date", { ascending: true });
      const painPoints: PainPoint[] = (checkinRows ?? []).map((c) => {
        const values = Object.values((c.pain_by_zone as Record<string, number>) ?? {});
        const avgPain = values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
        const d = new Date(c.checkin_date);
        return { key: c.id, label: d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }), avgPain };
      });
      setPainTrend(painPoints.slice(-8));

      setLoading(false);
    })();
  }, [athleteId]);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Analítica &mdash; {athlete?.name}</h1>
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

      {weeklyAdherence.some((w) => w.avgRpe !== null) && (
        <Card className="mt-4">
          <p className="text-sm font-medium mb-4">RPE real promedio por semana</p>
          <div className="flex items-end gap-3 h-40">
            {weeklyAdherence.map((w) => (
              <div key={w.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <span className="text-xs text-[var(--color-text)]/60">{w.avgRpe ?? "—"}</span>
                <div
                  className="w-full rounded-t-md bg-[var(--color-accent-700)]"
                  style={{ height: `${Math.max(((w.avgRpe ?? 0) / 10) * 100, 3)}%` }}
                />
                <span className="text-[11px] text-[var(--color-text)]/50 mt-1">{w.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {painTrend.length > 0 && (
        <Card className="mt-4">
          <p className="text-sm font-medium mb-4">Dolor promedio por check-in (0-10)</p>
          <div className="flex items-end gap-3 h-40">
            {painTrend.map((p) => (
              <div key={p.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <span className="text-xs text-[var(--color-text)]/60">{p.avgPain}</span>
                <div
                  className={`w-full rounded-t-md ${p.avgPain >= 4 ? "bg-red-400" : "bg-[var(--color-neutral-400)]"}`}
                  style={{ height: `${Math.max((p.avgPain / 10) * 100, 3)}%` }}
                />
                <span className="text-[11px] text-[var(--color-text)]/50 mt-1">{p.label}</span>
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
