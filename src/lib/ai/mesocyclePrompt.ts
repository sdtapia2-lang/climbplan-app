import type { Athlete, Evaluation, Exercise, CheckIn } from "@/lib/types";

const RULES = `Sos un coach de escalada experto armando planificaciones de entrenamiento reales, basadas en evidencia y en el catalogo de ejercicios de Lattice Training. Segui estas reglas sin excepcion:

1. ESTRUCTURA: el mesociclo tiene exactamente 4 semanas completas (week_number 1-4), cada una con 7 dias (Lunes a Domingo). La progresion de carga entre semanas es: semana 1 moderada, semana 2 alta, semana 3 alta, semana 4 descarga (deload, ~50-60% del volumen de la semana 3, nunca testear maximos en la semana de descarga).

2. CATALOGO: cada bloque de ejercicio debe existir, por nombre exacto, en el catalogo de ejercicios provisto abajo (campo exercise_name debe matchear exactamente un "name" del catalogo, is_catalog_exercise=true). La UNICA excepcion permitida es un test o protocolo que no es una sesion de la app Lattice (por ejemplo un test de Critical Force o de fuerza maxima con un dinamometro tipo Tindeq) -- en ese caso is_catalog_exercise=false y non_catalog_reason debe explicar por que. Nunca inventes un ejercicio que no este en el catalogo ni lo marques como excepcion sin justificacion real.

3. TESTEO DE LINEA BASE: si al atleta le faltan datos de resistencia (Critical Force, ARC) o de fuerza de dedos (Tindeq: Peak Load/MVC, RFD), programa esos tests como sesiones explicitas de la semana 1, para tener datos reales antes del proximo mesociclo.

4. PROGRESION DE DEDOS: si el atleta tiene fingerboard, la carga de fuerza de dedos no puede subir mas de 5-10% por semana, y nunca se suma mas volumen y mas carga en la misma semana (una cosa o la otra). Si no tiene fingerboard, usa alternativas del catalogo (por ejemplo boulder/lift de dedos en pared) y se mas conservador.

5. ANTAGONISTAS Y CORE: todas las semanas deben incluir al menos un bloque de trabajo de antagonistas (empuje, extensores de dedos/muneca) y al menos un bloque de estabilidad/core, para compensar el sesgo de traccion de la escalada.

6. DESCANSO: minimo 1 dia completo de descanso por semana (is_rest=true, blocks vacio), no negociable.

7. LESIONES Y HALLAZGOS: traduci cada hallazgo relevante de la evaluacion (dolor, asimetrias, limitaciones de movilidad) en restricciones concretas de programacion -- por ejemplo una asimetria de rotacion de hombro con dolor implica evitar press por encima de la cabeza con carga y priorizar estabilidad escapular con RPE bajo, no simplemente "tener cuidado". Cada bloock relevante debe tener su kinesio_notes explicando la restriccion.

8. Cada bloque necesita series/reps-tiempo/RPE/carga/descanso coherentes con lo que ese ejercicio pide en el catalogo (typical_sets, typical_reps, typical_time, typical_effort son la referencia, podes ajustarlos al nivel del atleta).

Respondé con el JSON pedido, nada mas.`;

function serializeExerciseCatalog(exercises: Exercise[]): string {
  return exercises
    .map((e) => {
      const equip = Array.isArray(e.equipment_required) && e.equipment_required.length ? e.equipment_required.join("/") : "-";
      const reps = e.typical_reps || e.typical_time || "-";
      return `- ${e.name} | ${e.category} | series:${e.typical_sets ?? "-"} | reps/tiempo:${reps} | esfuerzo:${e.typical_effort ?? "-"} | equipo:${equip}${e.description ? ` | ${e.description}` : ""}`;
    })
    .join("\n");
}

export function buildSystemPrompt(exercises: Exercise[]) {
  return [
    {
      type: "text" as const,
      text: RULES,
    },
    {
      type: "text" as const,
      text: `CATALOGO DE EJERCICIOS DISPONIBLES (${exercises.length} ejercicios reales de Lattice Training):\n${serializeExerciseCatalog(exercises)}`,
      cache_control: { type: "ephemeral" as const },
    },
  ];
}

