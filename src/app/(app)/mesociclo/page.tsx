"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { Card, Button, Badge, Spinner, EmptyState } from "@/components/ui";
import type { Mesocycle } from "@/lib/types";

export default function MesocycleListPage() {
  const { athlete, athleteId } = useAthlete();
  const [mesocycles, setMesocycles] = useState<Mesocycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no hay atleta seleccionado aun
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("mesocycles")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("created_at", { ascending: false });
      setMesocycles((data as Mesocycle[]) ?? []);
      setLoading(false);
    })();
  }, [athleteId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Mesociclos &mdash; {athlete?.name}</h1>
        <Link href="/mesociclo/new">
          <Button>+ Nuevo mesociclo</Button>
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : mesocycles.length === 0 ? (
        <EmptyState
          text={`Aun no hay mesociclos para ${athlete?.name ?? ""}`}
          action={
            <Link href="/mesociclo/new">
              <Button>Crear primer mesociclo</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mesocycles.map((m) => (
            <Link key={m.id} href={`/mesociclo/${m.id}`}>
              <Card className="hover:border-orange-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium">{m.name}</p>
                  <Badge tone="orange">{m.status}</Badge>
                </div>
                <div className="flex gap-2 mb-2">
                  {m.phase && <Badge>{m.phase}</Badge>}
                </div>
                <p className="text-sm text-neutral-500">
                  {m.start_date ?? "?"} &rarr; {m.end_date ?? "?"}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
