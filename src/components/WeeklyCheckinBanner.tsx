"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "./ui";

/**
 * Aviso de check-in pendiente de la semana en curso. La semana del plan avanza
 * sola con la fecha (ver lib/weeks.ts), así que al entrar en una semana nueva
 * el atleta se encuentra con otro entrenamiento sin que nadie le haya
 * preguntado cómo llegó: este banner es el punto donde el plan se ajusta a
 * cómo viene, antes de arrancar.
 */
export function WeeklyCheckinBanner({ weekNumber }: { weekNumber?: number | null }) {
  return (
    <div className="mb-4 rounded-[24px] border border-[var(--color-accent-400)] bg-[var(--color-accent-100)]/50 p-4">
      <div className="flex items-start gap-2.5">
        <ClipboardList size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[var(--color-accent-700)]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium mb-0.5">
            Empieza la semana {weekNumber ?? ""} — falta tu check-in
          </p>
          <p className="text-sm text-[var(--color-text)]/65 mb-3">
            Tu plan se ajusta según cómo vienes. Cuéntanos cómo dormiste, cómo te sientes y si algo
            molesta antes de arrancar el entrenamiento de esta semana.
          </p>
          <Link href="/checkin">
            <Button>Hacer check-in semanal</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
