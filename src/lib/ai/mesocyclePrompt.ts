import type { Athlete, Evaluation, Exercise, CheckIn } from "@/lib/types";

const RULES = `Sos un coach de escalada experto armando planificaciones de entrenamiento reales, basadas en evidencia y en el catálogo de ejercicios de Lattice Training. Seguí estas reglas sin excepción:

1. ESTRUCTURA: el mesociclo tiene exactamente 4 semanas completas (week_number 1-4), cada una con 7 días (Lunes a Domingo). La progresión de carga entre semanas es: semana 1 moderada, semana 2 alta, semana 3 alta, semana 4 descarga (deload, ~50-60% del volumen de la semana 3, nunca testear máximos en la semana de descarga).

2. CATALOGO: cada bloque de ejercicio debe existir, por nombre exacto, en el catálogo de ejercicios provisto abajo (campo exercise_name debe matchear exactamente un "name" del catálogo, is_catalog_exercise=true). La UNICA excepción permitida es un test o protocolo que no es una sesión de la app Lattice (por ejemplo un test de Critical Force o de fuerza máxima con un dinamómetro tipo Tindeq) -- en ese caso is_catalog_exercise=false y non_catalog_reason debe explicar por qué. Nunca inventes un ejercicio que no esté en el catálogo ni lo marques como excepción sin justificación real.

3. TESTEO DE LINEA BASE: si al atleta le faltan datos de resistencia (Critical Force, ARC) o de fuerza de dedos (Tindeq: Peak Load/MVC, RFD), programa esos tests como sesiones explícitas de la semana 1, para tener datos reales antes del próximo mesociclo.

4. PROGRESION DE DEDOS: si el atleta tiene fingerboard, la carga de fuerza de dedos no puede subir más de 5-10% por semana, y nunca se suma más volumen y más carga en la misma semana (una cosa o la otra). Si no tiene fingerboard, usa alternativas del catálogo (por ejemplo boulder/lift de dedos en pared) y sé más conservador.

5. ANTAGONISTAS Y CORE: todas las semanas deben incluir al menos un bloque de trabajo de antagonistas (empuje, extensores de dedos/muñeca) y al menos un bloque de estabilidad/core, para compensar el sesgo de tracción de la escalada.

6. DESCANSO: mínimo 1 día completo de descanso por semana (is_rest=true, blocks vacío), no negociable. Si la ficha del atleta especifica una cantidad de días de descanso o días disponibles para entrenar, respeta esa estructura (los días no disponibles también van como is_rest=true).

7. LESIONES Y HALLAZGOS: traducí cada hallazgo relevante de la evaluación (dolor, asimetrías, limitaciones de movilidad) en restricciones concretas de programación -- por ejemplo una asimetría de rotación de hombro con dolor implica evitar press por encima de la cabeza con carga y priorizar estabilidad escapular con RPE bajo, no simplemente "tener cuidado". Cada bloque relevante debe tener su kinesio_notes explicando la restricción.

8. Cada bloque necesita series/reps-tiempo/RPE/carga/descanso coherentes con lo que ese ejercicio pide en el catálogo (typical_sets, typical_reps, typical_time, typical_effort son la referencia, podés ajustarlos al nivel del atleta).

Respondé con el JSON pedido, nada más.`;

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
    athlete.years_climbing ? `Años escalando: ${athlete.years_climbing}` : null,
    athlete.discipline ? `Disciplina: ${athlete.discipline}` : null,
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
    athlete.training_days?.length ? `Días disponibles para entrenar: ${athlete.training_days.join(", ")}` : null,
    athlete.rest_days_per_week ? `Días de descanso requeridos por semana: ${athlete.rest_days_per_week}` : null,
    athlete.has_active_injury
      ? `LESIÓN ACTIVA: ${athlete.injury_location ?? "?"} -- ${athlete.injury_description ?? ""}. Diagnóstico: ${athlete.injury_diagnosis ?? "sin diagnóstico"}. Restricciones: ${athlete.injury_restrictions ?? "sin especificar"}.`
      : "Sin lesión activa reportada.",
    injuryHistory ? `Historial de lesiones: ${injuryHistory}` : null,
    athlete.medical_conditions ? `Condiciones médicas: ${athlete.medical_conditions}` : null,
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
    `Fecha de evaluación: ${ev.eval_date}`,
    painZones ? `Dolor actual por zona: ${painZones}` : "Sin dolor actual reportado.",
    ev.shoulder_ir_l || ev.shoulder_ir_r ? `Movilidad interna hombro -- izq: ${ev.shoulder_ir_l ?? "?"}, der: ${ev.shoulder_ir_r ?? "?"}` : null,
    ev.frog_l || ev.frog_r ? `Apertura de ranita (cadera) -- izq: ${ev.frog_l ?? "?"}, der: ${ev.frog_r ?? "?"}` : null,
    ev.thomas_l || ev.thomas_r ? `Test de Thomas -- izq: ${ev.thomas_l ?? "?"}, der: ${ev.thomas_r ?? "?"}` : null,
    ev.mobility_notes ? `Notas de movilidad: ${ev.mobility_notes}` : null,
    ev.weighted_pullup_kg ? `Dominadas lastradas: +${ev.weighted_pullup_kg}kg` : null,
    ev.bench_press_kg ? `Press banca: ${ev.bench_press_kg}kg` : null,
    !ev.bench_press_kg && ev.pushup_max_reps
      ? `Sin test de press banca; push-ups máximos: ${ev.pushup_max_reps} reps (estimar press banca como 0.64 x peso corporal x (1 + reps/30), y aclarar en notas que es una estimación, no un test real)`
      : null,
    ev.deadlift_kg ? `Peso muerto: ${ev.deadlift_kg}kg` : null,
    !ev.deadlift_kg && ev.goblet_squat_kg
      ? `Sin test de peso muerto; sentadilla goblet: ${ev.goblet_squat_kg}kg (estimar peso muerto como x2 de este valor, y aclarar en notas que es una estimación, no un test real)`
      : null,
    ev.plank_seconds ? `Plancha: ${ev.plank_seconds}s` : null,
    `Tindeq mano izq -- MVC:${ev.left_mvc_kg ?? "?"}kg (${ev.left_mvc_bw_pct != null ? ev.left_mvc_bw_pct.toFixed(1) : "?"}%BW), CF reps:${ev.left_cf_reps ?? "?"}, CF caida:${ev.left_cf_drop_pct ?? "?"}%, RFD100:${ev.left_rfd_100 ?? "?"}kg/s, RFD20-80:${ev.left_rfd_2080 ?? "?"}kg/s`,
    `Tindeq mano der -- MVC:${ev.right_mvc_kg ?? "?"}kg (${ev.right_mvc_bw_pct != null ? ev.right_mvc_bw_pct.toFixed(1) : "?"}%BW), CF reps:${ev.right_cf_reps ?? "?"}, CF caida:${ev.right_cf_drop_pct ?? "?"}%, RFD100:${ev.right_rfd_100 ?? "?"}kg/s, RFD20-80:${ev.right_rfd_2080 ?? "?"}kg/s`,
    ev.asymmetry_mvc_pct != null ? `Asimetría MVC: ${ev.asymmetry_mvc_pct.toFixed(1)}%${ev.asymmetry_mvc_pct > 15 ? " (SUPERA 15%, atender en la programación)" : ""}` : null,
    ev.arc_duration_min ? `ARC: ${ev.arc_duration_min}min, RPE ${ev.arc_rpe ?? "?"}, completo sin caer: ${ev.arc_completed ? "sí" : "no"}` : "Sin test ARC registrado -- programar como test de línea base en semana 1.",
    ev.boulder_redpoint || ev.boulder_onsight ? `Nivel boulder: redpoint ${ev.boulder_redpoint ?? "?"}, onsight ${ev.boulder_onsight ?? "?"}` : null,
    ev.sport_redpoint || ev.sport_onsight ? `Nivel deportiva: redpoint ${ev.sport_redpoint ?? "?"}, onsight ${ev.sport_onsight ?? "?"}` : null,
    flags ? `Hallazgos del evaluador: ${flags}` : null,
    ev.evaluator_notes ? `Notas del evaluador: ${ev.evaluator_notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildInitialUserPrompt(athlete: Athlete, evaluation: Evaluation) {
  return `Armá el primer mesociclo de entrenamiento (4 semanas) para este atleta, en base a su ficha y su evaluación física.

