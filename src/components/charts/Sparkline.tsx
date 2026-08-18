"use client";

/**
 * Mini gráfico de barras para el último tramo de una serie (últimos N
 * puntos). Extraído de src/app/(app)/checkin (sección Métricas) para
 * reutilizarlo también en /analitica (Fase 2.4).
 */
export type SparklinePoint = { key: string; value: number; title?: string };

export function Sparkline({ points }: { points: SparklinePoint[] }) {
  if (points.length < 2) return null;
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {points.map((p) => (
        <div key={p.key} className="flex-1 flex flex-col items-center justify-end h-full">
          <div
            className="w-full rounded-t-sm bg-[var(--color-accent-500)]"
            style={{ height: `${Math.max((p.value / max) * 100, 4)}%` }}
            title={p.title}
          />
        </div>
      ))}
    </div>
  );
}
