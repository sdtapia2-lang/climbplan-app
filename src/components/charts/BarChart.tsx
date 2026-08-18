"use client";

/**
 * Gráfico de barras hecho a mano con CSS (sin librería de gráficos, ver
 * Fase 2.2 del plan de entrevistas). Extraído de src/app/(app)/analitica —
 * ahí había tres copias casi idénticas de este mismo patrón.
 */
export type BarPoint = {
  key: string;
  label: string;
  value: number;
  displayValue?: string;
};

export function BarChart({
  title,
  points,
  maxValue,
  barClassName,
  footerNote,
}: {
  title: string;
  points: BarPoint[];
  /** Escala del eje — por defecto el máximo de los datos (mínimo 1 para no dividir por 0). */
  maxValue?: number;
  /** Clase de color por barra; recibe el punto para permitir colorear condicionalmente (ej. dolor alto en rojo). */
  barClassName?: (p: BarPoint) => string;
  footerNote?: string;
}) {
  if (points.length === 0) return null;
  const max = maxValue ?? Math.max(...points.map((p) => p.value), 1);

  return (
    <div>
      <p className="text-sm font-medium mb-4">{title}</p>
      <div className="flex items-end gap-3 h-40">
        {points.map((p) => (
          <div key={p.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
            <span className="text-xs text-[var(--color-text)]/60">{p.displayValue ?? p.value}</span>
            <div
              className={`w-full rounded-t-md ${barClassName ? barClassName(p) : "bg-[var(--color-accent-500)]"}`}
              style={{ height: `${Math.max((p.value / max) * 100, 3)}%` }}
            />
            <span className="text-[11px] text-[var(--color-text)]/50 mt-1">{p.label}</span>
          </div>
        ))}
      </div>
      {footerNote && <p className="text-xs text-[var(--color-text)]/40 mt-3">{footerNote}</p>}
    </div>
  );
}
