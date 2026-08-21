"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Athlete } from "@/lib/types";

type Props = {
  athlete: Athlete | null;
  /** Si se pasan junto a un mesociclo activo, habilita el CTA de ajuste inmediato (Fase 3.2). */
  athleteId?: string;
  weekId?: string | null;
  onAdjusted?: () => void;
};

/** Aviso de lesión activa: se muestra donde el atleta ve/ejecuta su plan. */
export function InjuryBanner({ athlete, athleteId, weekId, onAdjusted }: Props) {
  const [requesting, setRequesting] = useState(false);
  const [result, setResult] = useState<"adjusted" | "no_changes" | "error" | null>(null);

  if (!athlete?.has_active_injury) return null;
  const detail = [athlete.injury_location, athlete.injury_diagnosis].filter(Boolean).join(" — ");

  // Ajuste inmediato disparado por el propio atleta ante la lesión, sin
  // esperar a que el entrenador lo note -- a diferencia del check-in
  // semanal (checkin/page.tsx), esto corre también para atletas con
  // entrenador: una lesión activa es una señal más fuerte que amerita
  // replanificar ya, no solo generar una alerta para que alguien la revise.
  async function requestAdjustment() {
    if (!athlete || !athleteId || !weekId || requesting) return;
    setRequesting(true);
    setResult(null);
    const supabase = createClient();
    const { data: checkin, error: checkinError } = await supabase
      .from("checkins")
      .insert({
        athlete_id: athleteId,
        week_id: weekId,
        checkin_date: new Date().toISOString().slice(0, 10),
        pain_by_zone: {},
        comment: `Ajuste solicitado por lesión activa${athlete.injury_location ? `: ${athlete.injury_location}` : ""}.`,
      })
      .select("id")
      .single();
    if (checkinError || !checkin?.id) {
      setRequesting(false);
      setResult("error");
      return;
    }
    try {
      const res = await fetch("/api/adjust-mesocycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, checkinId: checkin.id }),
      });
      const data = await res.json().catch(() => null);
      setResult(res.ok && data?.adjusted ? "adjusted" : res.ok ? "no_changes" : "error");
      if (res.ok) onAdjusted?.();
    } catch {
      setResult("error");
    }
    setRequesting(false);
  }

  return (
    <div className="mb-4 flex items-start gap-2 rounded-[24px] border border-[var(--color-attention-300)] bg-[var(--color-attention-100)] p-4 text-sm text-[var(--color-attention-800)]">
      <TriangleAlert size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p>
          <span className="font-medium">Lesión activa registrada{detail ? `: ${detail}` : ""}.</span> Este plan
          reduce la intensidad y la frecuencia de escalada en esa zona, pero prioriza cargas bajas, respeta el dolor
          durante el ejercicio y, si todavía no lo hiciste, consulta con un profesional de salud antes de continuar.
        </p>
        {athlete.injury_restrictions && (
          <p className="mt-1.5">
            <span className="font-medium">Restricciones:</span> {athlete.injury_restrictions}
          </p>
        )}
        {athleteId && weekId && (
          <div className="mt-2.5">
            <button
              onClick={requestAdjustment}
              disabled={requesting}
              className="text-sm font-medium text-[var(--color-attention-800)] underline hover:no-underline disabled:opacity-60"
            >
              {requesting ? "Solicitando ajuste..." : "Solicitar ajuste del plan por esta lesión"}
            </button>
            {result === "adjusted" && <p className="mt-1 text-xs text-[var(--color-attention-700)]">Plan ajustado para las próximas semanas.</p>}
            {result === "no_changes" && <p className="mt-1 text-xs text-[var(--color-attention-700)]">Revisado: no hizo falta ningún cambio.</p>}
            {result === "error" && <p className="mt-1 text-xs text-[var(--color-attention-700)]">No se pudo pedir el ajuste. Probá de nuevo.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
