import type { Evaluation } from "@/lib/types";

// Fase 2.2: graficar la evaluación en el tiempo. Hoy `evaluations` captura
// ~54 campos (protocolo Tindeq completo incluido) y ninguno se grafica en
// ningún lado -- este módulo es la única pieza nueva, todo el render vive en
// componentes de charts/ ya genéricos.

export type SeriesPoint = { key: string; x: string; y: number | null };
export type Series = { key: string; title: string; unit?: string; points: SeriesPoint[] };

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

/** Extrae una serie numérica de un campo de Evaluation, ordenada por fecha ascendente. */
function extract(
  evaluations: Evaluation[],
  key: keyof Evaluation,
  title: string,
  unit?: string,
): Series {
  return {
    key: String(key),
    title,
    unit,
    points: evaluations.map((e) => ({
      key: e.id,
      x: shortDate(e.eval_date),
      y: typeof e[key] === "number" ? (e[key] as number) : null,
    })),
  };
}

/**
 * Series listas para graficar, ya ordenadas por fecha (las evaluaciones
 * deben llegar ordenadas por eval_date ascendente). Se omiten las que no
 * tienen ningún valor cargado en ninguna evaluación, para no mostrar
 * gráficos vacíos.
 */
export function buildEvaluationSeries(evaluations: Evaluation[]): Series[] {
  const candidates: Series[] = [
    extract(evaluations, "left_mvc_kg", "MVC izquierda", "kg"),
    extract(evaluations, "right_mvc_kg", "MVC derecha", "kg"),
    extract(evaluations, "left_mvc_bw_pct", "MVC izq. (% peso corporal)", "%"),
    extract(evaluations, "right_mvc_bw_pct", "MVC der. (% peso corporal)", "%"),
    extract(evaluations, "left_cf_avg_force_kg", "Critical Force izquierda", "kg"),
    extract(evaluations, "right_cf_avg_force_kg", "Critical Force derecha", "kg"),
    extract(evaluations, "weighted_pullup_kg", "Dominada lastrada", "kg"),
    extract(evaluations, "weight_kg", "Peso corporal", "kg"),
    extract(evaluations, "plank_seconds", "Plancha", "s"),
    extract(evaluations, "lsit_seconds", "L-sit", "s"),
    extract(evaluations, "arc_duration_min", "Duración ARC", "min"),
    extract(evaluations, "vertical_jump_cm", "Salto vertical", "cm"),
  ];
  return candidates.filter((s) => s.points.some((p) => p.y !== null));
}

export type AsymmetryPoint = { key: string; x: string; mvcPct: number | null; cfPct: number | null };

/** Serie de asimetría izquierda/derecha, ya calculada y guardada por EvaluationForm al cargar cada evaluación. */
export function buildAsymmetrySeries(evaluations: Evaluation[]): AsymmetryPoint[] {
  return evaluations.map((e) => ({
    key: e.id,
    x: shortDate(e.eval_date),
    mvcPct: e.asymmetry_mvc_pct,
    cfPct: e.asymmetry_cf_pct,
  }));
}
