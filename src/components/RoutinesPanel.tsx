"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Field, Input, Select, Button, Modal, Spinner, EmptyState, CategoryTag } from "@/components/ui";
import { EXERCISE_CATEGORIES, type Exercise, type Routine, type RoutineItem } from "@/lib/types";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

type DraftItem = {
  exercise_id: string;
  sets: string;
  reps_or_time: string;
  time: string;
  rest: string;
};

function emptyDraft() {
  return { name: "", category: "Conditioning", description: "" };
}

export function RoutinesPanel({ canEdit, exercises }: { canEdit: boolean; exercises: Exercise[] }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [meta, setMeta] = useState(emptyDraft());
  const [items, setItems] = useState<DraftItem[]>([]);
  const [exercisePicker, setExercisePicker] = useState("");
  const [saving, setSaving] = useState(false);

  const exerciseById = new Map(exercises.map((e) => [e.id, e]));

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("routines").select("*").order("name");
    setRoutines((data as Routine[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
    load();
  }, []);

  function openNew() {
    setEditingId(null);
    setMeta(emptyDraft());
    setItems([]);
    setExercisePicker("");
    setModalOpen(true);
  }

  async function openEdit(routine: Routine) {
    setEditingId(routine.id);
    setMeta({ name: routine.name, category: routine.category ?? "Conditioning", description: routine.description ?? "" });
    const supabase = createClient();
    const { data } = await supabase.from("routine_items").select("*").eq("routine_id", routine.id).order("position");
    setItems(
      ((data as RoutineItem[]) ?? []).map((i) => ({
        exercise_id: i.exercise_id,
        sets: i.sets ?? "",
        reps_or_time: i.reps_or_time ?? "",
        time: i.time ?? "",
        rest: i.rest ?? "",
      })),
    );
    setExercisePicker("");
    setModalOpen(true);
  }

  function addItem(exerciseId: string) {
    if (!exerciseId) return;
    setItems((cur) => [...cur, { exercise_id: exerciseId, sets: "", reps_or_time: "", time: "", rest: "" }]);
    setExercisePicker("");
  }

  function removeItem(idx: number) {
    setItems((cur) => cur.filter((_, i) => i !== idx));
  }

  function moveItem(idx: number, dir: -1 | 1) {
    setItems((cur) => {
      const next = [...cur];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return cur;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function updateItem(idx: number, patch: Partial<DraftItem>) {
    setItems((cur) => cur.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  async function save() {
    if (!meta.name.trim() || items.length === 0) return;
    setSaving(true);
    const supabase = createClient();
    let routineId = editingId;
    if (routineId) {
      await supabase
        .from("routines")
        .update({ name: meta.name, category: meta.category, description: meta.description || null })
        .eq("id", routineId);
      await supabase.from("routine_items").delete().eq("routine_id", routineId);
    } else {
      const { data, error } = await supabase
        .from("routines")
        .insert({ name: meta.name, category: meta.category, description: meta.description || null })
        .select("id")
        .single();
      if (error || !data) {
        setSaving(false);
        alert("No se pudo crear la rutina: " + error?.message);
        return;
      }
      routineId = data.id;
    }
    const rows = items.map((it, i) => ({
      routine_id: routineId,
      exercise_id: it.exercise_id,
      position: i + 1,
      sets: it.sets || null,
      reps_or_time: it.reps_or_time || null,
      time: it.time || null,
      rest: it.rest || null,
    }));
    await supabase.from("routine_items").insert(rows);
    setSaving(false);
    setModalOpen(false);
    load();
  }

  async function deleteRoutine(id: string) {
    if (!confirm("¿Eliminar esta rutina? No borra los ejercicios individuales que la componen.")) return;
    const supabase = createClient();
    await supabase.from("routines").delete().eq("id", id);
    load();
  }

  const pickerOptions = exercises.filter((e) => !items.some((it) => it.exercise_id === e.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--color-text)]/55">
          Circuitos armados a partir de ejercicios individuales del catálogo (ej. &quot;Core Piso 1&quot; = 5 ejercicios en orden).
        </p>
        {canEdit && <Button onClick={openNew}>+ Nueva rutina</Button>}
      </div>

      {loading ? (
        <Spinner />
      ) : routines.length === 0 ? (
        <EmptyState text="Sin rutinas todavía." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routines.map((r) => (
            <div key={r.id} onClick={canEdit ? () => openEdit(r) : undefined} className={canEdit ? "cursor-pointer" : ""}>
              <Card className={canEdit ? "hover:border-[var(--color-accent-300)] transition-colors" : ""}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium">{r.name}</p>
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRoutine(r.id);
                      }}
                      className="text-[var(--color-text)]/30 hover:text-red-500 p-1"
                      aria-label={`Borrar rutina ${r.name}`}
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
                {r.category && <CategoryTag category={r.category} />}
                {r.description && <p className="text-sm text-[var(--color-text)]/55 mt-2">{r.description}</p>}
              </Card>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar rutina" : "Nueva rutina"}>
        <div className="space-y-4">
          <Field label="Nombre">
            <Input value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} />
          </Field>
          <Field label="Categoría">
            <Select value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })}>
              {EXERCISE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Descripción (opcional)">
            <Input value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
          </Field>

          <Field label="Agregar ejercicio">
            <div className="flex gap-2">
              <Select value={exercisePicker} onChange={(e) => setExercisePicker(e.target.value)} className="flex-1">
                <option value="">Elegir ejercicio...</option>
                {pickerOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    [{e.code}] {e.name}
                  </option>
                ))}
              </Select>
              <Button variant="secondary" onClick={() => addItem(exercisePicker)}>
                + Agregar
              </Button>
            </div>
          </Field>

          <div className="space-y-2">
            {items.map((it, i) => {
              const ex = exerciseById.get(it.exercise_id);
              return (
                <div key={i} className="border border-[var(--color-divider)] rounded-lg p-2">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-medium">
                      {i + 1}. {ex?.name ?? "Ejercicio"}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-[var(--color-text)]/40 hover:text-[var(--color-text)] disabled:opacity-30 p-1">
                        <ChevronUp size={14} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="text-[var(--color-text)]/40 hover:text-[var(--color-text)] disabled:opacity-30 p-1">
                        <ChevronDown size={14} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => removeItem(i)} className="text-[var(--color-text)]/30 hover:text-red-500 p-1" aria-label="Quitar">
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Input placeholder={ex?.typical_sets ?? "series"} value={it.sets} onChange={(e) => updateItem(i, { sets: e.target.value })} className="!min-h-[32px] !py-1 text-xs" />
                    <Input
                      placeholder={ex?.typical_reps ?? ex?.typical_time ?? "reps/tiempo"}
                      value={it.reps_or_time}
                      onChange={(e) => updateItem(i, { reps_or_time: e.target.value })}
                      className="!min-h-[32px] !py-1 text-xs"
                    />
                    <Input placeholder={ex?.typical_time ?? "tiempo"} value={it.time} onChange={(e) => updateItem(i, { time: e.target.value })} className="!min-h-[32px] !py-1 text-xs" />
                    <Input placeholder="descanso" value={it.rest} onChange={(e) => updateItem(i, { rest: e.target.value })} className="!min-h-[32px] !py-1 text-xs" />
                  </div>
                </div>
              );
            })}
            {items.length === 0 && <p className="text-xs text-[var(--color-text)]/40">Agrega al menos un ejercicio.</p>}
          </div>

          <Button onClick={save} disabled={saving || !meta.name.trim() || items.length === 0} className="w-full justify-center">
            {saving ? "Guardando..." : "Guardar rutina"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