FICHA DEL ATLETA:
${serializeAthlete(athlete)}

EVALUACIÓN FÍSICA:
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
    `Check-in del ${checkin.checkin_date}: sueño ${checkin.sleep_quality ?? "?"}/10, motivación ${checkin.motivation ?? "?"}/10, adherencia al plan ${checkin.adherence_pct ?? "?"}%.`,
    painZones ? `Dolor reportado en el check-in: ${painZones}` : "Sin dolor reportado en el check-in.",
    checkin.comment ? `Comentario del atleta: "${checkin.comment}"` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const trend = recentCheckins
    .filter((c) => c.id !== checkin.id)
    .slice(0, 3)
    .map((c) => `${c.checkin_date}: sueño ${c.sleep_quality ?? "?"}, motivación ${c.motivation ?? "?"}, adherencia ${c.adherence_pct ?? "?"}%`)
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

DETALLE REAL DE LA SEMANA QUE TERMINÓ (planificado vs. real, dolor y comentarios por bloque):
${blocksSummary || "Sin bloques registrados para la semana que terminó."}

ESTADO ACTUAL DE LAS SEMANAS FUTURAS, DE REFERENCIA (JSON, incluye manually_edited por bloque):
${futureWeeksJson}

REGLA CRITICA: los bloques marcados "manually_edited": true fueron agregados o editados a mano por el propio atleta. El sistema los preserva automáticamente -- NO los repitas ni los incluyas en tu respuesta bajo ningún concepto, ya están garantizados. En tu JSON de salida, el array "blocks" de cada día debe contener ÚNICAMENTE los bloques nuevos o ajustados que vos propongas para completar ese día (los que reemplazan a los que tenían "manually_edited": false) -- nunca copies un bloque que en la referencia tenía "manually_edited": true. Si un día ya tiene bloques fijos del atleta, no lo marques is_rest=true (ya no es un día de descanso real). Devolvé únicamente las semanas futuras (mismo week_number que las que te pasé), con los 7 días de cada una.`;
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

${latestEvaluation ? `ÚLTIMA EVALUACIÓN FÍSICA:\n${serializeEvaluation(latestEvaluation)}` : "Sin evaluación física más reciente que la inicial."}

HISTORIAL DE MESOCICLOS ANTERIORES (adherencia, RPE real, dolor):
${pastMesocyclesSummary}

HISTORIAL DE CHECK-INS:
${allCheckinsSummary}`;
}
