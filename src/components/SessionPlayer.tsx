"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Textarea, CategoryTag } from "./ui";
import { PAIN_ZONES, type Block, type PainZoneKey, type SetLog } from "@/lib/types";
import { parseRestSeconds, parseSetsCount, formatClock } from "@/lib/parseRest";
import { estimateBlockMinutes, estimateSessionMinutes } from "@/lib/estimateTime";
import { computeReadiness, type ReadinessInput } from "@/lib/readiness";
import { Play, Pause, SkipForward, Rewind, FastForward, X, Check, Plus, Trash2, TriangleAlert } from "lucide-react";

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

function initSetLogs(block: Block): SetLog[] {
  if (Array.isArray(block.set_logs) && block.set_logs.length > 0) {
    return block.set_logs.map((s) => ({ reps: s.reps ?? "", load: s.load ?? "", done: !!s.done }));
  }
  const n = parseSetsCount(block.sets);
  return Array.from({ length: n }, () => ({ reps: defaultReps(block), load: block.load ?? "", done: false }));
}

export function SessionPlayer({ dayLabel, blocks, athleteId, onClose, onFinished }: Props) {
  const exercises = useMemo(() => blocks.filter((b) => b.exercise_name_freetext), [blocks]);

  // Se pide una sola vez, antes del primer ejercicio. Empieza cerrado (true = ya
  // se resolvió) si no hay ejercicios para no bloquear una sesión vacía.
  const [readinessOpen, setReadinessOpen] = useState(exercises.length > 0);
  const [readiness, setReadiness] = useState<ReadinessInput>(EMPTY_READINESS);

  const [index, setIndex] = useState(0);
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
    setLogs((all) => ({
      ...all,
      [blockId]: all[blockId].map((s, i) => (i === setIdx ? { ...s, ...patch } : s)),
    }));
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

  // Marca una serie como completada. Si quedan series → descanso entre series
  // (se queda en el ejercicio). Si era la última → descanso entre ejercicios
  // (avanza), o pantalla final si es el último ejercicio.
  function completeSet(setIdx: number) {
    if (!current) return;
    const nextLogs = current && logs[current.id].map((s, i) => (i === setIdx ? { ...s, done: true } : s));
    setLogs((all) => ({ ...all, [current.id]: nextLogs! }));
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
    const supabase = createClient();
    const nowIso = new Date().toISOString();
    const lastBlockId = exercises[exercises.length - 1]?.id;
    const updates = exercises.map((b) => {
      const setLogs = logs[b.id] ?? [];
      const doneSets = setLogs.filter((s) => s.done);
      const anyDone = doneSets.length > 0;
      const fb = feedback[b.id];
      // Deriva los actual_* para la lógica de ajuste existente.
      const repsList = [...new Set(doneSets.map((s) => s.reps).filter(Boolean))];
      const loadList = [...new Set(doneSets.map((s) => s.load).filter(Boolean))];
      // El comentario de la sesión (si se cargó) queda en el último bloque: no hay
      // un lugar propio para "comentario de sesión" en el esquema, y es el punto
      // natural donde el atleta lo escribió (pantalla de cierre).
      const blockComment = b.id === lastBlockId && sessionComment.trim() ? sessionComment.trim() : b.comment;
      return supabase
        .from("blocks")
        .update({
          set_logs: setLogs,
          completed: anyDone,
          completed_at: anyDone ? nowIso : b.completed_at,
          actual_sets: anyDone ? String(doneSets.length) : b.actual_sets,
          actual_reps_or_time: repsList.length ? repsList.join(" / ") : b.actual_reps_or_time,
          actual_load: loadList.length ? loadList.join(" / ") : b.actual_load,
          actual_rpe: fb?.rpe || b.actual_rpe,
          pain_during: fb ? fb.pain : b.pain_during,
          pain_zone: fb && fb.pain > 0 ? fb.painZone : null,
          comment: blockComment,
        })
        .eq("id", b.id);
    });
    await Promise.all(updates);
    setSaving(false);
    onFinished();
  }

  if (exercises.length === 0) return null;

  const completedExercises = exercises.filter((b) => (logs[b.id] ?? []).some((s) => s.done)).length;
  const progressPct = Math.round((completedExercises / exercises.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-divider)]">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{dayLabel}</p>
          <p className="text-xs text-[var(--color-text)]/50">
            {completedExercises} / {exercises.length} ejercicios &middot; ~{estimateSessionMinutes(exercises)} min
          </p>
        </div>
        <button onClick={onClose} className="text-[var(--color-text)]/50 hover:text-[var(--color-text)] p-1" aria-label="Cerrar">
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>
      <div className="h-1 bg-[var(--color-divider)]">
        <div className="h-full bg-[var(--color-accent-500)] transition-[width]" style={{ width: `${progressPct}%` }} />
      </div>

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
          />
        ) : null}
      </div>

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
      <h2 className="text-2xl font-semibold leading-tight mb-2 whitespace-pre-line">{block.exercise_name_freetext}</h2>
      {meta && <p className="text-sm text-[var(--color-text)]/70 mb-3">{meta}</p>}

      {block.kinesio_notes && (
        <div className="flex items-start gap-2 text-sm text-[var(--color-accent-700)] bg-[var(--color-accent-100)]/40 rounded-lg p-3 mb-4">
          <TriangleAlert size={15} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{block.kinesio_notes}</span>
        </div>
      )}

      {/* Encabezado de columnas */}
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center px-1 mb-1 text-xs text-[var(--color-text)]/50">
        <span className="w-8">Serie</span>
        <span>Reps / tiempo</span>
        <span>Carga</span>
        <span className="w-16 text-right">Hecha</span>
      </div>

      <div className="space-y-2">
        {sets.map((s, i) => {
          const isCurrent = i === nextUndone;
          return (
            <div
              key={i}
              className={`grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center rounded-lg p-2 border ${
                s.done
                  ? "border-[var(--color-accent-300)] bg-[var(--color-accent-100)]/30"
                  : isCurrent
                    ? "border-[var(--color-accent-500)]"
                    : "border-[var(--color-divider)]"
              }`}
            >
              <span className="w-8 text-center text-sm font-medium">{i + 1}</span>
              <Input
                value={s.reps}
                onChange={(e) => onSetField(i, { reps: e.target.value })}
                placeholder="reps"
                className="!min-h-[32px] !py-1"
              />
              <Input
                value={s.load}
                onChange={(e) => onSetField(i, { load: e.target.value })}
                placeholder="carga"
                className="!min-h-[32px] !py-1"
              />
              <div className="w-16 flex items-center justify-end gap-1">
                {sets.length > 1 && (
                  <button
                    onClick={() => onDeleteSet(i)}
                    className="text-[var(--color-text)]/30 hover:text-red-500 p-1"
                    aria-label={`Borrar serie ${i + 1}`}
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                )}
                <button
                  onClick={() => (s.done ? onSetField(i, { done: false }) : onCompleteSet(i))}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    s.done
                      ? "bg-[var(--color-accent-500)] text-[var(--color-bg)]"
                      : "border border-[var(--color-divider)] text-[var(--color-text)]/30 hover:border-[var(--color-accent-500)]"
                  }`}
                  aria-label={s.done ? `Serie ${i + 1} hecha` : `Marcar serie ${i + 1}`}
                >
                  <Check size={15} strokeWidth={3} />
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
      </div>
    </div>
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
                    ? "bg-red-500 text-white"
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
                  ? "border-red-400 bg-red-100 text-red-700"
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
