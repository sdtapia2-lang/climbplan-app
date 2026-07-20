// Verificación sintética del motor de reglas (sin base de datos):
//   npx tsx scripts/test-planner.ts
// Usa el catálogo real volcado en scripts/fixtures/catalog.json.
import { readFileSync } from "node:fs";
import type { Athlete, Evaluation, Exercise } from "@/lib/types";
import { validateMesocyclePlan } from "@/lib/ai/generateMesocycle";
import { generateMesocyclePlan } from "@/lib/planner/generatePlan";
import { adjustMesocyclePlanRules } from "@/lib/planner";
import { classifyExercise } from "@/lib/planner/knowledge/exerciseMeta";

const catalog: Exercise[] = JSON.parse(readFileSync("scripts/fixtures/catalog.json", "utf8"));

let failures = 0;
let checks = 0;
function assert(cond: boolean, label: string) {
  checks++;
  if (!cond) {
    failures++;
    console.error("  FALLO:", label);
  }
}

const FULL_EQUIPMENT = [
  "Pared boulder", "Campus board", "Fingerboard", "Tension/Kilter/Moonboard", "Barra dominadas",
  "Pesas", "Tindeq Progressor", "Banda elástica", "Barra", "Mancuernas", "Pesas rusas",
  "Tablero de circuitos", "Aros/TRX", "Colchoneta", "Pared de dificultad",
];

function makeAthlete(overrides: Partial<Athlete>): Athlete {
  return {
    id: "a1", name: "Sintético", age: 30, height_cm: 175, weight_kg: 70, wingspan_cm: 178,
    boulder_indoor_max: "V5", boulder_outdoor_max: null, sport_indoor_max: null, sport_outdoor_max: null,
    consolidated_grade: "V4", climbing_style: null, strengths: null, weaknesses: null,
    main_goal: "Encadenar V6", secondary_goal: null, current_limiter: null,
    periodization_format: null, target_horizon: null,
    equipment: FULL_EQUIPMENT, has_active_injury: false, injury_location: null, injury_description: null,
    injury_diagnosis: null, injury_since: null, injury_restrictions: null, pain_threshold: null,
    injury_strapping: null, injury_professional_notes: null, injury_history: [],
    medical_conditions: null, general_notes: null, transversal_rules: null,
    years_climbing: 5, discipline: "Boulder", training_days: ["Lunes", "Miércoles", "Viernes", "Sábado"],
    rest_days_per_week: 2, created_at: "", updated_at: "",
    ...overrides,
  };
}

function makeEvaluation(overrides: Partial<Evaluation>): Evaluation {
  return {
    id: "e1", athlete_id: "a1", eval_date: "2026-07-20", weight_kg: 70, height_cm: 175, wingspan_cm: 178,
    health_screening: {}, pain_by_zone: {},
    shoulder_ir_l: "", shoulder_ir_r: "", frog_l: "", frog_r: "", thomas_l: "", thomas_r: "",
    mobility_notes: null, weighted_pullup_kg: 20, bench_press_kg: 60, deadlift_kg: 100,
    plank_seconds: 90, lsit_seconds: 15, vertical_jump_cm: null,
    left_mvc_kg: 40, left_mvc_bw_pct: 57, left_cf_reps: 20, left_cf_avg_force_kg: 25, left_cf_drop_pct: 40,
    left_rfd_100: 1.2, left_rfd_2080: 150,
    right_mvc_kg: 42, right_mvc_bw_pct: 60, right_cf_reps: 22, right_cf_avg_force_kg: 26, right_cf_drop_pct: 38,
    right_rfd_100: 1.3, right_rfd_2080: 160,
    asymmetry_mvc_pct: 4.9, asymmetry_cf_pct: null,
    arc_duration_min: 20, arc_rpe: 6, arc_completed: true, endurance_notes: null,
    boulder_redpoint: "V5", boulder_onsight: "V3", sport_redpoint: null, sport_onsight: null,
    summary_flags: [], evaluator_notes: null, created_at: "",
    ...overrides,
  };
}

