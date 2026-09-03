"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Textarea, CategoryTag, Modal, Spinner } from "./ui";
import { PAIN_ZONES, type Athlete, type Block, type Evaluation, type Exercise, type PainZoneKey, type SetLog } from "@/lib/types";
import { parseRestSeconds, parseSetsCount, formatClock } from "@/lib/parseRest";
import { estimateBlockMinutes, estimateSessionMinutes } from "@/lib/estimateTime";
import { computeReadiness, type ReadinessInput } from "@/lib/readiness";
import { suggestAlternatives, type AlternativeSuggestion } from "@/lib/planner/substitute";
import { ExerciseMediaPanel } from "./ExerciseMediaPanel";
import { Play, Pause, SkipForward, Rewind, FastForward, X, Check, Plus, Trash2, TriangleAlert, Shuffle, Video } from "lucide-react";

/** RPE real, dolor con zona y comentario de un bloque, capturados durante la sesión guiada. */
type BlockFeedback = { rpe: string; pain: number; painZone: PainZoneKey | null };

function emptyFeedback(block: Block): BlockFeedback {
  return {
    rpe: block.actual_rpe ?? "",
    pain: block.pain_during ?? 0,
    painZone: block.pain_zone ?? null,
  };
}

type Props = {
  dayLabel: string;
  blocks: Block[];
  athleteId: string;
  /** Si tiene lesión activa, sus restricciones se muestran durante toda la sesión (Fase 3.2). */
  athlete?: Athlete | null;
  /** Empezar directo en este ejercicio (play individual desde la lista), saltando el check-in de disponibilidad. Sin esto, resume automáticamente donde quedó si ya hay series marcadas. */
  initialIndex?: number;
  onClose: () => void;
  onFinished: () => void;
};

const EMPTY_READINESS: ReadinessInput = {
  sleep_quality: null,
  fatigue_general: null,
  fatigue_fingers: null,
  motivation: null,
};

const DEFAULT_REST = 90; // si el bloque no declara descanso interpretable

/** Reps por serie por defecto: el texto planificado del bloque (ej. "6 reps"). */
function defaultReps(block: Block): string {
  return block.reps_or_time ?? block.time ?? "";
}

type SetTarget = { kind: "reps"; reps: number } | { kind: "time"; seconds: number };

/**
 * Qué pide la serie: repeticiones o tiempo de trabajo. Define qué muestra el
 * círculo grande del reproductor -- un número de reps o un cronómetro.
 *
 * El texto viene del plan y mezcla trabajo y descanso en la misma celda
 * ("4x10s/90s descanso", "5 reps/2min descanso"), así que el orden importa:
 * si nombra reps es por repeticiones; si no, la primera duración que NO sea un
 * descanso es la de trabajo (el "4x" de "4x10s" es un conteo, no una duración;
 * en "3 rondas/2min descanso" la única duración es el descanso, así que no hay
 * cronómetro que valga). Los rangos ("30-40s") toman el extremo bajo, igual
 * que parseRestSeconds.
 */
function parseSetTarget(text: string | null | undefined): SetTarget | null {
  if (!text) return null;
  const t = text.toLowerCase();

  if (t.includes("rep")) {
    const n = t.match(/\d+/);
    return n ? { kind: "reps", reps: Number(n[0]) } : null;
  }

  const timeRe = /(\d+)\s*(?:-\s*\d+\s*)?(segundos|seg|s|minutos|min|m)\b\s*(descanso|pausa|off|rest)?/g;
  for (const m of t.matchAll(timeRe)) {
    if (m[3]) continue;
    const n = Number(m[1]);
    return { kind: "time", seconds: m[2].startsWith("m") ? n * 60 : n };
  }

  // Un número suelto (el atleta escribió "4" a mano) son repeticiones.
  const bare = t.match(/^\s*~?(\d+)\s*$/);
  return bare ? { kind: "reps", reps: Number(bare[1]) } : null;
}

function initSetLogs(block: Block): SetLog[] {
  if (Array.isArray(block.set_logs) && block.set_logs.length > 0) {
    return block.set_logs.map((s) => ({ reps: s.reps ?? "", load: s.load ?? "", done: !!s.done }));
  }
  const n = parseSetsCount(block.sets);
  return Array.from({ length: n }, () => ({ reps: defaultReps(block), load: block.load ?? "", done: false }));
}

