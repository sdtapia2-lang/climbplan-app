"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { Card, Button, Badge, Spinner, EmptyState } from "@/components/ui";
import type { Evaluation } from "@/lib/types";

export default function EvaluationListPage() {
  const { athlete, athleteId } = useAthlete();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteId) return;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("evaluations")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("eval_date", { ascending: false });
      setEvaluations((data as Evaluation[]) ?? []);
      setLoading(false);
    })();
  }, [athleteId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Evaluaciones &mdash; {athlete?.name}</h1>
        <Link href="/evaluacion/new">
          <Button>+ Nueva evaluacion</Button>
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : evaluations.length === 0 ? (
        <EmptyState text="Sin evaluaciones registradas" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluations.map((ev) => (
            <Link key={ev.id} href={`/evaluacion/${ev.id}`}>
              <Card className="hover:border-orange-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{ev.eval_date}</p>
                  {ev.weight_kg && <Badge>{ev.weight_kg} kg</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                  <span>MVC izq: {ev.left_mvc_kg ?? "-"} kg</span>
                  <span>MVC der: {ev.right_mvc_kg ?? "-"} kg</span>
                  <span>CF izq: {ev.left_cf_avg_force_kg ?? "-"} kg</span>
                  <span>CF der: {ev.right_cf_avg_force_kg ?? "-"} kg</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