function serializeAthlete(athlete: Athlete): string {
  const injuryHistory = (athlete.injury_history ?? [])
    .map((i) => `${i.injury} (${i.year}, ${i.status})`)
    .join("; ");
  return [
    `Nombre: ${athlete.name}`,
    athlete.age ? `Edad: ${athlete.age}` : null,
    athlete.height_cm ? `Altura: ${athlete.height_cm}cm` : null,
    athlete.weight_kg ? `Peso: ${athlete.weight_kg}kg` : null,
    athlete.wingspan_cm ? `Envergadura: ${athlete.wingspan_cm}cm` : null,
    athlete.boulder_indoor_max ? `Boulder indoor max: ${athlete.boulder_indoor_max}` : null,
    athlete.boulder_outdoor_max ? `Boulder outdoor max: ${athlete.boulder_outdoor_max}` : null,
    athlete.sport_indoor_max ? `Deportiva indoor max: ${athlete.sport_indoor_max}` : null,
    athlete.sport_outdoor_max ? `Deportiva outdoor max: ${athlete.sport_outdoor_max}` : null,
    athlete.consolidated_grade ? `Grado consolidado: ${athlete.consolidated_grade}` : null,
    athlete.climbing_style ? `Estilo: ${athlete.climbing_style}` : null,
    athlete.strengths ? `Fortalezas: ${athlete.strengths}` : null,
    athlete.weaknesses ? `Debilidades: ${athlete.weaknesses}` : null,
    athlete.main_goal ? `Objetivo principal: ${athlete.main_goal}` : null,
    athlete.secondary_goal ? `Objetivo secundario: ${athlete.secondary_goal}` : null,
    athlete.current_limiter ? `Limitante actual: ${athlete.current_limiter}` : null,
    athlete.target_horizon ? `Horizonte objetivo: ${athlete.target_horizon}` : null,
    athlete.equipment?.length ? `Equipamiento disponible: ${athlete.equipment.join(", ")}` : "Equipamiento disponible: sin datos",
    athlete.has_active_injury
      ? `LESION ACTIVA: ${athlete.injury_location ?? "?"} -- ${athlete.injury_description ?? ""}. Diagnostico: ${athlete.injury_diagnosis ?? "sin diagnostico"}. Restricciones: ${athlete.injury_restrictions ?? "sin especificar"}.`
      : "Sin lesion activa reportada.",
    injuryHistory ? `Historial de lesiones: ${injuryHistory}` : null,
    athlete.medical_conditions ? `Condiciones medicas: ${athlete.medical_conditions}` : null,
    athlete.transversal_rules ? `Reglas transversales ya definidas: ${athlete.transversal_rules}` : null,
    athlete.general_notes ? `Notas generales: ${athlete.general_notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function serializeEvaluation(ev: Evaluation): string {
  const painZones = Object.entries(ev.pain_by_zone ?? {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k}:${v}/10`)
    .join(", ");
  const flags = (ev.summary_flags ?? [])
    .map((f) => `${f.area} -- ${f.finding} -> ${f.implication}`)
    .join("; ");
  return [
    `Fecha de evaluacion: ${ev.eval_date}`,
    painZones ? `Dolor actual por zona: ${painZones}` : "Sin dolor actual reportado.",
    ev.shoulder_ir || ev.shoulder_er ? `Movilidad hombro -- RI: ${ev.shoulder_ir ?? "?"}, RE: ${ev.shoulder_er ?? "?"}` : null,
    ev.wrist_mobility ? `Movilidad muneca: ${ev.wrist_mobility}` : null,
    ev.thomas_test ? `Test de Thomas: ${ev.thomas_test}` : null,
    ev.mobility_notes ? `Notas de movilidad: ${ev.mobility_notes}` : null,
    ev.pullups_max ? `Dominadas max: ${ev.pullups_max}` : null,
    ev.horizontal_push ? `Empuje horizontal: ${ev.horizontal_push}` : null,
    ev.plank_seconds ? `Plancha: ${ev.plank_seconds}s` : null,
    `Tindeq mano izq -- MVC:${ev.left_mvc_kg ?? "?"}kg (${ev.left_mvc_bw_pct ?? "?"}%BW), CF reps:${ev.left_cf_reps ?? "?"}, CF caida:${ev.left_cf_drop_pct ?? "?"}%, RFD200:${ev.left_rfd_200 ?? "?"}`,
    `Tindeq mano der -- MVC:${ev.right_mvc_kg ?? "?"}kg (${ev.right_mvc_bw_pct ?? "?"}%BW), CF reps:${ev.right_cf_reps ?? "?"}, CF caida:${ev.right_cf_drop_pct ?? "?"}%, RFD200:${ev.right_rfd_200 ?? "?"}`,
    ev.asymmetry_mvc_pct != null ? `Asimetria MVC: ${ev.asymmetry_mvc_pct.toFixed(1)}%${ev.asymmetry_mvc_pct > 15 ? " (SUPERA 15%, atender en la programacion)" : ""}` : null,
    ev.arc_duration_min ? `ARC: ${ev.arc_duration_min}min, RPE ${ev.arc_rpe ?? "?"}, completo sin caer: ${ev.arc_completed ? "si" : "no"}` : "Sin test ARC registrado -- programar como test de linea base en semana 1.",
    ev.boulder_redpoint || ev.boulder_onsight ? `Nivel boulder: redpoint ${ev.boulder_redpoint ?? "?"}, onsight ${ev.boulder_onsight ?? "?"}` : null,
    ev.sport_redpoint || ev.sport_onsight ? `Nivel deportiva: redpoint ${ev.sport_redpoint ?? "?"}, onsight ${ev.sport_onsight ?? "?"}` : null,
    flags ? `Hallazgos del evaluador: ${flags}` : null,
    ev.evaluator_notes ? `Notas del evaluador: ${ev.evaluator_notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildInitialUserPrompt(athlete: Athlete, evaluation: Evaluation) {
  return `Armá el primer mesociclo de entrenamiento (4 semanas) para este atleta, en base a su ficha y su evaluacion fisica.

FICHA DEL ATLETA:
${serializeAthlete(athlete)}

EVALUACION FISICA:
${serializeEvaluation(evaluation)}`;
}

type FutureWeekState = {
  week_number: number;
  load_type: string | null;
  focus: string | null;
  distribution: string | null;
  days: {
    day_of_week: string;
    day_focus: string | null;
    is_rest: boolean;
    blocks: {
      exercise_name_freetext: string | null;
      category: string | null;
      sets: string | null;
      reps_or_time: string | null;
      rpe_target: string | null;
      load: string | null;
      rest: string | null;
      kinesio_notes: string | null;
      manually_edited: boolean;
    }[];
  }[];
};

type FinishedWeekBlockActual = {
  day_of_week: string;
  exercise_name_freetext: string | null;
  sets: string | null;
  reps_or_time: string | null;
  actual_sets: string | null;
  actual_reps_or_time: string | null;
  actual_load: string | null;
  actual_rpe: string | null;
  pain_during: number | null;
  comment: string | null;
  completed: boolean;
};

export function buildAdjustmentUserPrompt(params: {
  athlete: Athlete;
  mesocycleName: string;
  checkin: CheckIn;
  recentCheckins: CheckIn[];
  finishedWeekBlocks: FinishedWeekBlockActual[];
  futureWeeks: FutureWeekState[];
}) {
  const { athlete, mesocycleName, checkin, recentCheckins, finishedWeekBlocks, futureWeeks } = params;

  const painZones = Object.entries(checkin.pain_by_zone ?? {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k}:${v}/10`)
    .join(", ");

  const checkinSummary = [
    `Check-in del ${checkin.checkin_date}: sueno ${checkin.sleep_quality ?? "?"}/10, motivacion ${checkin.motivation ?? "?"}/10, adherencia al plan ${checkin.adherence_pct ?? "?"}%.`,
    painZones ? `Dolor reportado en el check-in: ${painZones}` : "Sin dolor reportado en el check-in.",
    checkin.comment ? `Comentario del atleta: "${checkin.comment}"` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const trend = recentCheckins
    .filter((c) => c.id !== checkin.id)
    .slice(0, 3)
    .map((c) => `${c.checkin_date}: sueno ${c.sleep_quality ?? "?"}, motivacion ${c.motivation ?? "?"}, adherencia ${c.adherence_pct ?? "?"}%`)
    .join(" / ");

  const blocksSummary = finishedWeekBlocks
    .map((b) => {
      const parts = [
        `${b.day_of_week} -- ${b.exercise_name_freetext ?? "?"}`,
        `planificado: ${b.sets ?? "-"}x${b.reps_or_time ?? "-"}`,
        `real: ${b.actual_sets ?? "-"}x${b.actual_reps_or_time ?? "-"} carga ${b.actual_load ?? "-"} RPE ${b.actual_rpe ?? "-"}`,
        `completado: ${b.completed ? "si" : "no"}`,
        b.pain_during ? `dolor durante: ${b.pain_during}/10` : null,
        b.comment ? `comentario: "${b.comment}"` : null,
      ];
      return "- " + parts.filter(Boolean).join(" | ");
    })
    .join("\n");

  const futureWeeksJson = JSON.stringify(futureWeeks, null, 2);

  return `Ajustá las semanas futuras del mesociclo "${mesocycleName}" de este atleta, en base a como le fue en la semana que acaba de terminar y a su check-in.

FICHA DEL ATLETA:
${serializeAthlete(athlete)}

${checkinSummary}
${trend ? `Check-ins previos (tendencia): ${trend}` : ""}

DETALLE REAL DE LA SEMANA QUE TERMINO (planificado vs. real, dolor y comentarios por bloque):
${blocksSummary || "Sin bloques registrados para la semana que termino."}

ESTADO ACTUAL DE LAS SEMANAS FUTURAS, DE REFERENCIA (JSON, incluye manually_edited por bloque):
${futureWeeksJson}

REGLA CRITICA: los bloques marcados "manually_edited": true fueron agregados o editados a mano por el propio atleta. El sistema los preserva automaticamente -- NO los repitas ni los incluyas en tu respuesta bajo ningun concepto, ya estan garantizados. En tu JSON de salida, el array "blocks" de cada dia debe contener UNICAMENTE los bloques nuevos o ajustados que vos propongas para completar ese dia (los que reemplazan a los que tenian "manually_edited": false) -- nunca copies un bloque que en la referencia tenia "manually_edited": true. Si un dia ya tiene bloques fijos del atleta, no lo marques is_rest=true (ya no es un dia de descanso real). Devolvé unicamente las semanas futuras (mismo week_number que las que te pasé), con los 7 dias de cada una.`;
}

export function buildNextMesocycleUserPrompt(params: {
  athlete: Athlete;
  latestEvaluation: Evaluation | null;
  pastMesocyclesSummary: string;
  allCheckinsSummary: string;
}) {
  const { athlete, latestEvaluation, pastMesocyclesSummary, allCheckinsSummary } = params;
  return `Armá el siguiente mesociclo de entrenamiento (4 semanas) para este atleta, usando todo el historial acumulado -- no es su primer mesociclo.

FICHA DEL ATLETA:
${serializeAthlete(athlete)}

${latestEvaluation ? `ULTIMA EVALUACION FISICA:\n${serializeEvaluation(latestEvaluation)}` : "Sin evaluacion fisica mas reciente que la inicial."}

HISTORIAL DE MESOCICLOS ANTERIORES (adherencia, RPE real, dolor):
${pastMesocyclesSummary}

HISTORIAL DE CHECK-INS:
${allCheckinsSummary}`;
}
