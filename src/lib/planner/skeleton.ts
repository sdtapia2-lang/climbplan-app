// Etapa 2 del pipeline: esqueleto semanal — asigna a cada día disponible un
// foco desde los layouts destilados, respetando la agenda del atleta y la
// fase del mesociclo. Días no disponibles → descanso.
import { DAYS_OF_WEEK } from "@/lib/types";
import type { DayFocus, PlannerProfile, WeekSkeleton, WeekSkeletonDay } from "./types";
import { MICROCYCLE_TEMPLATE, MESOCYCLE_PHASES, type MesocyclePhase } from "./knowledge/microcycles";
import { WEEK_LAYOUTS } from "./knowledge/dayTemplates";

export function phaseForMesocycle(previousMesocycles: number): MesocyclePhase {
  return MESOCYCLE_PHASES[previousMesocycles % MESOCYCLE_PHASES.length];
}

/** Focos ordenados para la cantidad de días, ajustados por disciplina, fase y déficits. */
export function focusListFor(profile: PlannerProfile, phase: MesocyclePhase): DayFocus[] {
  const count = Math.min(Math.max(profile.trainingDays.length, 2), 6);
  const layout = [...(WEEK_LAYOUTS[count] ?? WEEK_LAYOUTS[3])];

  // La fase del mesociclo prioriza cuál de los 3 pilares de escalada (Aerobic
  // Base / Power Endurance / Strength and Power) va primero en la semana --
  // pero nunca elimina ninguno, los 3 son un requisito fijo, no una
  // preferencia (se reordena, no se sobreescribe).
  const emphasisIdx = layout.indexOf(phase.climbingEmphasis);
  if (emphasisIdx > 0) {
    [layout[0], layout[emphasisIdx]] = [layout[emphasisIdx], layout[0]];
  }

  // Fingerboard es un requisito fijo (no depende de déficit): si el atleta
  // tiene fingerboard, siempre hay 1 día dedicado cuando hay 4+ días de
  // entrenamiento. Con menos días, ensureWeeklyGuarantees en generatePlan.ts
  // igual mete un ejercicio de Fingerboard como red de seguridad.
  if (profile.hasFingerboard && !layout.includes("dedos_fuerza") && layout.length >= 4) {
    layout[layout.length - 1] = "dedos_fuerza";
  }
  // Sin fingerboard: el trabajo de dedos se hace en pared (regla 4, más conservador)
  if (!profile.hasFingerboard) {
    for (let i = 0; i < layout.length; i++) {
      if (layout[i] === "dedos_fuerza") layout[i] = i === 0 ? phase.climbingEmphasis : "fisico_core_antagonistas";
    }
  }
  // Déficit de movilidad: el último slot físico se vuelve movilidad (solo con 5+ días)
  if (profile.deficits.mobility && layout.length >= 5 && !layout.includes("movilidad")) {
    layout[layout.length - 1] = "movilidad";
  }

  return layout;
}

export function buildSkeleton(profile: PlannerProfile, phase: MesocyclePhase): WeekSkeleton[] {
  const focuses = focusListFor(profile, phase);
  const trainingSet = new Set(profile.trainingDays);

  return MICROCYCLE_TEMPLATE.map((micro) => {
    let slot = 0;
    const days: WeekSkeletonDay[] = DAYS_OF_WEEK.map((dayOfWeek) => {
      if (!trainingSet.has(dayOfWeek) || slot >= focuses.length) return { dayOfWeek, focus: null };
      return { dayOfWeek, focus: focuses[slot++] };
    });

    // Descarga: se recortan los días de menor prioridad (los últimos del
    // layout) para bajar la frecuencia, como en los planes de referencia
    // (Noceti: físico pasa de 2× a 1×; Cata: descarga con menos sesiones).
    if (micro.loadType === "Descarga") {
      const trainingIdx = days.map((d, i) => (d.focus ? i : -1)).filter((i) => i >= 0);
      const toDrop = Math.floor(trainingIdx.length / 3);
      for (let k = 0; k < toDrop; k++) {
        days[trainingIdx[trainingIdx.length - 1 - k]].focus = null;
      }
    }

    return {
      weekNumber: micro.week,
      loadType: micro.loadType,
      volumeMult: micro.volumeMult,
      rpeShift: micro.rpeShift,
      maxRpe: micro.maxRpe,
      allowTests: micro.allowTests,
      days,
    };
  });
}