// ---------- Matriz de generación ----------
const equipmentVariants: [string, string[]][] = [
  ["equipo completo", FULL_EQUIPMENT],
  ["solo peso corporal", []],
  ["sin fingerboard", ["Pared boulder", "Barra dominadas", "Mancuernas", "Banda elástica", "Colchoneta"]],
];
const dayVariants: string[][] = [
  ["Lunes", "Jueves"],
  ["Lunes", "Miércoles", "Viernes"],
  ["Lunes", "Miércoles", "Viernes", "Sábado"],
  ["Lunes", "Martes", "Jueves", "Viernes", "Sábado", "Domingo"],
];
const disciplines = ["Boulder", "Deportiva", "Ambas"] as const;
const injuryVariants: [string, Partial<Evaluation>, Partial<Athlete>][] = [
  ["sin lesión", {}, {}],
  ["dolor hombro 6", { pain_by_zone: { shoulder: 6 } }, {}],
  ["dolor dedos 4", { pain_by_zone: { fingers: 4 } }, {}],
  ["asimetría 20%", { asymmetry_mvc_pct: 20 }, {}],
  ["lesión dedos activa", {}, { has_active_injury: true, injury_location: "Dedo anular derecho", injury_diagnosis: "Polea A2" }],
];
const evalVariants: [string, Partial<Evaluation> | null][] = [
  ["evaluación completa", {}],
  ["sin Tindeq ni ARC", {
    left_mvc_kg: null, right_mvc_kg: null, left_mvc_bw_pct: null, right_mvc_bw_pct: null,
    left_cf_reps: null, right_cf_reps: null, arc_duration_min: null, arc_completed: null,
  }],
];

const catalogNames = new Set(catalog.map((e) => e.name.trim().toLowerCase()));
const equipByName = new Map(catalog.map((e) => [e.name, e.equipment_required ?? []]));

