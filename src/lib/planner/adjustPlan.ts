// Ajuste semanal algorítmico post check-in. Misma entrada que el camino IA
// (adjustMesocyclePlan) y misma salida (AiAdjustmentPlan con solo los bloques
// nuevos por día: los manually_edited nunca se emiten, writeAdjustment ya los
// preserva). Reglas destiladas de Fobital (manejo de fatiga/dolor/descarga) y
// del sistema de Diego, en orden de prioridad; se componen entre sí.
// Si ninguna señal dispara, devuelve noChanges (no se reescribe nada).
import { EXERCISE_CATEGORIES, type Athlete, type CheckIn, type Exercise } from "@/lib/types";
import type { AiAdjustmentPlan, AiBlock, AiWeek } from "@/lib/ai/mesocycleSchema";
import { validateAdjustmentPlan } from "@/lib/ai/adjustMesocycle";
import type { buildAdjustmentUserPrompt } from "@/lib/ai/mesocyclePrompt";
import { classifyExercise } from "./knowledge/exerciseMeta";
import { PAIN_RULES, kinesioNoteFor, normalizePainZone } from "./knowledge/painRules";
import { deriveProfile } from "./profile";
import { buildCandidates, candidatesForSlot } from "./selection";
import type { PainZoneGroup } from "./types";
import { RULES_ENGINE_MODEL, RulesPlannerError } from "./index";

type FutureWeeks = Parameters<typeof buildAdjustmentUserPrompt>[0]["futureWeeks"];
type FinishedBlocks = Parameters<typeof buildAdjustmentUserPrompt>[0]["finishedWeekBlocks"];

type AdjustResult =
  | { noChanges: true; reason: string }
  | { noChanges: false; result: AiAdjustmentPlan; model: string };

// El dolor por zona sale del check-in; el pain_during de los bloques cerrados
// no trae zona, así que se refleja solo como señal global vía el RPE.
function collectPain(checkin: CheckIn): Map<PainZoneGroup, number> {
  const pain = new Map<PainZoneGroup, number>();
  for (const [key, value] of Object.entries(checkin.pain_by_zone ?? {})) {
    const zone = normalizePainZone(key);
    if (zone && value > (pain.get(zone) ?? 0)) pain.set(zone, value);
  }
  return pain;
}

function shiftRpe(block: AiBlock, delta: number): void {
  const current = Number(block.rpe_target);
  if (!Number.isFinite(current)) return;
  block.rpe_target = String(Math.max(2, Math.min(10, current + delta)));
}

function reduceSets(block: AiBlock, factor: number): void {
  const current = Number(block.sets);
  if (!Number.isFinite(current)) return;
  block.sets = String(Math.max(1, Math.round(current * factor)));
}

function appendNote(block: AiBlock, note: string): void {
  block.kinesio_notes = block.kinesio_notes ? `${block.kinesio_notes} ${note}` : note;
}

