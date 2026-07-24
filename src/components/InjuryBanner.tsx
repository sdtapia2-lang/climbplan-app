import { TriangleAlert } from "lucide-react";
import type { Athlete } from "@/lib/types";

/** Aviso de lesión activa: se muestra donde el atleta ve/ejecuta su plan. */
export function InjuryBanner({ athlete }: { athlete: Athlete | null }) {
  if (!athlete?.has_active_injury) return null;
  const detail = [athlete.injury_location, athlete.injury_diagnosis].filter(Boolean).join(" — ");
  return (
    <div className="mb-4 flex items-start gap-2 rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <TriangleAlert size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-medium">Lesión activa registrada{detail ? `: ${detail}` : ""}.</span> Este plan
        reduce la intensidad y la frecuencia de escalada en esa zona, pero prioriza cargas bajas, respeta el dolor
        durante el ejercicio y, si todavía no lo hiciste, consulta con un profesional de salud antes de continuar.
      </p>
    </div>
  );
}
