// Convierte el texto de descanso de un bloque a segundos, para el timer del
// modo de ejecución guiada. Cubre los formatos que produce el catálogo y el
// motor de reglas: "60 s entre series", "2 min entre series", "1 min 30 s
// entre series", "30 segundos", "2-3 min", "3 min", "10s set rest", etc.
// Si hay un rango ("2-3 min") toma el valor menor. Devuelve null si no puede
// interpretar nada razonable.
export function parseRestSeconds(rest: string | null | undefined): number | null {
  if (!rest) return null;
  const text = rest.toLowerCase();

  // Rango tipo "2-3 min" → tomar el primer número como base.
  const rangeMatch = text.match(/(\d+)\s*-\s*\d+\s*(min|m|seg|segundos|s)/);
  if (rangeMatch) {
    const n = Number(rangeMatch[1]);
    return /m/.test(rangeMatch[2]) ? n * 60 : n;
  }

  let total = 0;
  let matched = false;

  const minMatch = text.match(/(\d+)\s*(?:min|m\b)/);
  if (minMatch) {
    total += Number(minMatch[1]) * 60;
    matched = true;
  }
  // Segundos: "30 s", "30s", "30 seg", "30 segundos" — evitar capturar la "s"
  // de "min" tomando el número que precede a s/seg tras un posible bloque de min.
  const secMatch = text.match(/(\d+)\s*(?:s\b|seg\b|segundos\b)/);
  if (secMatch) {
    total += Number(secMatch[1]);
    matched = true;
  }

  if (!matched) {
    // Último recurso: un número suelto se interpreta como segundos.
    const bare = text.match(/\d+/);
    if (bare) return Number(bare[0]);
    return null;
  }
  return total > 0 ? total : null;
}

/** Cantidad de series de un bloque (para saber cuántas repetir en la sesión). */
export function parseSetsCount(sets: string | null | undefined): number {
  if (!sets) return 1;
  const m = sets.match(/\d+/);
  const n = m ? Number(m[0]) : 1;
  return n >= 1 && n <= 20 ? n : 1;
}

/** Formatea segundos como mm:ss para el display del timer. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
