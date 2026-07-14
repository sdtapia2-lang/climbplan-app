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

export default function AnalyticsPage() {
  const { athlete, athleteId } = useAthlete();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ adherencePct: 0, avgRpe: null, completedBlocks: 0, totalBlocks: 0 });

  useEffect(() => {
    if (!athleteId) return;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("mesocycles")
        .select("id, weeks(id, days(id, is_rest, blocks(completed, actual_rpe)))")
        .eq("athlete_id", athleteId);

      let total = 0;
      let completed = 0;
      let rpeSum = 0;
      let rpeCount = 0;

      for (const meso of data ?? []) {
        for (const week of meso.weeks ?? []) {
          for (const day of week.days ?? []) {
            if (day.is_rest) continue;
            for (const block of day.blocks ?? []) {
              total += 1;
              if (block.completed) completed += 1;
              const rpe = parseFloat(block.actual_rpe ?? "");
              if (!isNaN(rpe)) {
                rpeSum += rpe;
                rpeCount += 1;
              }
            }
          }
        }
      }

      setStats({
        adherencePct: total > 0 ? Math.round((completed / total) * 100) : 0,
        avgRpe: rpeCount > 0 ? Math.round((rpeSum / rpeCount) * 10) / 10 : null,
        completedBlocks: completed,
        totalBlocks: total,
      });
      setLoading(false);
    })();
  }, [athleteId]);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Analitica &mdash; {athlete?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-semibold text-[var(--color-accent-500)]">{stats.adherencePct}%</p>
          <p className="text-sm text-[var(--color-text)]/55 mt-1">Adherencia promedio</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-semibold text-blue-500">{stats.avgRpe ?? "—"}</p>
          <p className="text-sm text-[var(--color-text)]/55 mt-1">RPE promedio general</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-semibold text-green-600">{stats.completedBlocks}</p>
          <p className="text-sm text-[var(--color-text)]/55 mt-1">Bloques completados</p>
        </Card>
      </div>
      <p className="text-xs text-[var(--color-text)]/40 mt-4">
        Calculado sobre {stats.totalBlocks} bloques de entrenamiento cargados en todos los mesociclos del atleta.
      </p>
    </div>
  );
}