export function SessionPlayer({ dayLabel, blocks, athleteId, athlete, initialIndex, onClose, onFinished }: Props) {
  // Estado local, inicializado una sola vez desde `blocks`: igual que `logs`/
  // `feedback` de abajo, no se resincroniza con la prop durante la sesión.
  // Necesario (no un useMemo) porque intercambiar un ejercicio por una
  // alternativa (Fase 3.1) debe reflejarse en la pantalla sin cerrar y
  // reabrir el reproductor.
  const [exercises, setExercises] = useState<Block[]>(() => blocks.filter((b) => b.exercise_name_freetext));

  // Si ya hay series marcadas (se retoma una sesión que se cerró a mitad de
  // camino), no tiene sentido volver a pedir el check-in de disponibilidad
  // ni empezar en play individual: solo se pide en un arranque genuinamente
  // nuevo de toda la sesión.
  const hasAnyProgress = exercises.some((b) => initSetLogs(b).some((s) => s.done));
  const [readinessOpen, setReadinessOpen] = useState(exercises.length > 0 && initialIndex === undefined && !hasAnyProgress);
  const [readiness, setReadiness] = useState<ReadinessInput>(EMPTY_READINESS);

  // Play individual (Fase de correcciones): initialIndex ubica un ejercicio
  // puntual. Sin eso, resume automáticamente en el primer ejercicio con una
  // serie sin marcar -- antes esto siempre arrancaba en 0 y cerrar a mitad de
  // sesión (el botón X no guardaba nada) obligaba a empezar de cero.
  const [index, setIndex] = useState(() => {
    if (initialIndex !== undefined) return Math.min(Math.max(initialIndex, 0), Math.max(exercises.length - 1, 0));
    const firstUnfinished = exercises.findIndex((b) => initSetLogs(b).some((s) => !s.done));
    return firstUnfinished === -1 ? 0 : firstUnfinished;
  });
  const [logs, setLogs] = useState<Record<string, SetLog[]>>(() =>
    Object.fromEntries(exercises.map((b) => [b.id, initSetLogs(b)])),
  );
  const [feedback, setFeedback] = useState<Record<string, BlockFeedback>>(() =>
    Object.fromEntries(exercises.map((b) => [b.id, emptyFeedback(b)])),
  );
  const [sessionComment, setSessionComment] = useState("");
  // Descanso: null = no hay; number = segundos restantes. `restAdvances`
  // indica si al terminar el descanso hay que pasar al siguiente ejercicio
  // (descanso entre ejercicios) o quedarse en el mismo (descanso entre series).
  const [restLeft, setRestLeft] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState(0);
  const [restAdvances, setRestAdvances] = useState(false);
  const [paused, setPaused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const [injuryOpen, setInjuryOpen] = useState(false);

  const current = exercises[index];
  const next = exercises[index + 1] ?? null;
  const resting = restLeft !== null;

  // Countdown del descanso. Toda transición de estado ocurre dentro del
  // callback del interval (permitido), nunca en el cuerpo del efecto.
  useEffect(() => {
    if (!resting || paused) return;
    const id = setInterval(() => {
      setRestLeft((v) => {
        if (v === null) return null;
        if (v <= 1) {
          if (restAdvances) setIndex((i) => Math.min(i + 1, exercises.length - 1));
          return null;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [resting, paused, restAdvances, exercises.length]);

  function startRest(block: Block, advances: boolean) {
    const secs = parseRestSeconds(block.rest) ?? DEFAULT_REST;
    setRestTotal(secs);
    setRestLeft(secs);
    setRestAdvances(advances);
    setPaused(false);
  }

  function updateSet(blockId: string, setIdx: number, patch: Partial<SetLog>) {
    setLogs((all) => {
      const cur = all[blockId];
      const prevLoad = cur[setIdx]?.load ?? "";
      const rows = cur.map((s, i) => (i === setIdx ? { ...s, ...patch } : s));
      // La carga suele ser la misma en todas las series: al escribirla se
      // replica hacia abajo en vez de obligar a retipearla 3-5 veces. Solo
      // pisa series que todavía arrastran el valor anterior (o están vacías);
      // una serie ya hecha, o con una carga propia distinta, no se toca.
      if (patch.load !== undefined) {
        for (let i = setIdx + 1; i < rows.length; i++) {
          if (rows[i].done) continue;
          if (rows[i].load === prevLoad || rows[i].load === "") rows[i] = { ...rows[i], load: patch.load };
        }
      }
      return { ...all, [blockId]: rows };
    });
  }

  function addSet(blockId: string) {
    setLogs((all) => {
      const cur = all[blockId];
      const last = cur[cur.length - 1];
      return { ...all, [blockId]: [...cur, { reps: last?.reps ?? "", load: last?.load ?? "", done: false }] };
    });
  }

  function deleteSet(blockId: string, setIdx: number) {
    setLogs((all) => ({ ...all, [blockId]: all[blockId].filter((_, i) => i !== setIdx) }));
  }

  function updateFeedback(blockId: string, patch: Partial<BlockFeedback>) {
    setFeedback((all) => ({ ...all, [blockId]: { ...all[blockId], ...patch } }));
  }

  // Alternativas ante dolor (Fase 3.1, pedido #4 de Suri) -- catálogo, ficha
  // del atleta y última evaluación se buscan una sola vez, recién cuando se
  // pide la primera vez (la mayoría de las sesiones no tienen dolor).
  const [refData, setRefData] = useState<{ exercises: Exercise[]; athlete: Athlete | null; evaluation: Evaluation | null } | null>(null);
  const [altBlockId, setAltBlockId] = useState<string | null>(null);
  const [altLoading, setAltLoading] = useState(false);
  const [altSuggestions, setAltSuggestions] = useState<AlternativeSuggestion[]>([]);
  const [swapping, setSwapping] = useState(false);

  // Biblioteca de videos (Fase 4): el momento de mayor impacto para verla es
  // acá, ejecutando el ejercicio, en vez de tener que ir al catálogo antes.
  const [demoExerciseId, setDemoExerciseId] = useState<string | null>(null);

  async function openAlternatives(block: Block) {
    setAltBlockId(block.id);
    setAltLoading(true);
    setAltSuggestions([]);
    let data = refData;
    if (!data) {
      const supabase = createClient();
      const [{ data: exerciseRows }, { data: athleteRow }, { data: evalRows }] = await Promise.all([
        supabase.from("exercises").select("*"),
        supabase.from("athletes").select("*").eq("id", athleteId).single(),
        supabase.from("evaluations").select("*").eq("athlete_id", athleteId).order("eval_date", { ascending: false }).limit(1),
      ]);
      data = {
        exercises: (exerciseRows as Exercise[]) ?? [],
        athlete: (athleteRow as Athlete) ?? null,
        evaluation: (evalRows?.[0] as Evaluation) ?? null,
      };
      setRefData(data);
    }
    const fb = feedback[block.id];
    const zoneKey = fb?.painZone ?? block.pain_zone;
    const level = fb?.pain ?? block.pain_during ?? 0;
    if (data.athlete && zoneKey) {
      setAltSuggestions(
        suggestAlternatives({
          block,
          painZoneKey: zoneKey,
          painLevel: level,
          exercises: data.exercises,
          athlete: data.athlete,
          evaluation: data.evaluation,
        }),
      );
    }
    setAltLoading(false);
  }

  async function applyAlternative(suggestion: AlternativeSuggestion) {
    if (!altBlockId) return;
    setSwapping(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("swap_block_exercise", {
      p_block_id: altBlockId,
      p_exercise_id: suggestion.exercise.id,
      p_exercise_name: suggestion.exercise.name,
      p_note: suggestion.note,
    });
    setSwapping(false);
    if (error) {
      alert("No se pudo aplicar el cambio: " + error.message);
      return;
    }
    setExercises((all) =>
      all.map((b) =>
        b.id === altBlockId
          ? { ...b, exercise_id: suggestion.exercise.id, exercise_name_freetext: suggestion.exercise.name, kinesio_notes: suggestion.note, manually_edited: true }
          : b,
      ),
    );
    setAltBlockId(null);
  }

  function updateReadiness(patch: Partial<ReadinessInput>) {
    setReadiness((r) => ({ ...r, ...patch }));
  }

  // Se guarda en paralelo, sin bloquear el arranque de la sesión: es una
  // sugerencia informativa, no algo de lo que dependa el resto del flujo.
  function closeReadiness(submit: boolean) {
    setReadinessOpen(false);
    if (!submit) return;
    const { score, suggestion } = computeReadiness(readiness);
    const supabase = createClient();
    supabase
      .from("session_checkins")
      .insert({
        athlete_id: athleteId,
        day_id: exercises[0]?.day_id ?? null,
        ...readiness,
        readiness_score: score,
        suggested_adjustment: suggestion,
      })
      .then(({ error }) => {
        if (error) console.error("No se pudo guardar el check-in de disponibilidad:", error.message);
      });
  }

  /** Payload de blocks.update() para un bloque, a partir de sus set_logs actuales. Compartido entre el checkpoint por serie y el guardado completo. */
  function buildBlockUpdate(block: Block, setLogsForBlock: SetLog[], isLastBlock: boolean) {
    const doneSets = setLogsForBlock.filter((s) => s.done);
    const anyDone = doneSets.length > 0;
    const fb = feedback[block.id];
    const repsList = [...new Set(doneSets.map((s) => s.reps).filter(Boolean))];
    const loadList = [...new Set(doneSets.map((s) => s.load).filter(Boolean))];
    const blockComment = isLastBlock && sessionComment.trim() ? sessionComment.trim() : block.comment;
    return {
      set_logs: setLogsForBlock,
      completed: anyDone,
      completed_at: anyDone ? new Date().toISOString() : block.completed_at,
      actual_sets: anyDone ? String(doneSets.length) : block.actual_sets,
      actual_reps_or_time: repsList.length ? repsList.join(" / ") : block.actual_reps_or_time,
      actual_load: loadList.length ? loadList.join(" / ") : block.actual_load,
      actual_rpe: fb?.rpe || block.actual_rpe,
      pain_during: fb ? fb.pain : block.pain_during,
      pain_zone: fb && fb.pain > 0 ? fb.painZone : null,
      comment: blockComment,
    };
  }

  /** Guarda el progreso de todos los ejercicios. Se usa tanto al terminar la sesión como al cerrarla antes de tiempo. */
  async function saveProgress() {
    const supabase = createClient();
    const lastBlockId = exercises[exercises.length - 1]?.id;
    const updates = exercises.map((b) =>
      supabase
        .from("blocks")
        .update(buildBlockUpdate(b, logs[b.id] ?? [], b.id === lastBlockId))
        .eq("id", b.id),
    );
    await Promise.all(updates);
  }

  // Marca una serie como completada. Si quedan series → descanso entre series
  // (se queda en el ejercicio). Si era la última → descanso entre ejercicios
  // (avanza), o pantalla final si es el último ejercicio.
  function completeSet(setIdx: number) {
    if (!current) return;
    const nextLogs = current && logs[current.id].map((s, i) => (i === setIdx ? { ...s, done: true } : s));
    setLogs((all) => ({ ...all, [current.id]: nextLogs! }));
    // Checkpoint inmediato: si la sesión se cierra (o el navegador se cae)
    // justo después de esto, la serie ya queda guardada -- antes nada se
    // persistía hasta la pantalla final, así que cerrar a mitad de camino
    // perdía todo lo hecho.
    const isLastBlock = current.id === exercises[exercises.length - 1]?.id;
    const supabase = createClient();
    supabase
      .from("blocks")
      .update(buildBlockUpdate(current, nextLogs!, isLastBlock))
      .eq("id", current.id)
      .then(({ error }) => {
        if (error) console.error("No se pudo guardar el progreso de la serie:", error.message);
      });
    const allDone = nextLogs!.every((s) => s.done);
    if (allDone) {
      if (index >= exercises.length - 1) setFinished(true);
      else startRest(current, true);
    } else {
      startRest(current, false);
    }
  }

  function endRest() {
    setPaused(false);
    if (restAdvances) setIndex((i) => Math.min(i + 1, exercises.length - 1));
    setRestLeft(null);
  }
  function goToNextExercise() {
    setRestLeft(null);
    setPaused(false);
    setIndex((i) => Math.min(i + 1, exercises.length - 1));
  }
  function adjustRest(delta: number) {
    setRestLeft((v) => (v === null ? null : Math.max(1, v + delta)));
    setRestTotal((t) => Math.max(1, t + Math.max(0, delta)));
  }

  async function finishSession() {
    setSaving(true);
    await saveProgress();
    setSaving(false);
    onFinished();
  }

  // Cerrar a mitad de sesión (botón X) ahora guarda lo hecho hasta ese punto
  // en vez de descartarlo -- es exactamente el mismo guardado que "Terminar
  // sesión", solo que sin exigir que todos los ejercicios estén completos.
  async function handleClose() {
    setSaving(true);
    await saveProgress();
    setSaving(false);
    onClose();
  }

  if (exercises.length === 0) return null;

  const completedExercises = exercises.filter((b) => (logs[b.id] ?? []).some((s) => s.done)).length;
  const progressPct = Math.round((completedExercises / exercises.length) * 100);

  const hasInjury = !!(athlete?.has_active_injury && (athlete.injury_restrictions || athlete.injury_location));
  const injuryTitle = `Lesión activa${athlete?.injury_location ? ` (${athlete.injury_location})` : ""}`;
  const injuryText = athlete?.injury_restrictions ?? "Respetá el dolor durante el ejercicio.";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-divider)]">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{dayLabel}</p>
          <p className="text-xs text-[var(--color-text)]/50">
            {completedExercises} / {exercises.length} ejercicios &middot; ~{estimateSessionMinutes(exercises)} min
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasInjury && !readinessOpen && (
            <button
              onClick={() => setInjuryOpen(true)}
              className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-[var(--color-attention-100)] text-[var(--color-attention-800)] border border-[var(--color-attention-300)]"
              aria-label="Ver restricciones por lesión"
            >
              <TriangleAlert size={12} strokeWidth={2.75} aria-hidden="true" /> Lesión
            </button>
          )}
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-[var(--color-text)]/50 hover:text-[var(--color-text)] p-1 disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <div className="h-1 bg-[var(--color-divider)]">
        <div className="h-full bg-[var(--color-accent-500)] transition-[width]" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Entrenando, el detalle de la lesión vive detrás del chip del header:
          ocupaba media pantalla en el móvil justo donde van las series. Antes
          de arrancar (check-in) sí se muestra entero -- ahí no compite con nada. */}
      {hasInjury && readinessOpen && (
        <div className="flex items-start gap-2 px-4 py-2 bg-[var(--color-attention-100)] text-[var(--color-attention-800)] text-xs border-b border-[var(--color-attention-300)]">
          <TriangleAlert size={13} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-medium">{injuryTitle}.</span> {injuryText}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {readinessOpen ? (
          <ReadinessScreen readiness={readiness} onChange={updateReadiness} onSubmit={() => closeReadiness(true)} onSkip={() => closeReadiness(false)} />
        ) : finished ? (
          <FinishScreen
            total={exercises.length}
            completed={completedExercises}
            saving={saving}
            comment={sessionComment}
            onCommentChange={setSessionComment}
            onFinish={finishSession}
          />
        ) : resting ? (
          <RestScreen
            secondsLeft={restLeft!}
            secondsTotal={restTotal}
            paused={paused}
            nextLabel={restAdvances ? (next?.exercise_name_freetext ?? "Fin de la sesión") : "Siguiente serie"}
            onTogglePause={() => setPaused((p) => !p)}
            onEnd={endRest}
            onAdjust={adjustRest}
            // El descanso entre ejercicios (no entre series) es el momento natural
            // para pedir feedback del ejercicio que se acaba de terminar.
            finishedExercise={restAdvances && current ? current : null}
            feedback={current ? feedback[current.id] : undefined}
            onFeedbackChange={current ? (patch) => updateFeedback(current.id, patch) : undefined}
          />
        ) : current ? (
          <ExerciseScreen
            block={current}
            index={index}
            total={exercises.length}
            sets={logs[current.id] ?? []}
            feedback={feedback[current.id]}
            onFeedbackChange={(patch) => updateFeedback(current.id, patch)}
            onSetField={(i, patch) => updateSet(current.id, i, patch)}
            onCompleteSet={completeSet}
            onAddSet={() => addSet(current.id)}
            onDeleteSet={(i) => deleteSet(current.id, i)}
            onShowAlternatives={() => openAlternatives(current)}
            onShowDemo={current.exercise_id ? () => setDemoExerciseId(current.exercise_id) : undefined}
          />
        ) : null}
      </div>

      <Modal open={injuryOpen} onClose={() => setInjuryOpen(false)} title={injuryTitle}>
        <p className="text-sm text-[var(--color-text)]/80 whitespace-pre-line">{injuryText}</p>
      </Modal>

      <Modal open={!!demoExerciseId} onClose={() => setDemoExerciseId(null)} title="Videos del ejercicio">
        {demoExerciseId && <ExerciseMediaPanel exerciseId={demoExerciseId} />}
      </Modal>

      <AlternativesModal
        open={!!altBlockId}
        loading={altLoading}
        suggestions={altSuggestions}
        swapping={swapping}
        onApply={applyAlternative}
        onClose={() => setAltBlockId(null)}
      />

      {!readinessOpen && !finished && !resting && current && (
        <div className="px-4 py-3 border-t border-[var(--color-divider)] flex items-center gap-2">
          {index > 0 && (
            <Button variant="secondary" onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              <Rewind size={14} strokeWidth={2.75} aria-hidden="true" /> Anterior
            </Button>
          )}
          {index < exercises.length - 1 ? (
            <Button variant="secondary" className="flex-1 justify-center" onClick={goToNextExercise}>
              Siguiente ejercicio <SkipForward size={14} strokeWidth={2.75} aria-hidden="true" />
            </Button>
          ) : (
            <Button variant="secondary" className="flex-1 justify-center" onClick={() => setFinished(true)}>
              Terminar sesión
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const READINESS_LEVELS: [number, string][] = [
  [2, "Muy mal"],
  [4, "Regular"],
  [6, "Normal"],
  [8, "Bien"],
  [10, "Genial"],
];

function ReadinessRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <p className="text-sm mb-1.5">{label}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {READINESS_LEVELS.map(([n, levelLabel]) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`py-2 rounded-lg text-[11px] leading-tight ${
              value === n
                ? "bg-[var(--color-accent-500)] text-[var(--color-bg)]"
                : "border border-[var(--color-divider)] text-[var(--color-text)]/60 hover:border-[var(--color-accent-500)]"
            }`}
          >
            {levelLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Check-in de disponibilidad antes de empezar. Pedido de Rorro ("puntaje que
 * ayuda a graduar la sesión"), pensado para completarse en pocos segundos:
 * 4 filas de un tap cada una, y "Saltar" siempre visible y sin fricción —
 * Cris advirtió sobre su propio registro diario opcional que "medio pajero,
 * pocos lo completan", así que esto nunca debe sentirse obligatorio.
 */
function ReadinessScreen({
  readiness,
  onChange,
  onSubmit,
  onSkip,
}: {
  readiness: ReadinessInput;
  onChange: (patch: Partial<ReadinessInput>) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="px-5 py-8 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-1">Antes de arrancar</h2>
      <p className="text-sm text-[var(--color-text)]/60 mb-6">¿Cómo llegás hoy? Toca una opción por fila (opcional).</p>

      <ReadinessRow label="Sueño" value={readiness.sleep_quality} onChange={(v) => onChange({ sleep_quality: v })} />
      <ReadinessRow label="Fatiga general" value={readiness.fatigue_general} onChange={(v) => onChange({ fatigue_general: v })} />
      <ReadinessRow label="Fatiga de dedos" value={readiness.fatigue_fingers} onChange={(v) => onChange({ fatigue_fingers: v })} />
      <ReadinessRow label="Motivación" value={readiness.motivation} onChange={(v) => onChange({ motivation: v })} />

      <Button className="w-full justify-center mt-2" onClick={onSubmit}>
        Empezar sesión
      </Button>
      <button onClick={onSkip} className="w-full text-center mt-3 text-sm text-[var(--color-text)]/50 hover:text-[var(--color-text)]">
        Saltar
      </button>
    </div>
  );
}

function ExerciseScreen({
  block,
  index,
  total,
  sets,
  feedback,
  onFeedbackChange,
  onSetField,
  onCompleteSet,
  onAddSet,
  onDeleteSet,
  onShowAlternatives,
  onShowDemo,
}: {
  block: Block;
  index: number;
  total: number;
  sets: SetLog[];
  feedback: BlockFeedback;
  onFeedbackChange: (patch: Partial<BlockFeedback>) => void;
  onSetField: (setIdx: number, patch: Partial<SetLog>) => void;
  onCompleteSet: (setIdx: number) => void;
  onAddSet: () => void;
  onDeleteSet: (setIdx: number) => void;
  onShowAlternatives: () => void;
  /** undefined si el bloque no está linkeado a un ejercicio del catálogo (freetext suelto o de la IA). */
  onShowDemo?: () => void;
}) {
  const meta = [block.reps_or_time, block.load, block.rpe_target && `RPE ${block.rpe_target}`, `~${estimateBlockMinutes(block)} min`]
    .filter(Boolean)
    .join(" · ");
  const nextUndone = sets.findIndex((s) => !s.done);

  return (
    <div className="px-5 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs uppercase tracking-wide text-[var(--color-accent-500)]">
          Ejercicio {index + 1} de {total}
        </p>
        <CategoryTag category={block.category} />
        {block.work_type && (
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--color-neutral-200)] text-[var(--color-text)]/60">
            {block.work_type === "fisico" ? "Físico" : "Técnico"}
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="text-2xl font-semibold leading-tight whitespace-pre-line">{block.exercise_name_freetext}</h2>
        {onShowDemo && (
          <button
            onClick={onShowDemo}
            className="shrink-0 flex items-center gap-1 text-sm text-[var(--color-accent-700)] hover:underline mt-1"
          >
            <Video size={14} strokeWidth={2.5} aria-hidden="true" /> Ver demo
          </button>
        )}
      </div>
      {meta && <p className="text-sm text-[var(--color-text)]/70 mb-3">{meta}</p>}

      {block.kinesio_notes && (
        <div className="flex items-start gap-2 text-sm text-[var(--color-accent-700)] bg-[var(--color-accent-100)]/40 rounded-lg p-3 mb-4">
          <TriangleAlert size={15} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{block.kinesio_notes}</span>
        </div>
      )}

      {/* Serie actual en grande, al centro: muestra lo que la serie pide (reps
          o cronómetro). La tabla de abajo queda siempre visible para agregar
          series o ajustar reps/carga. */}
      {nextUndone !== -1 ? (
        <SetHero
          key={`${block.id}-${nextUndone}`}
          target={parseSetTarget(sets[nextUndone]?.reps || defaultReps(block))}
          setNumber={nextUndone + 1}
          totalSets={sets.length}
          onComplete={() => onCompleteSet(nextUndone)}
        />
      ) : (
        <div className="flex flex-col items-center py-6 mb-2">
          <div className="w-32 h-32 rounded-full bg-[var(--color-accent-100)] text-[var(--color-accent-700)] flex items-center justify-center">
            <Check size={48} strokeWidth={2.75} aria-hidden="true" />
          </div>
          <p className="text-sm text-[var(--color-text)]/60 mt-3">Todas las series hechas</p>
        </div>
      )}

      {/* Encabezado de columnas */}
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center px-1 mb-1 text-xs text-[var(--color-text)]/50">
        <span className="w-8">Serie</span>
        <span>Reps / tiempo</span>
        <span>Carga</span>
        <span className="w-20 text-right">Hecha</span>
      </div>

      <div className="space-y-2">
        {sets.map((s, i) => {
          const isCurrent = i === nextUndone;
          return (
            <div
              key={i}
              className={`grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center rounded-lg p-2.5 border ${
                s.done
                  ? "border-[var(--color-accent-300)] bg-[var(--color-accent-100)]/30"
                  : isCurrent
                    ? "border-[var(--color-accent-500)]"
                    : "border-[var(--color-divider)]"
              }`}
            >
              <span className="w-8 text-center text-sm font-medium">{i + 1}</span>
              {/* Los campos vienen precargados con lo planificado ("Protocolo",
                  "+16 kg"): seleccionar todo al enfocar hace que escribir lo
                  reemplace de una, sin tener que borrar caracter por caracter
                  en el móvil. */}
              <Input
                value={s.reps}
                onChange={(e) => onSetField(i, { reps: e.target.value })}
                onFocus={(e) => e.currentTarget.select()}
                placeholder="reps"
                className="!min-h-[44px] !py-2"
              />
              <Input
                value={s.load}
                onChange={(e) => onSetField(i, { load: e.target.value })}
                onFocus={(e) => e.currentTarget.select()}
                placeholder="carga"
                className="!min-h-[44px] !py-2"
              />
              <div className="w-20 flex items-center justify-end gap-1">
                {sets.length > 1 && (
                  <button
                    onClick={() => onDeleteSet(i)}
                    className="text-[var(--color-text)]/30 hover:text-red-500 p-2"
                    aria-label={`Borrar serie ${i + 1}`}
                  >
                    <Trash2 size={15} strokeWidth={2.5} />
                  </button>
                )}
                <button
                  onClick={() => (s.done ? onSetField(i, { done: false }) : onCompleteSet(i))}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    s.done
                      ? "bg-[var(--color-accent-500)] text-[var(--color-bg)]"
                      : "border border-[var(--color-divider)] text-[var(--color-text)]/30 hover:border-[var(--color-accent-500)]"
                  }`}
                  aria-label={s.done ? `Serie ${i + 1} hecha` : `Marcar serie ${i + 1}`}
                >
                  <Check size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onAddSet} className="mt-3 flex items-center gap-1 text-sm text-[var(--color-accent-700)] hover:underline">
        <Plus size={14} strokeWidth={2.75} aria-hidden="true" /> Agregar serie
      </button>

      <div className="mt-5 pt-4 border-t border-[var(--color-divider)]">
        <ExerciseFeedback feedback={feedback} onChange={onFeedbackChange} />
        {feedback.pain >= 3 && feedback.painZone && (
          <button
            onClick={onShowAlternatives}
            className="mt-3 flex items-center gap-1.5 text-sm text-[var(--color-accent-700)] hover:underline"
          >
            <Shuffle size={14} strokeWidth={2.5} aria-hidden="true" /> Ver alternativas sin esa molestia
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Círculo central de la serie en curso. Muestra lo que la serie PIDE -- las
 * repeticiones a hacer, o un cronómetro de trabajo si es por tiempo (hangs,
 * ARC, planchas) -- en vez del número de serie, que ya se lee en la tabla de
 * abajo y no aporta nada mirando el teléfono a mitad de un hang.
 *
 * Se remonta con key por serie, así que el estado del cronómetro arranca
 * limpio en cada serie sin resincronizar nada en un efecto.
 */
function SetHero({
  target,
  setNumber,
  totalSets,
  onComplete,
}: {
  target: SetTarget | null;
  setNumber: number;
  totalSets: number;
  onComplete: () => void;
}) {
  const seconds = target?.kind === "time" ? target.seconds : 0;
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!running || left <= 0) return;
    const id = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [running, left]);

  // El cronómetro llegó a cero: la serie queda hecha y arranca el descanso.
  // El ref evita que un doble render en dev la marque dos veces.
  useEffect(() => {
    if (seconds === 0 || left > 0 || firedRef.current) return;
    firedRef.current = true;
    onComplete();
  }, [seconds, left, onComplete]);

  let display: string;
  let unit: string;
  if (target?.kind === "reps") {
    display = String(target.reps);
    unit = target.reps === 1 ? "rep" : "reps";
  } else if (target?.kind === "time") {
    display = left < 60 ? String(left) : formatClock(left);
    unit = left < 60 ? "seg" : "min";
  } else {
    display = String(setNumber);
    unit = "serie";
  }

  const isTime = target?.kind === "time";
  const hint = isTime
    ? running
      ? "toca para pausar"
      : left === seconds
        ? "toca para iniciar"
        : "toca para seguir"
    : "toca para marcarla";

  return (
    <div className="flex flex-col items-center py-6 mb-2">
      <button
        onClick={() => (isTime ? setRunning((r) => !r) : onComplete())}
        className={`w-32 h-32 rounded-full bg-[var(--color-accent-500)] text-[var(--color-bg)] flex flex-col items-center justify-center shadow-[var(--shadow-organic-md)] active:scale-95 transition-transform ${
          running ? "ring-4 ring-[var(--color-accent-300)]" : ""
        }`}
        aria-label={isTime ? `${running ? "Pausar" : "Iniciar"} serie ${setNumber}` : `Marcar serie ${setNumber} hecha`}
      >
        <span className="text-5xl font-bold tabular-nums leading-none">{display}</span>
        <span className="text-[11px] uppercase tracking-wide opacity-80 mt-1">{unit}</span>
      </button>
      <p className="text-sm text-[var(--color-text)]/60 mt-3">
        Serie {setNumber} de {totalSets} &middot; {hint}
      </p>
      {isTime && (
        <button onClick={onComplete} className="mt-1 text-xs text-[var(--color-accent-700)] hover:underline">
          Marcar hecha sin cronómetro
        </button>
      )}
    </div>
  );
}

/** Modal de sustitución de ejercicio (Fase 3.1): tres alternativas rankeadas, un toque intercambia. */
function AlternativesModal({
  open,
  loading,
  suggestions,
  swapping,
  onApply,
  onClose,
}: {
  open: boolean;
  loading: boolean;
  suggestions: AlternativeSuggestion[];
  swapping: boolean;
  onApply: (s: AlternativeSuggestion) => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Alternativas sin esa molestia">
      {loading ? (
        <Spinner />
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-[var(--color-text)]/50">
          No encontramos una alternativa segura en el catálogo para esta zona. Avisale a tu entrenador.
        </p>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s.exercise.id} className="border border-[var(--color-divider)] rounded-lg p-3">
              <p className="font-medium mb-1">{s.exercise.name}</p>
              <p className="text-xs text-[var(--color-text)]/55 mb-3">{s.note}</p>
              <Button variant="secondary" onClick={() => onApply(s)} disabled={swapping} className="w-full justify-center">
                {swapping ? "Aplicando..." : "Usar esta alternativa"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/**
 * RPE real, dolor 0-10 y zona (si dolió). Se muestra tanto en el ejercicio en
 * curso como en el descanso posterior, que es el momento donde Cris pidió
 * capturarlo ("evita el sesgo de preguntar dos semanas después").
 */
function ExerciseFeedback({
  label,
  feedback,
  onChange,
}: {
  label?: string;
  feedback: BlockFeedback;
  onChange: (patch: Partial<BlockFeedback>) => void;
}) {
  return (
    <div>
      {label && <p className="text-sm font-medium mb-2">{label}</p>}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs text-[var(--color-text)]/60 shrink-0">RPE real</span>
        <div className="flex gap-1 flex-wrap justify-end">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ rpe: String(n) })}
              className={`w-7 h-7 rounded-full text-xs flex items-center justify-center ${
                feedback.rpe === String(n)
                  ? "bg-[var(--color-accent-500)] text-[var(--color-bg)]"
                  : "border border-[var(--color-divider)] text-[var(--color-text)]/60 hover:border-[var(--color-accent-500)]"
              }`}
              aria-label={`RPE ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs text-[var(--color-text)]/60 shrink-0">¿Molestó algo? (0-10)</span>
        <div className="flex gap-1 flex-wrap justify-end">
          {Array.from({ length: 11 }, (_, i) => i).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ pain: n, painZone: n === 0 ? null : feedback.painZone })}
              className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center ${
                feedback.pain === n
                  ? n >= 5
                    ? "bg-[var(--color-attention-500)] text-white"
                    : "bg-[var(--color-accent-500)] text-[var(--color-bg)]"
                  : "border border-[var(--color-divider)] text-[var(--color-text)]/60 hover:border-[var(--color-accent-500)]"
              }`}
              aria-label={`Dolor ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {feedback.pain > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-end">
          {PAIN_ZONES.map(([key, zoneLabel]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ painZone: key })}
              className={`text-[11px] px-2 py-1 rounded-full border ${
                feedback.painZone === key
                  ? "border-[var(--color-attention-400)] bg-[var(--color-attention-100)] text-[var(--color-attention-700)]"
                  : "border-[var(--color-divider)] text-[var(--color-text)]/60"
              }`}
            >
              {zoneLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RestScreen({
  secondsLeft,
  secondsTotal,
  paused,
  nextLabel,
  onTogglePause,
  onEnd,
  onAdjust,
  finishedExercise,
  feedback,
  onFeedbackChange,
}: {
  secondsLeft: number;
  secondsTotal: number;
  paused: boolean;
  nextLabel: string;
  onTogglePause: () => void;
  onEnd: () => void;
  onAdjust: (delta: number) => void;
  /** Si no es null, el descanso es entre ejercicios: se pide feedback de este. */
  finishedExercise: Block | null;
  feedback?: BlockFeedback;
  onFeedbackChange?: (patch: Partial<BlockFeedback>) => void;
}) {
  const pct = secondsTotal > 0 ? Math.round(((secondsTotal - secondsLeft) / secondsTotal) * 100) : 0;
  return (
    <div className="px-5 py-8 max-w-lg mx-auto flex flex-col items-center text-center">
      <p className="text-sm text-[var(--color-text)]/60 mb-2">Descanso</p>
      <div className="text-6xl font-semibold tabular-nums mb-4">{formatClock(secondsLeft)}</div>
      <div className="w-full max-w-xs h-1.5 bg-[var(--color-divider)] rounded-full mb-6">
        <div className="h-full bg-[var(--color-accent-500)] rounded-full transition-[width]" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Button variant="secondary" onClick={() => onAdjust(-15)} aria-label="Restar 15 segundos">
          <Rewind size={16} strokeWidth={2.5} aria-hidden="true" /> 15s
        </Button>
        <button
          onClick={onTogglePause}
          className="w-14 h-14 rounded-full bg-[var(--color-accent-500)] text-[var(--color-bg)] flex items-center justify-center"
          aria-label={paused ? "Reanudar" : "Pausar"}
        >
          {paused ? <Play size={22} strokeWidth={2.5} /> : <Pause size={22} strokeWidth={2.5} />}
        </button>
        <Button variant="secondary" onClick={() => onAdjust(15)} aria-label="Sumar 15 segundos">
          15s <FastForward size={16} strokeWidth={2.5} aria-hidden="true" />
        </Button>
      </div>

      <p className="text-sm text-[var(--color-text)]/60">
        A continuación: <span className="text-[var(--color-text)] font-medium">{nextLabel.split("\n")[0]}</span>
      </p>
      <button onClick={onEnd} className="mt-4 text-sm text-[var(--color-accent-700)] hover:underline">
        Saltar descanso &rarr;
      </button>

      {finishedExercise && feedback && onFeedbackChange && (
        <div className="w-full max-w-xs mt-8 pt-6 border-t border-[var(--color-divider)] text-left">
          <ExerciseFeedback
            label={`¿Cómo estuvo "${finishedExercise.exercise_name_freetext}"?`}
            feedback={feedback}
            onChange={onFeedbackChange}
          />
        </div>
      )}
    </div>
  );
}

function FinishScreen({
  total,
  completed,
  saving,
  comment,
  onCommentChange,
  onFinish,
}: {
  total: number;
  completed: number;
  saving: boolean;
  comment: string;
  onCommentChange: (v: string) => void;
  onFinish: () => void;
}) {
  return (
    <div className="px-5 py-12 max-w-lg mx-auto flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-accent-500)] text-[var(--color-bg)] flex items-center justify-center mb-4">
        <Check size={30} strokeWidth={2.75} />
      </div>
      <h2 className="text-xl font-semibold mb-2">¡Sesión completa!</h2>
      <p className="text-sm text-[var(--color-text)]/60 mb-6">
        Completaste {completed} de {total} ejercicios.
      </p>
      <div className="w-full text-left mb-6">
        <label className="text-xs text-[var(--color-text)]/60 mb-1 block">¿Algo para contarle a tu entrenador? (opcional)</label>
        <Textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Cómo te sentiste, algo que notaste, una duda..."
          className="!min-h-[70px]"
        />
      </div>
      <Button className="w-full justify-center" onClick={onFinish} disabled={saving}>
        {saving ? "Guardando..." : "Guardar y salir"}
      </Button>
    </div>
  );
}
