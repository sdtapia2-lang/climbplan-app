"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { useProfile, isAdmin, isCoach } from "@/components/ProfileProvider";
import { Card, Button, Spinner, Badge } from "@/components/ui";
import type { Mesocycle, Week } from "@/lib/types";
import { Calendar, TrendingUp, ClipboardList, Users, Layers, Gauge } from "lucide-react";

const iconClass = "inline-block align-[-3px] mr-1";

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useProfile();
  if (profileLoading) return <Spinner />;
  if (isAdmin(profile) || isCoach(profile)) return <CoachDashboard />;
  return <AthleteDashboard />;
}

type AthleteSummary = {
  mesocycle: { id: string; name: string; status: string; phase: string | null } | null;
  currentWeekNumber: number | null;
  adherencePct: number | null;
};

function CoachDashboard() {
  const { athletes, setAthleteId } = useAthlete();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<Record<string, AthleteSummary>>({});

  useEffect(() => {
    if (athletes.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no hay atletas visibles aun
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("mesocycles")
        .select("id, name, status, phase, athlete_id, start_date, created_at, weeks(week_number, days(is_rest, blocks(completed)))")
        .in(
          "athlete_id",
          athletes.map((a) => a.id),
        )
        .neq("status", "Completado")
        .order("created_at", { ascending: false });

      const byAthlete: Record<string, AthleteSummary> = {};
      for (const meso of data ?? []) {
        if (byAthlete[meso.athlete_id]) continue;
        const weeksSorted = [...(meso.weeks ?? [])].sort((a, b) => a.week_number - b.week_number);
        const currentWeekNumber = computeCurrentWeekNumber(meso.start_date, weeksSorted);

        let total = 0;
        let completed = 0;
        for (const w of weeksSorted) {
          for (const day of w.days ?? []) {
            if (day.is_rest) continue;
            for (const block of day.blocks ?? []) {
              total += 1;
              if (block.completed) completed += 1;
            }
          }
        }

        byAthlete[meso.athlete_id] = {
          mesocycle: { id: meso.id, name: meso.name, status: meso.status, phase: meso.phase },
          currentWeekNumber,
          adherencePct: total > 0 ? Math.round((completed / total) * 100) : null,
        };
      }
      setSummaries(byAthlete);
      setLoading(false);
    })();
  }, [athletes]);

  if (loading) return <Spinner />;

  const activeCount = Object.values(summaries).filter((s) => s.mesocycle).length;
  const withAdherence = Object.values(summaries).filter((s) => s.adherencePct !== null);
  const avgAdherence =
    withAdherence.length > 0
      ? Math.round(withAdherence.reduce((sum, s) => sum + (s.adherencePct ?? 0), 0) / withAdherence.length)
      : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <p className="font-[family-name:var(--font-heading)] text-3xl text-[var(--color-accent-700)]">
            <Users size={22} strokeWidth={2.75} className="inline-block align-[-4px] mr-1" aria-hidden="true" />
            {athletes.length}
          </p>
          <p className="text-sm text-[var(--color-text)]/55 mt-1">Atletas</p>
        </Card>
        <Card className="text-center">
          <p className="font-[family-name:var(--font-heading)] text-3xl text-[var(--color-accent-700)]">
            <Layers size={22} strokeWidth={2.75} className="inline-block align-[-4px] mr-1" aria-hidden="true" />
            {activeCount}
          </p>
          <p className="text-sm text-[var(--color-text)]/55 mt-1">Mesociclos activos</p>
        </Card>
        <Card className="text-center">
          <p className="font-[family-name:var(--font-heading)] text-3xl text-[var(--color-accent-700)]">
            <Gauge size={22} strokeWidth={2.75} className="inline-block align-[-4px] mr-1" aria-hidden="true" />
            {avgAdherence !== null ? `${avgAdherence}%` : "—"}
          </p>
          <p className="text-sm text-[var(--color-text)]/55 mt-1">Adherencia promedio</p>
        </Card>
      </div>

      {athletes.length === 0 ? (
        <p className="text-[var(--color-text)]/40">Todavia no tenes atletas asignados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {athletes.map((a) => {
            const s = summaries[a.id];
            return (
              <Link key={a.id} href={`/atleta/${a.id}`} onClick={() => setAthleteId(a.id)}>
                <Card className="h-full hover:shadow-[var(--shadow-organic-md)] transition-shadow">
                  <p className="font-medium mb-2">{a.name}</p>
                  {s?.mesocycle ? (
                    <>
                      <p className="text-sm text-[var(--color-text)]/70 mb-1 truncate">{s.mesocycle.name}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge tone="orange">{s.mesocycle.status}</Badge>
                        {s.mesocycle.phase && <Badge>{s.mesocycle.phase}</Badge>}
                        {s.currentWeekNumber && <Badge>S{s.currentWeekNumber}</Badge>}
                      </div>
                      <p className="text-xs text-[var(--color-text)]/55">
                        Adherencia: {s.adherencePct !== null ? `${s.adherencePct}%` : "—"}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-[var(--color-text)]/40">Sin mesociclo activo</p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function computeCurrentWeekNumber(
  startDate: string | null,
  weeks: { week_number: number }[],
): number | null {
  if (weeks.length === 0) return null;
  if (!startDate) return weeks[0].week_number;
  const start = new Date(startDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const idx = Math.min(Math.max(Math.floor(diffDays / 7), 0), weeks.length - 1);
  return weeks[idx]?.week_number ?? weeks[0].week_number;
}

function AthleteDashboard() {
  const { athlete, athleteId, loading: athleteLoading } = useAthlete();
  const [loading, setLoading] = useState(true);
  const [mesocycle, setMesocycle] = useState<Mesocycle | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [evalCount, setEvalCount] = useState(0);

  useEffect(() => {
    if (!athleteId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no hay atleta seleccionado aun
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const supabase = createClient();

      const { data: mesos } = await supabase
        .from("mesocycles")
        .select("*")
        .eq("athlete_id", athleteId)
        .neq("status", "Completado")
        .order("created_at", { ascending: false })
        .limit(1);
      const meso = (mesos?.[0] as Mesocycle) ?? null;
      setMesocycle(meso);

      if (meso) {
        const { data: weeksData } = await supabase
          .from("weeks")
          .select("*")
          .eq("mesocycle_id", meso.id)
          .order("week_number");
        setWeeks((weeksData as Week[]) ?? []);
      } else {
        setWeeks([]);
      }

      const { count } = await supabase
        .from("evaluations")
        .select("id", { count: "exact", head: true })
        .eq("athlete_id", athleteId);
      setEvalCount(count ?? 0);

      setLoading(false);
    })();
  }, [athleteId]);

  if (athleteLoading || loading) return <Spinner />;

  const currentWeek = computeCurrentWeek(mesocycle, weeks);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{athlete?.name ?? "Sin atleta"}</h1>
        {athlete && (
          <Link href={`/atleta/${athlete.id}`}>
            <Button variant="secondary">Perfil</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-[var(--color-text)]/55 mb-2">
            <Calendar size={15} strokeWidth={2.75} className={iconClass} aria-hidden="true" />
            Mesociclo activo
          </p>
          {mesocycle ? (
            <>
              <p className="font-medium mb-1">{mesocycle.name}</p>
              <div className="flex gap-2 mb-3">
                <Badge tone="orange">{mesocycle.status}</Badge>
                {mesocycle.phase && <Badge>{mesocycle.phase}</Badge>}
              </div>
              <Link href={`/mesociclo/${mesocycle.id}`} className="text-sm text-[var(--color-accent-700)] hover:underline">
                Ver mesociclo &rarr;
              </Link>
            </>
          ) : (
            <>
              <p className="text-[var(--color-text)]/40 mb-3">Sin mesociclo activo</p>
              <Link href="/mesociclo/new">
                <Button>Crear mesociclo</Button>
              </Link>
            </>
          )}
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text)]/55 mb-2">
            <TrendingUp size={15} strokeWidth={2.75} className={iconClass} aria-hidden="true" />
            Semana actual
          </p>
          {currentWeek ? (
            <>
              <p className="font-medium mb-1">Semana {currentWeek.week_number}</p>
              <div className="flex gap-2 mb-3">
                {currentWeek.load_type && <Badge tone="orange">{currentWeek.load_type}</Badge>}
              </div>
              <Link href="/entrenamiento" className="text-sm text-[var(--color-accent-700)] hover:underline">
                Ir a entrenamiento &rarr;
              </Link>
            </>
          ) : (
            <p className="text-[var(--color-text)]/40">Sin semanas cargadas</p>
          )}
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-text)]/55 mb-2">
            <ClipboardList size={15} strokeWidth={2.75} className={iconClass} aria-hidden="true" />
            Evaluaciones
          </p>
          <p className="text-2xl font-semibold mb-1">{evalCount}</p>
          <p className="text-sm text-[var(--color-text)]/55 mb-3">evaluaciones registradas</p>
          <Link href="/evaluacion" className="text-sm text-[var(--color-accent-700)] hover:underline">
            Ver historial &rarr;
          </Link>
        </Card>
      </div>
    </div>
  );
}

function computeCurrentWeek(mesocycle: Mesocycle | null, weeks: Week[]): Week | null {
  if (!mesocycle || weeks.length === 0) return null;
  if (!mesocycle.start_date) return weeks[0];
  const start = new Date(mesocycle.start_date);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const idx = Math.min(Math.max(Math.floor(diffDays / 7), 0), weeks.length - 1);
  return weeks[idx] ?? weeks[0];
}
