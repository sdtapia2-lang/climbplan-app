"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { Card, Button, Spinner, Badge } from "@/components/ui";
import type { Mesocycle, Week } from "@/lib/types";

export default function DashboardPage() {
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
          <p className="text-sm text-neutral-500 mb-2">&#128197; Mesociclo activo</p>
          {mesocycle ? (
            <>
              <p className="font-medium mb-1">{mesocycle.name}</p>
              <div className="flex gap-2 mb-3">
                <Badge tone="orange">{mesocycle.status}</Badge>
                {mesocycle.phase && <Badge>{mesocycle.phase}</Badge>}
              </div>
              <Link href={`/mesociclo/${mesocycle.id}`} className="text-sm text-orange-600 hover:underline">
                Ver mesociclo &rarr;
              </Link>
            </>
          ) : (
            <>
              <p className="text-neutral-400 mb-3">Sin mesociclo activo</p>
              <Link href="/mesociclo/new">
                <Button>Crear mesociclo</Button>
              </Link>
            </>
          )}
        </Card>

        <Card>
          <p className="text-sm text-neutral-500 mb-2">&#128200; Semana actual</p>
          {currentWeek ? (
            <>
              <p className="font-medium mb-1">Semana {currentWeek.week_number}</p>
              <div className="flex gap-2 mb-3">
                {currentWeek.load_type && <Badge tone="orange">{currentWeek.load_type}</Badge>}
              </div>
              <Link href="/entrenamiento" className="text-sm text-orange-600 hover:underline">
                Ir a entrenamiento &rarr;
              </Link>
            </>
          ) : (
            <p className="text-neutral-400">Sin semanas cargadas</p>
          )}
        </Card>

        <Card>
          <p className="text-sm text-neutral-500 mb-2">&#128201; Evaluaciones</p>
          <p className="text-2xl font-semibold mb-1">{evalCount}</p>
          <p className="text-sm text-neutral-500 mb-3">evaluaciones registradas</p>
          <Link href="/evaluacion" className="text-sm text-orange-600 hover:underline">
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
