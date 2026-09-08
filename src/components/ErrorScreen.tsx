"use client";

import Link from "next/link";
import { TriangleAlert, RotateCcw, House } from "lucide-react";
import { Button } from "./ui";

/**
 * Pantalla de error compartida por los error boundaries de la app. Antes no
 * había ninguno, así que cualquier excepción caía en la pantalla por defecto
 * de Next -- fondo blanco, tipografía del sistema, sin salida más que el botón
 * atrás del navegador.
 *
 * Prioridades, en orden: que el usuario entienda que no perdió nada, que tenga
 * una salida (reintentar / volver al inicio), y que el detalle técnico esté
 * disponible para reportarlo pero sin dominar la pantalla.
 */
export function ErrorScreen({
  title = "Algo se rompió en esta pantalla",
  description = "El resto de la app sigue funcionando y tus datos están guardados. Puedes reintentar o volver al inicio.",
  detail,
  onRetry,
}: {
  title?: string;
  description?: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--color-attention-100)] text-[var(--color-attention-700)] flex items-center justify-center">
          <TriangleAlert size={28} strokeWidth={2.5} aria-hidden="true" />
        </div>

        <h1 className="font-[family-name:var(--font-heading)] text-2xl mb-2">{title}</h1>
        <p className="text-sm text-[var(--color-text)]/65 mb-6">{description}</p>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {onRetry && (
            <Button onClick={onRetry}>
              <RotateCcw size={14} strokeWidth={2.75} aria-hidden="true" /> Reintentar
            </Button>
          )}
          <Link href="/">
            <Button variant="secondary">
              <House size={14} strokeWidth={2.75} aria-hidden="true" /> Ir al inicio
            </Button>
          </Link>
        </div>

        {detail && (
          <details className="mt-8 text-left">
            <summary className="text-xs text-[var(--color-text)]/45 cursor-pointer hover:text-[var(--color-text)]/70">
              Detalle técnico
            </summary>
            <pre className="mt-2 text-[11px] leading-relaxed text-[var(--color-text)]/60 bg-[var(--color-surface)] border border-[var(--color-divider)] rounded-[16px] p-3 overflow-x-auto whitespace-pre-wrap break-words">
              {detail}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
