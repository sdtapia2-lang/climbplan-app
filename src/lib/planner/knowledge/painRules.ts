// Reglas de seguridad por zona de dolor/lesión, destiladas de la Sección 7
// del sistema de Diego (Plan para generar mesociclo.docx) y de las
// estrategias de prevención de Fobital ("bajarle la carga a esa zona
// específica por 1 o un par de sesiones"):
// - Hombro: evitar press por encima de la cabeza con carga; priorizar
//   rotadores externos y estabilidad escapular con RPE bajo.
// - Espalda baja: reintroducción progresiva conservadora, tope de RPE bajo.
// - Muñeca: vigilar tracción/empuje, evitar posiciones que agraven.
// - Dedos: tope de progresión y sustituir carga específica por antagonistas.
import type { Tag } from "../types";
import type { PainZoneGroup } from "../types";

export type PainRule = {
  /** Dolor >= este nivel: excluir ejercicios que cargan la zona. */
  excludeAt: number;
  /** Dolor >= este nivel (y < excludeAt): mantener con RPE reducido + nota. */
  reduceAt: number;
  /** Tags preferidos para sustituir lo excluido. */
  preferInstead: Tag[];
  zoneLabel: string;
};

export const PAIN_RULES: Record<PainZoneGroup, PainRule> = {
  fingers: { excludeAt: 5, reduceAt: 3, preferInstead: ["finger_extensors", "mobility"], zoneLabel: "dedos" },
  wrist: { excludeAt: 5, reduceAt: 3, preferInstead: ["mobility", "core"], zoneLabel: "muñeca" },
  elbow: { excludeAt: 5, reduceAt: 3, preferInstead: ["finger_extensors", "mobility"], zoneLabel: "codo" },
  shoulder: { excludeAt: 5, reduceAt: 3, preferInstead: ["shoulder_stability", "mobility"], zoneLabel: "hombro" },
  low_back: { excludeAt: 5, reduceAt: 3, preferInstead: ["core", "mobility"], zoneLabel: "espalda baja" },
  knee: { excludeAt: 5, reduceAt: 3, preferInstead: ["mobility", "core"], zoneLabel: "rodilla" },
};

export function kinesioNoteFor(zone: PainZoneGroup, level: number, action: "exclude" | "reduce"): string {
  const label = PAIN_RULES[zone].zoneLabel;
  return action === "exclude"
    ? `Sustituido por dolor en ${label} (${level}/10): priorizar estabilidad y trabajo sin dolor, RPE bajo.`
    : `Dolor en ${label} (${level}/10): reducir RPE, detener si el dolor supera 3/10 durante el ejercicio.`;
}

/** Mapea keys de dolor de evaluación/check-in a la zona normalizada. */
export function normalizePainZone(key: string): PainZoneGroup | null {
  const base = key.replace(/_(l|r)$/, "");
  switch (base) {
    case "fingers":
      return "fingers";
    case "wrist":
      return "wrist";
    case "elbow":
      return "elbow";
    case "shoulder":
      return "shoulder";
    case "low_back":
      return "low_back";
    case "knee":
      return "knee";
    default:
      return null;
  }
}

/** Mapea texto libre de ubicación de lesión (ficha del atleta) a zona. */
export function zoneFromFreeText(text: string | null): PainZoneGroup | null {
  if (!text) return null;
  const t = text.toLowerCase();
  if (/dedo|polea|falange/.test(t)) return "fingers";
  if (/muñeca|muneca/.test(t)) return "wrist";
  if (/codo|epicond/.test(t)) return "elbow";
  if (/hombro|manguito|escap/.test(t)) return "shoulder";
  if (/lumbar|espalda/.test(t)) return "low_back";
  if (/rodilla|menisco/.test(t)) return "knee";
  return null;
}
