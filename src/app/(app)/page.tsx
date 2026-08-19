"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { useProfile, isAdmin, isCoach, canManageOwnMesocycle } from "@/components/ProfileProvider";
import { Card, Button, Spinner, Badge } from "@/components/ui";
import { SessionPlayer } from "@/components/SessionPlayer";
import { BarChart, type BarPoint } from "@/components/charts/BarChart";
import type { CoachAlert, Mesocycle, Week, Day, Block } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import { computeAdherence } from "@/lib/adherence";
import { Calendar, TrendingUp, ClipboardList, Users, Layers, Gauge, TriangleAlert, X, Play, Heart } from "lucide-react";

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
  const [alerts, setAlerts] = useState<CoachAlert[]>([]);

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
        const { pct: adherencePct } = computeAdherence([{ start_date: meso.start_date, weeks: weeksSorted }]);

        byAthlete[meso.athlete_id] = {
          mesocycle: { id: meso.id, name: meso.name, status: meso.status, phase: meso.phase },
          currentWeekNumber,
          adherencePct,
        };
      }
      setSummaries(byAthlete);

      const { data: alertRows } = await supabase
        .from("coach_alerts")
        .select("*")
        .in(
          "athlete_id",
          athletes.map((a) => a.id),
        )
        .is("resolved_at", null)
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false });
      setAlerts((alertRows as CoachAlert[]) ?? []);

      setLoading(false);
    })();
  }, [athletes]);

  async function resolveAlert(id: string) {
    const prevAlerts = alerts;
    setAlerts((all) => all.filter((a) => a.id !== id));
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("coach_alerts")
      .update({ resolved_at: new Date().toISOString(), resolved_by: user?.id ?? null })
      .eq("id", id);
    if (error) setAlerts(prevAlerts);
  }

  if (loading) return <Spinner />;

  const alertsByAthlete = new Set(alerts.map((a) => a.athlete_id));
  const athleteNameById = new Map(athletes.map((a) => [a.id, a.name]));

  const activeCount = Object.values(summaries).filter((s) => s.mesocycle).length;
  const withAdherence = Object.values(summaries).filter((s) => s.adherencePct !== null);
  const avgAdherence =
    withAdherence.length > 0
      ? Math.round(withAdherence.reduce((sum, s) => sum + (s.adherencePct ?? 0), 0) / withAdherence.length)
      : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {alerts.length > 0 && (
        <Card className="mb-6 border-red-300">
          <p className="flex items-center gap-1.5 text-sm font-medium text-red-700 mb-3">
            <TriangleAlert size={15} strokeWidth={2.75} aria-hidden="true" />
            Atención ({alerts.length})
          </p>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate">
                    <span className="font-medium">{athleteNameById.get(a.athlete_id) ?? "Atleta"}</span>
                    {" — "}
                    {a.title}
                  </p>
                  {a.detail && <p className="text-xs text-[var(--color-text)]/55 truncate">{a.detail}</p>}
                </div>
                <button
                  onClick={() => resolveAlert(a.id)}
                  className="shrink-0 text-[var(--color-text)]/40 hover:text-[var(--color-text)] p-1"
                  aria-label="Resolver"
                  title="Marcar como resuelto"
                >
                  <X size={15} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

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
        <p className="text-[var(--color-text)]/40">Todavía no tienes atletas asignados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {athletes.map((a) => {
            const s = summaries[a.id];
            return (
              <Link key={a.id} href={`/atleta/${a.id}`} onClick={() => setAthleteId(a.id)}>
                <Card className="h-full hover:shadow-[var(--shadow-organic-md)] transition-shadow">
                  <p className="font-medium mb-2 flex items-center gap-1.5">
                    {a.name}
                    {alertsByAthlete.has(a.id) && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Tiene alertas sin resolver" />
                    )}
                  </p>
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

type DayWithBlocks = Day & { blocks: Block[] };

function AthleteDashboard() {
  const { athlete, athleteId, loading: athleteLoading } = useAthlete();
  const { profile } = useProfile();
  const canManageMeso = canManageOwnMesocycle(profile);
  const [loading, setLoading] = useState(true);
  const [mesocycle, setMesocycle] = useState<Mesocycle | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [evalCount, setEvalCount] = useState(0);
  const [todayDay, setTodayDay] = useState<DayWithBlocks | null>(null);
  const [weekPoints, setWeekPoints] = useState<BarPoint[]>([]);
  const [checkinDoneThisWeek, setCheckinDoneThisWeek] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);

  async function load() {
    if (!athleteId) return;
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
      const weeksList = (weeksData as Week[]) ?? [];
      setWeeks(weeksList);

      const currentWeek = computeCurrentWeek(meso, weeksList);
      if (currentWeek) {
        const { data: dayRows } = await supabase
          .from("days")
          .select("*, blocks(*)")
          .eq("week_id", currentWeek.id)
          .order("position");
        const daysWithBlocks = (dayRows as DayWithBlocks[]) ?? [];
        const todayName = DAYS_OF_WEEK[(new Date().getDay() + 6) % 7];
        setTodayDay(daysWithBlocks.find((d) => d.day_of_week === todayName) ?? null);

        const { count: checkinCount } = await supabase
          .from("checkins")
          .select("id", { count: "exact", head: true })
          .eq("athlete_id", athleteId)
          .eq("week_id", currentWeek.id);
        setCheckinDoneThisWeek((checkinCount ?? 0) > 0);
      } else {
        setTodayDay(null);
        setCheckinDoneThisWeek(false);
      }

      const { data: adherenceData } = await supabase
        .from("weeks")
        .select("week_number, days(is_rest, blocks(completed))")
        .eq("mesocycle_id", meso.id)
        .lte("week_number", currentWeek?.week_number ?? 0)
        .order("week_number");
      const points: BarPoint[] = (adherenceData ?? []).map((w) => {
        const { pct } = computeAdherence([{ start_date: null, weeks: [w] }], { scope: "lifetime" });
        return { key: String(w.week_number), label: `S${w.week_number}`, value: pct ?? 0, displayValue: pct !== null ? `${pct}%` : "—" };
      });
      setWeekPoints(points);
    } else {
      setWeeks([]);
      setTodayDay(null);
      setCheckinDoneThisWeek(false);
      setWeekPoints([]);
    }

    const { count } = await supabase
      .from("evaluations")
      .select("id", { count: "exact", head: true })
      .eq("athlete_id", athleteId);
    setEvalCount(count ?? 0);

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch al cambiar de atleta
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athleteId]);

  if (athleteLoading || loading) return <Spinner />;

  const currentWeek = computeCurrentWeek(mesocycle, weeks);
  const hasTodaySession = !!todayDay && !todayDay.is_rest && todayDay.blocks.length > 0;

  return (
    <div>
      {sessionOpen && todayDay && athleteId && (
        <SessionPlayer
          dayLabel={`${todayDay.day_of_week}${todayDay.day_focus ? ` — ${todayDay.day_focus}` : ""}`}
          blocks={todayDay.blocks}
          athleteId={athleteId}
          athlete={athlete}
          onClose={() => setSessionOpen(false)}
          onFinished={() => {
            setSessionOpen(false);
            load();
          }}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{athlete?.name ?? "Sin atleta"}</h1>
        {athlete && (
          <Link href={`/atleta/${athlete.id}`}>
            <Button variant="secondary">Perfil</Button>
          </Link>
        )}
      </div>

      {hasTodaySession && (
        <Card className="mb-4 border-[var(--color-accent-400)]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm text-[var(--color-text)]/55 mb-1">
                <Play size={15} strokeWidth={2.75} className={iconClass} aria-hidden="true" />
                Sesión de hoy
              </p>
              <p className="font-medium">
                {todayDay!.day_of_week}
                {todayDay!.day_focus ? ` — ${todayDay!.day_focus}` : ""}
              </p>
              <p className="text-xs text-[var(--color-text)]/55">{todayDay!.blocks.length} bloques</p>
            </div>
            <Button onClick={() => setSessionOpen(true)}>
              <Play size={14} strokeWidth={2.75} aria-hidden="true" /> Empezar sesión
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <Link
                href={canManageMeso ? `/mesociclo/${mesocycle.id}` : "/entrenamiento"}
                className="text-sm text-[var(--color-accent-700)] hover:underline"
              >
                {canManageMeso ? "Ver mesociclo" : "Ir a entrenamiento"} &rarr;
              </Link>
            </>
          ) : (
            <>
              <p className="text-[var(--color-text)]/40 mb-3">Sin mesociclo activo</p>
              {canManageMeso ? (
                <Link href="/mesociclo/new">
                  <Button>Crear mesociclo</Button>
                </Link>
              ) : (
                <Link href="/plantillas">
                  <Button variant="secondary">Ver planes disponibles</Button>
                </Link>
              )}
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
              <p className="flex items-center gap-1.5 text-xs text-[var(--color-text)]/55 mb-3">
                <Heart size={13} strokeWidth={2.75} className={checkinDoneThisWeek ? "text-[var(--color-accent-700)]" : ""} aria-hidden="true" />
                Check-in: {checkinDoneThisWeek ? "hecho esta semana" : "pendiente esta semana"}
              </p>
              <Link href="/entrenamiento" className="text-sm text-[var(--color-accent-700)] hover:underline">
                Ir a entrenamiento &rarr;
              </Link>
              {!checkinDoneThisWeek && (
                <>
                  {" · "}
                  <Link href="/checkin" className="text-sm text-[var(--color-accent-700)] hover:underline">
                    Hacer check-in &rarr;
                  </Link>
                </>
              )}
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

      {weekPoints.length > 0 && (
        <Card>
          <BarChart title="Adherencia por semana" points={weekPoints} maxValue={100} footerNote="Bloques completados sobre el total planificado, por semana." />
        </Card>
      )}
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