let combos = 0;
for (const [eqLabel, equipment] of equipmentVariants) {
  for (const days of dayVariants) {
    for (const discipline of disciplines) {
      for (const [injLabel, evalOverride, athleteOverride] of injuryVariants) {
        for (const [evalLabel, evalBase] of evalVariants) {
          combos++;
          const label = `[${eqLabel} | ${days.length} días | ${discipline} | ${injLabel} | ${evalLabel}]`;
          const athlete = makeAthlete({ equipment, training_days: days, discipline, rest_days_per_week: 7 - days.length, ...athleteOverride });
          const evaluation = makeEvaluation({ ...evalBase, ...evalOverride });

          const plan = generateMesocyclePlan({ athlete, evaluation, exercises: catalog, previousMesocycles: 0 });
          const plan2 = generateMesocyclePlan({ athlete, evaluation, exercises: catalog, previousMesocycles: 0 });

          const issues = validateMesocyclePlan(plan, catalog);
          assert(issues.length === 0, `${label} validateMesocyclePlan: ${issues.join(" | ")}`);
          assert(JSON.stringify(plan) === JSON.stringify(plan2), `${label} determinismo`);

          const normalizedEquip = new Set(
            [...equipment, "Peso corporal", "Colchoneta"].map((s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")),
          );
          // Alias del planner: fingerboard ⇄ regleta de lastre; barra dominadas → barra fija
          if (normalizedEquip.has("fingerboard") || normalizedEquip.has("regleta de lastre")) {
            normalizedEquip.add("fingerboard");
            normalizedEquip.add("regleta de lastre");
          }
          if (normalizedEquip.has("barra dominadas")) normalizedEquip.add("fingerboard");
          for (const week of plan.weeks) {
            assert(week.days.some((d) => d.is_rest), `${label} S${week.week_number} sin día de descanso`);
            for (const day of week.days) {
              if (day.is_rest) assert(day.blocks.length === 0, `${label} S${week.week_number} ${day.day_of_week} descanso con bloques`);
              for (const b of day.blocks) {
                if (b.is_catalog_exercise) {
                  assert(catalogNames.has(b.exercise_name.trim().toLowerCase()), `${label} "${b.exercise_name}" no está en catálogo`);
                  const req = equipByName.get(b.exercise_name) ?? [];
                  const ok = req.every((eq) =>
                    normalizedEquip.has(eq.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")),
                  );
                  // Los tests de línea base de catálogo pueden adaptarse de equipo
                  const isBaseline = /test|arc medio/i.test(b.exercise_name);
                  assert(ok || isBaseline, `${label} "${b.exercise_name}" requiere ${req.join("/")} no disponible`);
                } else {
                  assert(!!b.non_catalog_reason, `${label} "${b.exercise_name}" sin non_catalog_reason`);
                }
              }
            }
            // Días de entreno coinciden con la agenda (excepto recortes de descarga)
            for (const day of week.days) {
              if (!day.is_rest) assert(days.includes(day.day_of_week), `${label} S${week.week_number} entrena ${day.day_of_week} fuera de agenda`);
            }
          }
          const count = (w: number) => plan.weeks[w].days.reduce((s, d) => s + d.blocks.length, 0);
          assert(count(3) <= Math.max(1, Math.floor(count(2) * 0.6)), `${label} descarga ${count(3)} > 60% de ${count(2)}`);

          // Dolor hombro >=5 ⇒ ningún ejercicio que cargue hombro
          if (injLabel === "dolor hombro 6") {
            for (const week of plan.weeks) {
              for (const day of week.days) {
                for (const b of day.blocks) {
                  const ex = catalog.find((e) => e.name === b.exercise_name);
                  if (ex) assert(!classifyExercise(ex).zones.includes("shoulder"), `${label} "${b.exercise_name}" carga hombro con dolor 6`);
                }
              }
            }
          }
          // Lesión activa de dedos ⇒ sin carga pesada de dedos, pero la
          // escalada suave se mantiene (no se elimina toda la escalada)
          if (injLabel === "lesión dedos activa") {
            let hasClimbing = false;
            for (const week of plan.weeks) {
              for (const day of week.days) {
                for (const b of day.blocks) {
                  const ex = catalog.find((e) => e.name === b.exercise_name);
                  if (!ex) continue;
                  assert(!classifyExercise(ex).zones.includes("fingers"), `${label} "${b.exercise_name}" carga dedos pesado con lesión activa`);
                  if (classifyExercise(ex).tags.includes("climbing")) hasClimbing = true;
                }
              }
            }
            const hasWall = equipment.some((e) => /pared|tablero|tension|spray/i.test(e));
            if (hasWall) assert(hasClimbing, `${label} eliminó toda la escalada en vez de bajar a escalada suave`);
          }
          // Asimetría ⇒ algún bloque unilateral con nota
          if (injLabel === "asimetría 20%") {
            const hasUnilateralNote = plan.weeks.some((w) =>
              w.days.some((d) => d.blocks.some((b) => /asimetría/i.test(b.kinesio_notes ?? ""))),
            );
            assert(hasUnilateralNote, `${label} sin trabajo unilateral anotado pese a asimetría`);
          }
          // Sin Tindeq/ARC ⇒ tests de línea base en semana 1
          if (evalLabel === "sin Tindeq ni ARC") {
            const w1Names = plan.weeks[0].days.flatMap((d) => d.blocks.map((b) => b.exercise_name.toLowerCase()));
            assert(w1Names.some((n) => /test|arc/.test(n)), `${label} sin tests de línea base en semana 1`);
          }
        }
      }
    }
  }
}
console.log(`Generación: ${combos} combinaciones probadas.`);

// Variedad determinista entre mesociclos + fases
{
  const athlete = makeAthlete({});
  const evaluation = makeEvaluation({});
  const m1 = generateMesocyclePlan({ athlete, evaluation, exercises: catalog, previousMesocycles: 0 });
  const m2 = generateMesocyclePlan({ athlete, evaluation, exercises: catalog, previousMesocycles: 1 });
  assert(m1.phase !== m2.phase, "fases distintas entre mesociclo 1 y 2");
  assert(m1.name !== m2.name, "nombres distintos entre mesociclos");
}

// ---------- Ajuste semanal ----------
function makeFutureWeeks() {
  return [3, 4].map((n) => ({
    week_number: n,
    load_type: n === 4 ? "Descarga" : "Choque",
    focus: null,
    distribution: null,
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((d) => ({
      day_of_week: d,
      day_focus: d === "Lunes" ? "Físico" : null,
      is_rest: d !== "Lunes" && d !== "Miércoles",
      blocks:
        d === "Lunes"
          ? [
              { exercise_name_freetext: "Press de Banca - Fuerza", category: "Conditioning", sets: "4", reps_or_time: "6 reps", rpe_target: "8", load: null, rest: "3 min", kinesio_notes: null, manually_edited: false },
              { exercise_name_freetext: "Core 7", category: "Conditioning", sets: "3", reps_or_time: "6 reps", rpe_target: "7", load: null, rest: "2 min", kinesio_notes: null, manually_edited: false },
            ]
          : d === "Miércoles"
            ? [{ exercise_name_freetext: "Mi bloque propio", category: "Otro", sets: "3", reps_or_time: "10", rpe_target: "6", load: null, rest: null, kinesio_notes: null, manually_edited: true }]
            : [],
    })),
  }));
}
const baseCheckin = {
  id: "c1", athlete_id: "a1", week_id: "w2", checkin_date: "2026-07-20",
  sleep_quality: 8, motivation: 8, adherence_pct: 95, pain_by_zone: {}, comment: null, created_at: "",
};

{
  // Todo bien ⇒ no_changes_needed
  const res = adjustMesocyclePlanRules({
    athlete: makeAthlete({}), checkin: baseCheckin, recentCheckins: [], finishedWeekBlocks: [],
    futureWeeks: makeFutureWeeks(), exercises: catalog,
  });
  assert(res.noChanges === true, "check-in sano ⇒ noChanges");
}
{
  // Dolor 7 en hombro ⇒ sustituye press banca, nunca emite el bloque manual
  const res = adjustMesocyclePlanRules({
    athlete: makeAthlete({}), checkin: { ...baseCheckin, pain_by_zone: { shoulder_r: 7 } }, recentCheckins: [],
    finishedWeekBlocks: [], futureWeeks: makeFutureWeeks(), exercises: catalog,
  });
  assert(res.noChanges === false, "dolor 7 hombro ⇒ ajusta");
  if (!res.noChanges) {
    const allBlocks = res.result.weeks.flatMap((w) => w.days.flatMap((d) => d.blocks));
    assert(!allBlocks.some((b) => b.exercise_name === "Press de Banca - Fuerza"), "press banca sustituido");
    assert(!allBlocks.some((b) => b.exercise_name === "Mi bloque propio"), "bloque manual nunca emitido");
    const wed = res.result.weeks[0].days.find((d) => d.day_of_week === "Miércoles");
    assert(wed?.is_rest === false, "día con bloque manual no se marca descanso");
  }
}
{
  // Adherencia 30% ⇒ esqueleto mínimo
  const res = adjustMesocyclePlanRules({
    athlete: makeAthlete({}), checkin: { ...baseCheckin, adherence_pct: 30 }, recentCheckins: [],
    finishedWeekBlocks: [], futureWeeks: makeFutureWeeks(), exercises: catalog,
  });
  assert(res.noChanges === false, "adherencia 30 ⇒ ajusta");
}
{
  // Determinismo del ajuste
  const args = {
    athlete: makeAthlete({}), checkin: { ...baseCheckin, pain_by_zone: { elbow_l: 7 } }, recentCheckins: [],
    finishedWeekBlocks: [], futureWeeks: makeFutureWeeks(), exercises: catalog,
  };
  const a = adjustMesocyclePlanRules(args);
  const b = adjustMesocyclePlanRules(args);
  assert(JSON.stringify(a) === JSON.stringify(b), "determinismo del ajuste");
}

console.log(`\n${checks} checks, ${failures} fallos.`);
process.exit(failures > 0 ? 1 : 0);
