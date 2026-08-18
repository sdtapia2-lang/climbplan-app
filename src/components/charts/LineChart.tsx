"use client";

/**
 * Línea de tendencia simple en SVG inline, sin librería de gráficos (mismo
 * criterio que BarChart/Sparkline). Pensado para series de evaluaciones —
 * pocos puntos (una evaluación por mes, típicamente), no series densas.
 */
export type LinePoint = { key: string; x: string; y: number | null };

const WIDTH = 600;
const HEIGHT = 140;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export function LineChart({
  title,
  unit,
  points,
  colorVar = "var(--color-accent-500)",
}: {
  title: string;
  unit?: string;
  points: LinePoint[];
  colorVar?: string;
}) {
  const valid = points.filter((p): p is LinePoint & { y: number } => p.y !== null);
  if (valid.length === 0) return null;

  if (valid.length === 1) {
    return (
      <div>
        <p className="text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-[family-name:var(--font-heading)] text-[var(--color-accent-700)]">
          {valid[0].y}
          {unit && <span className="text-sm text-[var(--color-text)]/50 ml-1">{unit}</span>}
        </p>
        <p className="text-xs text-[var(--color-text)]/40 mt-1">Necesitás al menos 2 evaluaciones para ver una tendencia.</p>
      </div>
    );
  }

  const minY = Math.min(...valid.map((p) => p.y));
  const maxY = Math.max(...valid.map((p) => p.y));
  const spanY = maxY - minY || 1;
  const plotW = WIDTH - PAD_X * 2;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const coords = valid.map((p, i) => {
    const x = PAD_X + (valid.length === 1 ? plotW / 2 : (i / (valid.length - 1)) * plotW);
    const y = PAD_TOP + plotH - ((p.y - minY) / spanY) * plotH;
    return { ...p, cx: x, cy: y };
  });

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.cx.toFixed(1)} ${c.cy.toFixed(1)}`).join(" ");
  const last = valid[valid.length - 1];
  const first = valid[0];
  const delta = last.y - first.y;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-[var(--color-text)]/55">
          {last.y}
          {unit} <span className={delta > 0 ? "text-[var(--color-accent-700)]" : delta < 0 ? "text-red-600" : ""}>
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(Math.round(delta * 10) / 10)}
          </span>
        </p>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ height: HEIGHT }} preserveAspectRatio="none">
        <path d={path} fill="none" stroke={colorVar} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c) => (
          <circle key={c.key} cx={c.cx} cy={c.cy} r={3} fill={colorVar}>
            <title>{`${c.x}: ${c.y}${unit ?? ""}`}</title>
          </circle>
        ))}
        {coords.map(
          (c, i) =>
            (i === 0 || i === coords.length - 1 || coords.length <= 4) && (
              <text
                key={`${c.key}-label`}
                x={c.cx}
                y={HEIGHT - 6}
                fontSize={10}
                textAnchor={i === 0 ? "start" : i === coords.length - 1 ? "end" : "middle"}
                fill="var(--color-text)"
                opacity={0.5}
              >
                {c.x}
              </text>
            ),
        )}
      </svg>
    </div>
  );
}
