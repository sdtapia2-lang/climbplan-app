"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { useProfile, canManageOwnMesocycle, isSelfCoached } from "@/components/ProfileProvider";
import { Card, Button, Badge, Spinner, EmptyState } from "@/components/ui";
import { InjuryBanner } from "@/components/InjuryBanner";
import { Sparkles } from "lucide-react";
import type { Mesocycle } from "@/lib/types";

export default function MesocycleListPage() {
  const { athlete, athleteId } = useAthlete();
  const { profile } = useProfile();
  const router = useRouter();
  const canCreate = canManageOwnMesocycle(profile);
  const canOpenDetail = canCreate || profile?.role !== "escalador";
  const [mesocycles, setMesocycles] = useState<Mesocycle[]>([]);
  const [hasEvaluation, setHasEvaluation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const latestMesocycle = mesocycles[0] ?? null;
  const latestIsFinished =
    !!latestMesocycle &&
    (latestMesocycle.status === "Completado" || (!!latestMesocycle.end_date && new Date(latestMesocycle.end_date) < new Date()));
  const selfCoached = isSelfCoached(profile);
  const showGenerateNext = selfCoached && latestMesocycle && latestIsFinished;
  // Escalador auto-gestionado, sin mesociclos todavía pero con evaluación:
  // puede generar su primer plan automáticamente desde la evaluación.
  const showGenerateInitial = selfCoached && mesocycles.length === 0 && hasEvaluation;

  async function generate(mode: "initial" | "next") {
    if (!athleteId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-mesocycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, mode }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert(data?.error ?? "No se pudo generar el plan.");
        setGenerating(false);
        return;
      }
      if (data?.mesocycleId) {
        router.push(`/mesociclo/${data.mesocycleId}`);
        return;
      }
      // El único caso sin mesocycleId con ok=true es "ya existe": recargar.
      router.refresh();
      setGenerating(false);
    } catch {
      alert("No se pudo generar el plan.");
      setGenerating(false);
    }
  }

  useEffect(() => {
    if (!athleteId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no hay atleta seleccionado aun
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const [{ data }, { count }] = await Promise.all([
        supabase.from("mesocycles").select("*").eq("athlete_id", athleteId).order("created_at", { ascending: false }),
        supabase.from("evaluations").select("id", { count: "exact", head: true }).eq("athlete_id", athleteId),
      ]);
      setMesocycles((data as Mesocycle[]) ?? []);
      setHasEvaluation((count ?? 0) > 0);
      setLoading(false);
    })();
  }, [athleteId]);

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-8 h-8 border-2 border-[var(--color-neutral-300)] border-t-[var(--color-accent-500)] rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-text)]/70">Armando tu planificación...</p>
      </div>
    );
  }

  return (
    <div>
      <InjuryBanner athlete={athlete} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Mesociclos &mdash; {athlete?.name}</h1>
        <div className="flex items-center gap-2">
          {showGenerateNext && (
            <Button onClick={() => generate("next")} disabled={generating} variant="secondary">
              <Sparkles size={14} strokeWidth={2.75} aria-hidden="true" />
              Generar siguiente mesociclo
            </Button>
          )}
          {canCreate && (
            <Link href="/mesociclo/new">
              <Button variant={showGenerateInitial ? "secondary" : "primary"}>+ Nuevo mesociclo</Button>
            </Link>
          )}
        </div>
      </div>

      {!canOpenDetail && (
        <p className="text-sm text-[var(--color-text)]/55 mb-4">
          Para ver el detalle día a día de tu semana actual y registrar tus series, ve a{" "}
          <Link href="/entrenamiento" className="text-[var(--color-accent-700)] hover:underline">
            Entrenamiento
          </Link>
          .
        </p>
      )}

      {loading ? (
        <Spinner />
      ) : mesocycles.length === 0 ? (
        <EmptyState
          text={
            showGenerateInitial
              ? `Aún no tienes un plan. Genera tu primera planificación a partir de tu evaluación.`
              : selfCoached && !hasEvaluation
                ? `Antes de generar tu plan, completa una evaluación en la sección Evaluación.`
                : `Aún no hay mesociclos para ${athlete?.name ?? ""}`
          }
          action={
            <div className="flex items-center gap-2">
              {showGenerateInitial && (
                <Button onClick={() => generate("initial")} disabled={generating}>
                  <Sparkles size={14} strokeWidth={2.75} aria-hidden="true" />
                  Generar planificación
                </Button>
              )}
              {selfCoached && !hasEvaluation && (
                <Link href="/evaluacion/new">
                  <Button>Ir a la evaluación</Button>
                </Link>
              )}
              {canCreate && (
                <Link href="/mesociclo/new">
                  <Button variant={showGenerateInitial ? "secondary" : "primary"}>Crear a mano</Button>
                </Link>
              )}
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mesocycles.map((m) => {
            const content = (
              <Card className={canOpenDetail ? "hover:border-[var(--color-accent-300)] transition-colors" : ""}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium">{m.name}</p>
                  <Badge tone="orange">{m.status}</Badge>
                </div>
                <div className="flex gap-2 mb-2">{m.phase && <Badge>{m.phase}</Badge>}</div>
                <p className="text-sm text-[var(--color-text)]/55">
                  {m.start_date ?? "?"} &rarr; {m.end_date ?? "?"}
                </p>
              </Card>
            );
            return canOpenDetail ? (
              <Link key={m.id} href={`/mesociclo/${m.id}`}>
                {content}
              </Link>
            ) : (
              <div key={m.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
