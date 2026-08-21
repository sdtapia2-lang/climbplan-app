"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { Card, Spinner, EmptyState } from "@/components/ui";
import { computeAdherence } from "@/lib/adherence";
import { buildEvaluationSeries, buildAsymmetrySeries, type Series, type AsymmetryPoint } from "@/lib/analytics/evaluationSeries";
import { BarChart, type BarPoint } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { Sparkline } from "@/components/charts/Sparkline";
import type { Evaluation, MetricDefinition, MetricLog, Milestone } from "@/lib/types";
import { Flag } from "lucide-react";

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

// Fase 2.1: /analitica ya no es solo-entrenador -- useAthlete() escopea al
// atleta propio para un escalador, y RLS lo garantiza del lado del servidor
// (ver can_access_athlete). Ver src/components/Sidebar.tsx y MobileNav.tsx
// para la entrada de navegación agregada para el rol escalador.
export default function AnalyticsPage() {
  return <AnalyticsPanel />;
}

function AnalyticsPanel() {
  const { athlete, athleteId } = useAthlete();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ adherencePct: 0, avgRpe: null, completedBlocks: 0, totalBlocks: 0 });
  const [weeklyAdherence, setWeeklyAdherence] = useState<WeekPoint[]>([]);
  const [painTrend, setPainTrend] = useState<PainPoint[]>([]);
  const [evalSeries, setEvalSeries] = useState<Series[]>([]);
  const [asymmetry, setAsymmetry] = useState<AsymmetryPoint[]>([]);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [metricLogs, setMetricLogs] = useState<Record<string, MetricLog[]>>({});
  const [milestones, setMilestones] = useState<Milestone[]>([]);

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

      // Misma definición que el dashboard del entrenador (src/lib/adherence.ts):
      // solo cuenta semanas ya vencidas, para que un mesociclo en curso no arrastre
      // el número hacia abajo por sus semanas futuras. Sin esto, este número podía
      // no coincidir con el que ve el entrenador para el mismo atleta.
      const { pct: adherencePct } = computeAdherence(
        (data ?? []).map((meso) => ({ start_date: meso.start_date, weeks: meso.weeks ?? [] })),
        { scope: "elapsed" },
      );
      setStats({
        adherencePct: adherencePct ?? 0,
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

      // Fase 2.2/2.3: evaluaciones -- 54 campos capturados (protocolo Tindeq
      // incluido) que hasta ahora no se graficaban en ningún lado.
      const { data: evalRows } = await supabase
        .from("evaluations")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("eval_date", { ascending: true });
      const evaluations = (evalRows as Evaluation[]) ?? [];
      setEvalSeries(buildEvaluationSeries(evaluations));
      setAsymmetry(buildAsymmetrySeries(evaluations));

      // Fase 2.4: métricas custom e hitos -- ya existían (Fases 27/28) pero
      // solo se veían en /checkin, sin leerse en ningún otro lado.
      const { data: metricRows } = await supabase.from("metric_definitions").select("*").eq("athlete_id", athleteId).order("name");
      const metricDefs = (metricRows as MetricDefinition[]) ?? [];
      setMetrics(metricDefs);
      if (metricDefs.length > 0) {
        const { data: logRows } = await supabase
          .from("metric_logs")
          .select("*")
          .in(
            "metric_id",
            metricDefs.map((m) => m.id),
          )
          .order("log_date", { ascending: true });
        const byMetric: Record<string, MetricLog[]> = {};
        for (const log of (logRows as MetricLog[]) ?? []) {
          (byMetric[log.metric_id] ??= []).push(log);
        }
        setMetricLogs(byMetric);
      } else {
        setMetricLogs({});
      }

      const { data: milestoneRows } = await supabase
        .from("milestones")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("milestone_date", { ascending: false })
        .limit(5);
      setMilestones((milestoneRows as Milestone[]) ?? []);

      setLoading(false);
    })();
  }, [athleteId]);

  if (loading) return <Spinner />;

  const adherenceBars: BarPoint[] = weeklyAdherence.map((w) => ({ key: w.key, label: w.label, value: w.pct, displayValue: `${w.pct}%` }));
  const rpeBars: BarPoint[] = weeklyAdherence
    .filter((w) => w.avgRpe !== null)
    .map((w) => ({ key: w.key, label: w.label, value: w.avgRpe ?? 0 }));
  const painBars: BarPoint[] = painTrend.map((p) => ({ key: p.key, label: p.label, value: p.avgPain }));

  const hasAsymmetryData = asymmetry.some((a) => a.mvcPct !== null || a.cfPct !== null);
  const lastAsymmetry = [...asymmetry].reverse().find((a) => a.mvcPct !== null || a.cfPct !== null);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Analítica &mdash; {athlete?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="text-center py-6">
          <p className="font-[family-name:var(--font-heading)] text-5xl md:text-6xl tabular-nums text-[var(--color-accent-700)]">{stats.adherencePct}%</p>
          <p className="text-sm text-[var(--color-text)]/55 mt-2">Adherencia promedio</p>
        </Card>
        <Card className="text-center py-6">
          <p className="font-[family-name:var(--font-heading)] text-5xl md:text-6xl tabular-nums text-[var(--color-accent-700)]">{stats.avgRpe ?? "—"}</p>
          <p className="text-sm text-[var(--color-text)]/55 mt-2">RPE promedio general</p>
        </Card>
        <Card className="text-center py-6">
          <p className="font-[family-name:var(--font-heading)] text-5xl md:text-6xl tabular-nums text-[var(--color-accent-700)]">{stats.completedBlocks}</p>
          <p className="text-sm text-[var(--color-text)]/55 mt-2">Bloques completados</p>
        </Card>
      </div>

      {adherenceBars.length > 0 && (
        <Card>
          <BarChart title="Adherencia semanal" points={adherenceBars} maxValue={100} />
        </Card>
      )}

      {rpeBars.length > 0 && (
        <Card className="mt-4">
          <BarChart title="RPE real promedio por semana" points={rpeBars} maxValue={10} barClassName={() => "bg-[var(--color-accent-700)]"} />
        </Card>
      )}

      {painBars.length > 0 && (
        <Card className="mt-4">
          <BarChart
            title="Dolor promedio por check-in (0-10)"
            points={painBars}
            maxValue={10}
            barClassName={(p) => (p.value >= 4 ? "bg-[var(--color-attention-500)]" : "bg-[var(--color-neutral-400)]")}
          />
        </Card>
      )}

      <p className="text-xs text-[var(--color-text)]/40 mt-4 mb-8">
        Adherencia calculada sobre las semanas ya vencidas de todos los mesociclos del atleta ({stats.totalBlocks}{" "}
        bloques cargados en total). No incluye lo autorreportado en el check-in semanal.
      </p>

      <h2 className="text-lg font-semibold mb-4">Evolución física (evaluaciones)</h2>
      {evalSeries.length === 0 ? (
        <EmptyState text="Sin evaluaciones con datos numéricos cargados todavía." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {evalSeries.map((s) => (
            <Card key={s.key}>
              <LineChart title={s.title} unit={s.unit} points={s.points} />
            </Card>
          ))}
        </div>
      )}

      {hasAsymmetryData && (
        <>
          <h2 className="text-lg font-semibold mb-2">Asimetría izquierda/derecha</h2>
          <p className="text-sm text-[var(--color-text)]/55 mb-4">
            Calculada automáticamente en cada evaluación a partir de la fuerza de dedos (MVC) y Critical Force por mano.
            {lastAsymmetry?.mvcPct != null && lastAsymmetry.mvcPct >= 15 && (
              <span className="text-[var(--color-attention-600)]"> Última medición ≥15% — vale la pena trabajarla puntualmente.</span>
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {asymmetry.some((a) => a.mvcPct !== null) && (
              <Card>
                <LineChart
                  title="Asimetría MVC"
                  unit="%"
                  points={asymmetry.map((a) => ({ key: a.key, x: a.x, y: a.mvcPct }))}
                  colorVar="var(--color-accent-2-600)"
                />
              </Card>
            )}
            {asymmetry.some((a) => a.cfPct !== null) && (
              <Card>
                <LineChart
                  title="Asimetría Critical Force"
                  unit="%"
                  points={asymmetry.map((a) => ({ key: a.key, x: a.x, y: a.cfPct }))}
                  colorVar="var(--color-accent-2-600)"
                />
              </Card>
            )}
          </div>
        </>
      )}

      <h2 className="text-lg font-semibold mb-4">Métricas propias</h2>
      {metrics.length === 0 ? (
        <EmptyState text="Sin métricas definidas. Se cargan desde Check-in." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {metrics.map((m) => {
            const logs = (metricLogs[m.id] ?? []).slice(-8);
            const last = logs[logs.length - 1];
            return (
              <Card key={m.id}>
                <p className="font-medium mb-2">
                  {m.name} {m.unit && <span className="text-[var(--color-text)]/50 font-normal">({m.unit})</span>}
                </p>
                {last ? (
                  <>
                    <p className="text-2xl font-[family-name:var(--font-heading)] text-[var(--color-accent-700)] mb-2">
                      {last.value} <span className="text-sm text-[var(--color-text)]/50">{m.unit}</span>
                    </p>
                    <Sparkline points={logs.map((l) => ({ key: l.id, value: l.value, title: `${l.log_date}: ${l.value}` }))} />
                  </>
                ) : (
                  <p className="text-sm text-[var(--color-text)]/50">Sin valores todavía</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4 flex items-center gap-1.5">
        <Flag size={16} strokeWidth={2.75} aria-hidden="true" /> Últimos hitos
      </h2>
      {milestones.length === 0 ? (
        <EmptyState text="Sin hitos registrados." />
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => (
            <Card key={m.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{m.title}</p>
                <p className="text-xs text-[var(--color-text)]/55">
                  {new Date(m.milestone_date).toLocaleDateString("es-AR")} {m.category && `· ${m.category}`}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