export function adjustMesocyclePlanRules(params: {
  athlete: Athlete;
  checkin: CheckIn;
  recentCheckins: CheckIn[];
  finishedWeekBlocks: FinishedBlocks;
  futureWeeks: FutureWeeks;
  exercises: Exercise[];
}): AdjustResult {
  const { athlete, checkin, recentCheckins, finishedWeekBlocks, futureWeeks, exercises } = params;
  if (futureWeeks.length === 0) return { noChanges: true, reason: "no_future_weeks" };

  const catalogByName = new Map(exercises.map((e) => [e.name.trim().toLowerCase(), e]));
  const profile = deriveProfile(athlete, null);
  const candidates = buildCandidates(exercises);

  // ---- Señales ----
  const pain = collectPain(checkin);
  const excludeZones = new Set<PainZoneGroup>();
  const reduceZones = new Map<PainZoneGroup, number>();
  for (const [zone, level] of pain) {
    if (level >= PAIN_RULES[zone].excludeAt) excludeZones.add(zone);
    else if (level >= PAIN_RULES[zone].reduceAt) reduceZones.set(zone, level);
  }
  const painDuring = finishedWeekBlocks.some((b) => (b.pain_during ?? 0) >= 5);

  const adherence = checkin.adherence_pct;
  const lowAdherence = adherence != null && adherence < 50;
  const midAdherence = adherence != null && adherence >= 50 && adherence < 80;

  const trendDown =
    recentCheckins.length >= 3 &&
    recentCheckins.slice(0, 3).every((c) => (c.sleep_quality ?? 10) <= 5 || (c.motivation ?? 10) <= 5);
  const lowRecovery = (checkin.sleep_quality ?? 10) <= 4 || (checkin.motivation ?? 10) <= 4 || trendDown;

  const realRpes = finishedWeekBlocks.map((b) => Number(b.actual_rpe)).filter((n) => Number.isFinite(n));
  const avgRealRpe = realRpes.length ? realRpes.reduce((a, b) => a + b, 0) / realRpes.length : null;
  const rpeOvershoot = avgRealRpe != null && avgRealRpe > 8.5;

  const anySignal =
    excludeZones.size > 0 || reduceZones.size > 0 || painDuring || lowAdherence || midAdherence || lowRecovery || rpeOvershoot;
  if (!anySignal) return { noChanges: true, reason: "no_changes_needed" };

  // ---- Aplicar reglas sobre las semanas futuras ----
  const rationale: string[] = [];
  const nextWeekNumber = Math.min(...futureWeeks.map((w) => w.week_number));
  const outputWeeks: AiWeek[] = [];

  for (const week of futureWeeks) {
    let changed = false;
    const isNextWeek = week.week_number === nextWeekNumber;

    const days = week.days.map((day) => {
      const hasManual = day.blocks.some((b) => b.manually_edited);
      const editableBlocks = day.blocks.filter((b) => !b.manually_edited);

      const newBlocks: AiBlock[] = editableBlocks.map((b) => {
        const name = b.exercise_name_freetext ?? "";
        const catalogEx = catalogByName.get(name.trim().toLowerCase());
        const category = (EXERCISE_CATEGORIES as readonly string[]).includes(b.category ?? "")
          ? (b.category as AiBlock["category"])
          : "Otro";
        return {
          exercise_name: name,
          is_catalog_exercise: !!catalogEx,
          non_catalog_reason: catalogEx ? null : "Bloque preexistente del plan, conservado en el ajuste.",
          category,
          rpe_target: b.rpe_target,
          sets: b.sets,
          reps_or_time: b.reps_or_time,
          time: null,
          load: b.load,
          rest: b.rest,
          kinesio_notes: b.kinesio_notes,
        };
      });

      // 1. Dolor >=5: sustituir ejercicios que cargan la zona
      for (let i = 0; i < newBlocks.length; i++) {
        const block = newBlocks[i];
        const catalogEx = catalogByName.get(block.exercise_name.trim().toLowerCase());
        if (!catalogEx) continue;
        const meta = classifyExercise(catalogEx);
        const hitExclude = meta.zones.find((z) => excludeZones.has(z));
        if (hitExclude) {
          const rule = PAIN_RULES[hitExclude];
          const replacementRanked = candidatesForSlot(
            candidates,
            { category: "Conditioning", count: 1, preferTags: rule.preferInstead },
            profile,
            excludeZones,
          );
          const alt = replacementRanked[0];
          if (alt) {
            newBlocks[i] = {
              exercise_name: alt.exercise.name,
              is_catalog_exercise: true,
              non_catalog_reason: null,
              category: alt.exercise.category as AiBlock["category"],
              rpe_target: "4",
              sets: alt.exercise.typical_sets ?? "3",
              reps_or_time: alt.exercise.typical_reps ?? alt.exercise.typical_time ?? null,
              time: alt.exercise.typical_time ?? null,
              load: null,
              rest: "2-3 min",
              kinesio_notes: kinesioNoteFor(hitExclude, pain.get(hitExclude) ?? 5, "exclude"),
            };
          } else {
            newBlocks.splice(i, 1);
            i--;
          }
          changed = true;
          continue;
        }
        // 2. Dolor 3-4: mantener con RPE reducido + nota
        const hitReduce = meta.zones.find((z) => reduceZones.has(z));
        if (hitReduce) {
          shiftRpe(block, -1);
          appendNote(block, kinesioNoteFor(hitReduce, reduceZones.get(hitReduce)!, "reduce"));
          changed = true;
        }
      }

      // 3. Adherencia <50%: esqueleto mínimo (primer bloque + un core si hay)
      if (lowAdherence && newBlocks.length > 2) {
        const core = newBlocks.find((b) => {
          const ex = catalogByName.get(b.exercise_name.trim().toLowerCase());
          return ex && classifyExercise(ex).tags.includes("core");
        });
        const keep = [newBlocks[0]];
        if (core && core !== newBlocks[0]) keep.push(core);
        newBlocks.length = 0;
        newBlocks.push(...keep);
        appendNote(newBlocks[0], "Volumen reducido por adherencia baja: retomar el plan completo cuando se sostengan 2 semanas.");
        changed = true;
      }

      // 4-6. Señales de recuperación/RPE (semana siguiente solamente)
      if (isNextWeek) {
        if (excludeZones.size > 0 || painDuring) {
          newBlocks.forEach((b) => shiftRpe(b, -1));
          changed = true;
        }
        if (midAdherence || lowAdherence) {
          newBlocks.forEach((b) => {
            shiftRpe(b, -1);
            appendNote(b, "Progresión congelada esta semana (adherencia baja): repetir cargas de la semana anterior.");
          });
          if (newBlocks.length > 0) changed = true;
        }
        if (lowRecovery) {
          newBlocks.forEach((b) => shiftRpe(b, -1));
          changed = true;
        }
        if (rpeOvershoot) {
          newBlocks.forEach((b) => reduceSets(b, 0.85));
          changed = true;
        }
      }

      return {
        day_of_week: day.day_of_week as AiWeek["days"][number]["day_of_week"],
        day_focus: day.day_focus,
        // Un día con bloques fijos del atleta nunca es descanso
        is_rest: day.is_rest && !hasManual && newBlocks.length === 0,
        blocks: newBlocks,
      };
    });

    if (changed) {
      outputWeeks.push({
        week_number: week.week_number,
        load_type: week.load_type ?? "Ajustada",
        focus: week.focus,
        distribution: week.distribution,
        days,
      });
    }
  }

  if (outputWeeks.length === 0) return { noChanges: true, reason: "no_changes_needed" };

  if (excludeZones.size > 0)
    rationale.push(
      `Dolor ≥5 en ${[...excludeZones].map((z) => PAIN_RULES[z].zoneLabel).join(", ")}: se sustituyeron los ejercicios que cargan la zona y se bajó el RPE de la próxima semana.`,
    );
  if (reduceZones.size > 0)
    rationale.push(`Dolor moderado en ${[...reduceZones.keys()].map((z) => PAIN_RULES[z].zoneLabel).join(", ")}: RPE reducido en los ejercicios que la cargan.`);
  if (painDuring) rationale.push("Se registró dolor ≥5 durante bloques de la semana cerrada: RPE global reducido.");
  if (lowAdherence) rationale.push(`Adherencia ${adherence}%: se redujo el plan al esqueleto mínimo, sin progresión.`);
  if (midAdherence) rationale.push(`Adherencia ${adherence}%: progresión congelada, se repiten cargas.`);
  if (lowRecovery) rationale.push("Sueño/motivación bajos: RPE objetivo de la próxima semana reducido en 1 punto.");
  if (rpeOvershoot) rationale.push(`RPE real promedio ${avgRealRpe?.toFixed(1)}: volumen de la próxima semana reducido ~15%.`);

  const plan: AiAdjustmentPlan = { rationale: rationale.join(" "), weeks: outputWeeks };
  const issues = validateAdjustmentPlan(plan, exercises, futureWeeks.map((w) => w.week_number));
  if (issues.length > 0) {
    throw new RulesPlannerError(`El ajuste generado por reglas no pasó la validación: ${issues.join(" ")}`);
  }
  return { noChanges: false, result: plan, model: RULES_ENGINE_MODEL };
}
