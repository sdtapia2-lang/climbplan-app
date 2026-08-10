"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "./AthleteProvider";
import { Card, Field, Input, Select, Textarea, Button, Modal, CategoryTag } from "./ui";
import { DAYS_OF_WEEK, EXERCISE_CATEGORIES, type Exercise, type Routine, type RoutineItem } from "@/lib/types";
import { Save, Copy, Files, Trash2, ChevronDown, ChevronUp, CopyPlus, GripVertical, Layers } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type BlockDraft = {
  id: string;
  exercise_id: string | null;
  exercise_name_freetext: string;
  category: string;
  rpe_target: string;
  sets: string;
  reps_or_time: string;
  time: string;
  load: string;
  rest: string;
  kinesio_notes: string;
  /** Nombre de la Rutina de origen (ej. "General Warm Up"); null si es un ejercicio suelto. Blocks consecutivos con el mismo valor se agrupan visualmente. */
  routine_name: string | null;
};

/** Agrupa bloques consecutivos que comparten el mismo routine_name para mostrarlos como una sola unidad colapsable. */
type RenderItem = { kind: "single"; block: BlockDraft; index: number } | { kind: "group"; routineName: string; blocks: BlockDraft[]; indices: number[] };
function groupBlocksForRender(blocks: BlockDraft[]): RenderItem[] {
  const items: RenderItem[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (!b.routine_name) {
      items.push({ kind: "single", block: b, index: i });
      i++;
      continue;
    }
    const groupBlocks: BlockDraft[] = [b];
    const indices = [i];
    let j = i + 1;
    while (j < blocks.length && blocks[j].routine_name === b.routine_name) {
      groupBlocks.push(blocks[j]);
      indices.push(j);
      j++;
    }
    items.push({ kind: "group", routineName: b.routine_name, blocks: groupBlocks, indices });
    i = j;
  }
  return items;
}

type DayDraft = {
  id: string;
  day_of_week: string;
  day_focus: string;
  is_rest: boolean;
  blocks: BlockDraft[];
};

type WeekDraft = {
  id: string;
  week_number: number;
  load_type: string;
  focus: string;
  distribution: string;
  days: DayDraft[];
};

type MesocycleDraft = {
  name: string;
  start_date: string;
  end_date: string;
  phase: string;
  status: string;
  ref_weight_kg: string;
  max_rpe_week: string;
};

function uid() {
  return crypto.randomUUID();
}

function emptyDay(dayName: string): DayDraft {
  return { id: uid(), day_of_week: dayName, day_focus: "", is_rest: false, blocks: [] };
}

function emptyWeek(weekNumber: number): WeekDraft {
  return {
    id: uid(),
    week_number: weekNumber,
    load_type: "Carga",
    focus: "",
    distribution: "",
    days: DAYS_OF_WEEK.map((d) => emptyDay(d)),
  };
}

function emptyBlock(): BlockDraft {
  return {
    id: uid(),
    exercise_id: null,
    exercise_name_freetext: "",
    category: "Strength and Power",
    rpe_target: "",
    sets: "",
    reps_or_time: "",
    time: "",
    load: "",
    rest: "",
    kinesio_notes: "",
    routine_name: null,
  };
}

export function MesocycleEditor({ mesocycleId }: { mesocycleId?: string }) {
  const { athleteId } = useAthlete();
  const router = useRouter();
  const [meso, setMeso] = useState<MesocycleDraft>({
    name: "Mesociclo 1",
    start_date: "",
    end_date: "",
    phase: "Desarrollo",
    status: "Planificado",
    ref_weight_kg: "",
    max_rpe_week: "",
  });
  const [weeks, setWeeks] = useState<WeekDraft[]>([emptyWeek(1), emptyWeek(2), emptyWeek(3), emptyWeek(4)]);
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routinePicker, setRoutinePicker] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(!!mesocycleId);
  const [saving, setSaving] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkRoutineId, setBulkRoutineId] = useState("");
  const [bulkDayIdxs, setBulkDayIdxs] = useState<Set<number>>(new Set());

  function toggleBlockExpanded(blockId: string) {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  }

  function toggleGroupExpanded(groupKey: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("exercises").select("*").order("name");
      setExercises((data as Exercise[]) ?? []);
      const { data: routineRows } = await supabase.from("routines").select("*").order("name");
      setRoutines((routineRows as Routine[]) ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!mesocycleId) return;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: mesoRow } = await supabase.from("mesocycles").select("*").eq("id", mesocycleId).single();
      if (mesoRow) {
        setMeso({
          name: mesoRow.name ?? "",
          start_date: mesoRow.start_date ?? "",
          end_date: mesoRow.end_date ?? "",
          phase: mesoRow.phase ?? "",
          status: mesoRow.status ?? "Planificado",
          ref_weight_kg: mesoRow.ref_weight_kg?.toString() ?? "",
          max_rpe_week: mesoRow.max_rpe_week?.toString() ?? "",
        });
      }
      const { data: weekRows } = await supabase
        .from("weeks")
        .select("*")
        .eq("mesocycle_id", mesocycleId)
        .order("week_number");
      if (weekRows && weekRows.length > 0) {
        const loadedWeeks: WeekDraft[] = [];
        for (const w of weekRows) {
          const { data: dayRows } = await supabase.from("days").select("*").eq("week_id", w.id).order("position");
          const days: DayDraft[] = [];
          for (const d of dayRows ?? []) {
            const { data: blockRows } = await supabase.from("blocks").select("*").eq("day_id", d.id).order("position");
            days.push({
              id: d.id,
              day_of_week: d.day_of_week,
              day_focus: d.day_focus ?? "",
              is_rest: d.is_rest,
              blocks: (blockRows ?? []).map((b) => ({
                id: b.id,
                exercise_id: b.exercise_id,
                exercise_name_freetext: b.exercise_name_freetext ?? "",
                category: b.category ?? "Strength and Power",
                rpe_target: b.rpe_target ?? "",
                sets: b.sets ?? "",
                reps_or_time: b.reps_or_time ?? "",
                time: b.time ?? "",
                load: b.load ?? "",
                rest: b.rest ?? "",
                kinesio_notes: b.kinesio_notes ?? "",
                routine_name: b.routine_name ?? null,
              })),
            });
          }
          loadedWeeks.push({
            id: w.id,
            week_number: w.week_number,
            load_type: w.load_type ?? "",
            focus: w.focus ?? "",
            distribution: w.distribution ?? "",
            days,
          });
        }
        setWeeks(loadedWeeks);
      }
      setLoading(false);
    })();
  }, [mesocycleId]);

  const currentWeek = weeks[activeWeek];

  function updateWeek(patch: Partial<WeekDraft>) {
    setWeeks((ws) => ws.map((w, i) => (i === activeWeek ? { ...w, ...patch } : w)));
  }

  function updateDay(dayIdx: number, patch: Partial<DayDraft>) {
    setWeeks((ws) =>
      ws.map((w, i) =>
        i === activeWeek ? { ...w, days: w.days.map((d, j) => (j === dayIdx ? { ...d, ...patch } : d)) } : w,
      ),
    );
  }

  function addBlock(dayIdx: number) {
    updateDay(dayIdx, { blocks: [...currentWeek.days[dayIdx].blocks, emptyBlock()] });
  }

  async function blocksFromRoutine(routineId: string): Promise<BlockDraft[]> {
    const supabase = createClient();
    const { data } = await supabase.from("routine_items").select("*").eq("routine_id", routineId).order("position");
    const items = (data as RoutineItem[]) ?? [];
    const routineName = routines.find((r) => r.id === routineId)?.name ?? null;
    return items.map((it) => {
      const ex = exercises.find((e) => e.id === it.exercise_id);
      return {
        id: uid(),
        exercise_id: it.exercise_id,
        exercise_name_freetext: ex?.name ?? "",
        category: ex?.category ?? "Conditioning",
        rpe_target: "",
        sets: it.sets ?? ex?.typical_sets ?? "",
        reps_or_time: it.reps_or_time ?? ex?.typical_reps ?? ex?.typical_time ?? "",
        time: it.time ?? ex?.typical_time ?? "",
        load: "",
        rest: it.rest ?? "",
        kinesio_notes: "",
        routine_name: routineName,
      };
    });
  }

  async function insertRoutine(dayIdx: number) {
    const routineId = routinePicker[dayIdx];
    if (!routineId) return;
    const newBlocks = await blocksFromRoutine(routineId);
    updateDay(dayIdx, { blocks: [...currentWeek.days[dayIdx].blocks, ...newBlocks] });
    setRoutinePicker((p) => ({ ...p, [dayIdx]: "" }));
  }

  function toggleBulkDay(idx: number) {
    setBulkDayIdxs((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  async function applyRoutineToBulkDays() {
    if (!bulkRoutineId || bulkDayIdxs.size === 0) return;
    const newBlocksTemplate = await blocksFromRoutine(bulkRoutineId);
    setWeeks((ws) =>
      ws.map((w, i) => {
        if (i !== activeWeek) return w;
        return {
          ...w,
          days: w.days.map((d, j) =>
            bulkDayIdxs.has(j) && !d.is_rest
              ? { ...d, blocks: [...d.blocks, ...newBlocksTemplate.map((b) => ({ ...b, id: uid() }))] }
              : d,
          ),
        };
      }),
    );
    setBulkModalOpen(false);
    setBulkRoutineId("");
    setBulkDayIdxs(new Set());
  }

  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function reorderBlocks(dayIdx: number, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const blocks = currentWeek.days[dayIdx].blocks;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    updateDay(dayIdx, { blocks: arrayMove(blocks, oldIndex, newIndex) });
  }

  function removeBlock(dayIdx: number, blockIdx: number) {
    updateDay(dayIdx, { blocks: currentWeek.days[dayIdx].blocks.filter((_, i) => i !== blockIdx) });
  }

  function updateBlock(dayIdx: number, blockIdx: number, patch: Partial<BlockDraft>) {
    const blocks = currentWeek.days[dayIdx].blocks.map((b, i) => (i === blockIdx ? { ...b, ...patch } : b));
    updateDay(dayIdx, { blocks });
  }

  function duplicateDayToNext(dayIdx: number) {
    const nextIdx = (dayIdx + 1) % currentWeek.days.length;
    const source = currentWeek.days[dayIdx];
    updateDay(nextIdx, {
      day_focus: source.day_focus,
      is_rest: source.is_rest,
      blocks: source.blocks.map((b) => ({ ...b, id: uid() })),
    });
  }

  function clearDay(dayIdx: number) {
    updateDay(dayIdx, { day_focus: "", is_rest: false, blocks: [] });
  }

  function copyWeekTo(targetIdx: number) {
    setWeeks((ws) =>
      ws.map((w, i) =>
        i === targetIdx
          ? {
              ...w,
              load_type: currentWeek.load_type,
              focus: currentWeek.focus,
              distribution: currentWeek.distribution,
              days: currentWeek.days.map((d) => ({
                ...d,
                id: uid(),
                blocks: d.blocks.map((b) => ({ ...b, id: uid() })),
              })),
            }
          : w,
      ),
    );
  }

  function onExerciseNameBlur(dayIdx: number, blockIdx: number, value: string, category: string) {
    const needle = value.trim().toLowerCase();
    // Prioriza un match dentro de la categoría ya elegida (el picker filtra
    // las sugerencias por categoría); si no hay, cae a cualquier categoría
    // por si el usuario tipeó un nombre que existe en otra.
    const match =
      exercises.find((ex) => ex.category === category && ex.name.toLowerCase() === needle) ??
      exercises.find((ex) => ex.name.toLowerCase() === needle);
    if (match) {
      updateBlock(dayIdx, blockIdx, {
        exercise_id: match.id,
        exercise_name_freetext: match.name,
        category: match.category,
      });
    } else {
      updateBlock(dayIdx, blockIdx, { exercise_id: null });
    }
  }

  const exerciseNamesByCategory = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const cat of EXERCISE_CATEGORIES) map.set(cat, []);
    for (const e of exercises) map.get(e.category)?.push(e.name);
    return map;
  }, [exercises]);

  async function saveAll() {
    if (!athleteId) return;
    setSaving(true);
    const supabase = createClient();

    let id = mesocycleId;
    const mesoPayload = {
      athlete_id: athleteId,
      name: meso.name,
      start_date: meso.start_date || null,
      end_date: meso.end_date || null,
      phase: meso.phase || null,
      status: meso.status,
      ref_weight_kg: meso.ref_weight_kg ? Number(meso.ref_weight_kg) : null,
      max_rpe_week: meso.max_rpe_week ? Number(meso.max_rpe_week) : null,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      await supabase.from("mesocycles").update(mesoPayload).eq("id", id);
      await supabase.from("weeks").delete().eq("mesocycle_id", id);
    } else {
      const { data, error } = await supabase.from("mesocycles").insert(mesoPayload).select("id").single();
      if (error || !data) {
        setSaving(false);
        alert("No se pudo crear el mesociclo: " + error?.message);
        return;
      }
      id = data.id;
    }

    const weekRows = weeks.map((w) => ({
      id: w.id,
      mesocycle_id: id,
      week_number: w.week_number,
      load_type: w.load_type || null,
      focus: w.focus || null,
      distribution: w.distribution || null,
    }));
    await supabase.from("weeks").insert(weekRows);

    const dayRows = weeks.flatMap((w) =>
      w.days.map((d, pos) => ({
        id: d.id,
        week_id: w.id,
        day_of_week: d.day_of_week,
        day_focus: d.day_focus || null,
        is_rest: d.is_rest,
        position: pos,
      })),
    );
    if (dayRows.length) await supabase.from("days").insert(dayRows);

    const blockRows = weeks.flatMap((w) =>
      w.days.flatMap((d) =>
        d.blocks.map((b, pos) => ({
          id: b.id,
          day_id: d.id,
          exercise_id: b.exercise_id,
          exercise_name_freetext: b.exercise_name_freetext || null,
          category: b.category || null,
          rpe_target: b.rpe_target || null,
          sets: b.sets || null,
          reps_or_time: b.reps_or_time || null,
          time: b.time || null,
          load: b.load || null,
          rest: b.rest || null,
          kinesio_notes: b.kinesio_notes || null,
          routine_name: b.routine_name || null,
          position: pos,
        })),
      ),
    );
    if (blockRows.length) await supabase.from("blocks").insert(blockRows);

    setSaving(false);
    router.push(`/mesociclo/${id}`);
    router.refresh();
  }

  async function deleteMesocycle() {
    if (!mesocycleId) return;
    setDeleteError(null);
    setSaving(true);
    const supabase = createClient();
    const { error, count } = await supabase
      .from("mesocycles")
      .delete({ count: "exact" })
      .eq("id", mesocycleId);
    setSaving(false);
    if (error) {
      setDeleteError("No se pudo eliminar el mesociclo: " + error.message);
      return;
    }
    // RLS puede filtrar el delete sin devolver error (0 filas afectadas) si el
    // usuario no tiene permiso real sobre este atleta: hay que detectarlo acá,
    // si no el usuario cree que se borró y sigue apareciendo en la lista.
    if (!count) {
      setDeleteError("No tienes permiso para eliminar este mesociclo.");
      return;
    }
    setConfirmDelete(false);
    router.push("/mesociclo");
    router.refresh();
  }

  if (loading) return <p className="text-[var(--color-text)]/40">Cargando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)]">
            &larr;
          </button>
          <h1 className="text-xl font-semibold">{mesocycleId ? "Editar mesociclo" : "Nuevo mesociclo"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {mesocycleId && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)} disabled={saving}>
              <Trash2 size={14} strokeWidth={2.75} aria-hidden="true" /> Eliminar
            </Button>
          )}
          <Button onClick={saveAll} disabled={saving}>
            <Save size={14} strokeWidth={2.75} aria-hidden="true" /> {saving ? "Guardando..." : "Guardar todo"}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Field label="Nombre">
            <Input value={meso.name} onChange={(e) => setMeso({ ...meso, name: e.target.value })} />
          </Field>
          <Field label="Inicio">
            <Input type="date" value={meso.start_date} onChange={(e) => setMeso({ ...meso, start_date: e.target.value })} />
          </Field>
          <Field label="Fin">
            <Input type="date" value={meso.end_date} onChange={(e) => setMeso({ ...meso, end_date: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Field label="Fase">
            <Select value={meso.phase} onChange={(e) => setMeso({ ...meso, phase: e.target.value })}>
              <option>Introducción</option>
              <option>Desarrollo</option>
              <option>Pico</option>
              <option>Descarga</option>
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={meso.status} onChange={(e) => setMeso({ ...meso, status: e.target.value })}>
              <option>Planificado</option>
              <option>Activo</option>
              <option>Completado</option>
            </Select>
          </Field>
          <Field label="Peso ref. (kg)">
            <Input type="number" value={meso.ref_weight_kg} onChange={(e) => setMeso({ ...meso, ref_weight_kg: e.target.value })} />
          </Field>
          <Field label="RPE max/semana">
            <Input type="number" value={meso.max_rpe_week} onChange={(e) => setMeso({ ...meso, max_rpe_week: e.target.value })} />
          </Field>
        </div>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {weeks.map((w, i) => (
            <button
              key={w.id}
              onClick={() => setActiveWeek(i)}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                i === activeWeek ? "bg-[var(--color-accent-500)] text-white border-[var(--color-accent-500)]" : "border-[var(--color-divider)] hover:bg-[var(--color-neutral-100)]"
              }`}
            >
              S{w.week_number}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {routines.length > 0 && (
            <Button variant="secondary" onClick={() => setBulkModalOpen(true)} title="Aplicar una rutina a varios días de esta semana">
              <CopyPlus size={13} strokeWidth={2.75} aria-hidden="true" /> Rutina a varios días
            </Button>
          )}
          {weeks.map((w, i) =>
            i === activeWeek ? null : (
              <Button key={w.id} variant="secondary" onClick={() => copyWeekTo(i)} title={`Copiar S${currentWeek.week_number} a S${w.week_number}`}>
                <Copy size={13} strokeWidth={2.75} aria-hidden="true" /> &rarr;S{w.week_number}
              </Button>
            ),
          )}
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Tipo carga">
            <Select value={currentWeek.load_type} onChange={(e) => updateWeek({ load_type: e.target.value })}>
              <option>Carga</option>
              <option>Ajuste</option>
              <option>Choque</option>
              <option>Descarga</option>
            </Select>
          </Field>
          <Field label="Foco">
            <Input value={currentWeek.focus} onChange={(e) => updateWeek({ focus: e.target.value })} />
          </Field>
          <Field label="Distribución">
            <Input value={currentWeek.distribution} onChange={(e) => updateWeek({ distribution: e.target.value })} />
          </Field>
        </div>
      </Card>

      {/* Mapa de la semana: un vistazo rápido de los 7 días, click para editar uno. */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4">
        {currentWeek.days.map((day, i) => (
          <button
            key={day.id}
            onClick={() => setActiveDay(i)}
            className={`shrink-0 flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-xl border transition-colors ${
              i === activeDay
                ? "bg-[var(--color-accent-500)] text-[var(--color-bg)] border-[var(--color-accent-500)]"
                : "border-[var(--color-divider)] hover:bg-[var(--color-text)]/[0.05]"
            }`}
          >
            <span className="text-xs font-medium">{day.day_of_week.slice(0, 3)}</span>
            <span className={`text-[10px] ${i === activeDay ? "text-[var(--color-bg)]/80" : "text-[var(--color-text)]/50"}`}>
              {day.is_rest ? "Descanso" : `${day.blocks.length} bloque${day.blocks.length === 1 ? "" : "s"}`}
            </span>
          </button>
        ))}
      </div>

      {(() => {
        const day = currentWeek.days[activeDay];
        const dayIdx = activeDay;
        return (
          <Card key={day.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-lg">{day.day_of_week}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-[var(--color-text)]/70">
                  <input
                    type="checkbox"
                    checked={day.is_rest}
                    onChange={(e) => updateDay(dayIdx, { is_rest: e.target.checked })}
                  />
                  Descanso
                </label>
                <button title="Duplicar a día siguiente" onClick={() => duplicateDayToNext(dayIdx)} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)]">
                  <Files size={16} strokeWidth={2.75} aria-hidden="true" />
                </button>
                <button title="Vaciar día" onClick={() => clearDay(dayIdx)} className="text-[var(--color-text)]/40 hover:text-red-500">
                  <Trash2 size={16} strokeWidth={2.75} aria-hidden="true" />
                </button>
              </div>
            </div>

            {day.is_rest ? (
              <span className="inline-block self-start px-2.5 py-0.5 rounded-full text-[11px] bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)]">
                Descanso
              </span>
            ) : (
              <>
                <Input
                  placeholder="Foco del día..."
                  value={day.day_focus}
                  onChange={(e) => updateDay(dayIdx, { day_focus: e.target.value })}
                  className="mb-4 max-w-md"
                />
                {(() => {
                  const renderBlockCard = (block: BlockDraft, blockIdx: number) => {
                    const isOpen = expandedBlocks.has(block.id);
                    const metaLine = [block.sets && `${block.sets}s`, block.reps_or_time, block.load]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <SortableBlock key={block.id} id={block.id} className={isOpen ? "md:col-span-2" : ""}>
                        <button
                          onClick={() => toggleBlockExpanded(block.id)}
                          className="flex items-center justify-between w-full text-left gap-1"
                        >
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-sm font-medium">
                              <CategoryTag category={block.category} />
                              <span className="truncate">{block.exercise_name_freetext || "Ejercicio sin nombre"}</span>
                            </span>
                            {metaLine && <span className="block text-xs text-[var(--color-text)]/55 truncate">{metaLine}</span>}
                          </span>
                          {isOpen ? (
                            <ChevronUp size={16} strokeWidth={2.75} className="shrink-0 text-[var(--color-text)]/40" aria-hidden="true" />
                          ) : (
                            <ChevronDown size={16} strokeWidth={2.75} className="shrink-0 text-[var(--color-text)]/40" aria-hidden="true" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="mt-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-[var(--color-text)]/40 tracking-wide">BLOQUE</span>
                              <button onClick={() => removeBlock(dayIdx, blockIdx)} className="text-red-400 hover:text-red-600 text-sm">
                                <Trash2 size={14} strokeWidth={2.75} aria-hidden="true" />
                              </button>
                            </div>
                            <Field label="Categoría">
                              <Select
                                value={block.category}
                                onChange={(e) => {
                                  const nextCategory = e.target.value;
                                  const ex = exercises.find((x) => x.id === block.exercise_id);
                                  // Si el ejercicio elegido no pertenece a la nueva categoría, se limpia
                                  // para forzar a elegir uno de la lista ya filtrada.
                                  const clearExercise = ex && ex.category !== nextCategory;
                                  updateBlock(dayIdx, blockIdx, {
                                    category: nextCategory,
                                    ...(clearExercise ? { exercise_id: null, exercise_name_freetext: "" } : {}),
                                  });
                                }}
                              >
                                {EXERCISE_CATEGORIES.map((c) => (
                                  <option key={c}>{c}</option>
                                ))}
                              </Select>
                            </Field>
                            <Field label="Ejercicio">
                              <Input
                                list={`exercise-names-${block.category}`}
                                value={block.exercise_name_freetext}
                                onChange={(e) => updateBlock(dayIdx, blockIdx, { exercise_name_freetext: e.target.value })}
                                onBlur={(e) => onExerciseNameBlur(dayIdx, blockIdx, e.target.value, block.category)}
                                placeholder="Buscar ejercicio de esta categoría o escribir libre..."
                              />
                            </Field>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <Field label="Series">
                                <Input value={block.sets} onChange={(e) => updateBlock(dayIdx, blockIdx, { sets: e.target.value })} />
                              </Field>
                              <Field label="Reps/Tiempo">
                                <Input value={block.reps_or_time} onChange={(e) => updateBlock(dayIdx, blockIdx, { reps_or_time: e.target.value })} />
                              </Field>
                              <Field label="Tiempo">
                                <Input value={block.time} onChange={(e) => updateBlock(dayIdx, blockIdx, { time: e.target.value })} />
                              </Field>
                              <Field label="Carga (kg)">
                                <Input value={block.load} onChange={(e) => updateBlock(dayIdx, blockIdx, { load: e.target.value })} />
                              </Field>
                              <Field label="RPE objetivo">
                                <Input value={block.rpe_target} onChange={(e) => updateBlock(dayIdx, blockIdx, { rpe_target: e.target.value })} />
                              </Field>
                              <Field label="Descanso">
                                <Input value={block.rest} onChange={(e) => updateBlock(dayIdx, blockIdx, { rest: e.target.value })} />
                              </Field>
                            </div>
                            <Field label="Notas kinesio">
                              <Textarea rows={2} value={block.kinesio_notes} onChange={(e) => updateBlock(dayIdx, blockIdx, { kinesio_notes: e.target.value })} />
                            </Field>
                          </div>
                        )}
                      </SortableBlock>
                    );
                  };

                  const renderItems = groupBlocksForRender(day.blocks);

                  return (
                    <DndContext
                      sensors={dndSensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => reorderBlocks(dayIdx, event)}
                    >
                      <SortableContext items={day.blocks.map((b) => b.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {renderItems.map((item) => {
                            if (item.kind === "single") return renderBlockCard(item.block, item.index);

                            const groupKey = `${day.id}::${item.routineName}`;
                            const isGroupOpen = expandedGroups.has(groupKey);
                            return (
                              <div
                                key={groupKey}
                                className={`border border-dashed border-[var(--color-accent-300)] rounded-lg p-3 ${isGroupOpen ? "md:col-span-2" : ""}`}
                              >
                                <button
                                  onClick={() => toggleGroupExpanded(groupKey)}
                                  className="flex items-center justify-between w-full text-left gap-1"
                                >
                                  <span className="flex items-center gap-1.5 text-sm font-medium min-w-0">
                                    <Layers size={14} strokeWidth={2.75} className="shrink-0 text-[var(--color-accent-700)]" aria-hidden="true" />
                                    <span className="truncate">
                                      Rutina: {item.routineName} ({item.blocks.length} ejercicios)
                                    </span>
                                  </span>
                                  {isGroupOpen ? (
                                    <ChevronUp size={16} strokeWidth={2.75} className="shrink-0 text-[var(--color-text)]/40" aria-hidden="true" />
                                  ) : (
                                    <ChevronDown size={16} strokeWidth={2.75} className="shrink-0 text-[var(--color-text)]/40" aria-hidden="true" />
                                  )}
                                </button>
                                {isGroupOpen && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    {item.blocks.map((block, i) => renderBlockCard(block, item.indices[i]))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </SortableContext>
                    </DndContext>
                  );
                })()}
                <Button variant="secondary" onClick={() => addBlock(dayIdx)} className="w-full justify-center mt-3">
                  + Bloque
                </Button>
                {routines.length > 0 && (
                  <div className="flex gap-2 mt-2 max-w-xl">
                    <Select
                      value={routinePicker[dayIdx] ?? ""}
                      onChange={(e) => setRoutinePicker((p) => ({ ...p, [dayIdx]: e.target.value }))}
                      className="flex-1 text-xs"
                    >
                      <option value="">Insertar rutina...</option>
                      {routines.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </Select>
                    <Button variant="secondary" onClick={() => insertRoutine(dayIdx)} disabled={!routinePicker[dayIdx]}>
                      + Rutina
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        );
      })()}

      {EXERCISE_CATEGORIES.map((cat) => (
        <datalist key={cat} id={`exercise-names-${cat}`}>
          {(exerciseNamesByCategory.get(cat) ?? []).map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      ))}

      <Modal open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Aplicar rutina a varios días">
        <div className="space-y-5">
          <Field label="Rutina">
            <Select value={bulkRoutineId} onChange={(e) => setBulkRoutineId(e.target.value)}>
              <option value="">Elegir rutina...</option>
              {routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
          <div>
            <p className="text-sm font-medium mb-2">Días (semana {currentWeek.week_number})</p>
            <div className="grid grid-cols-2 gap-2">
              {currentWeek.days.map((d, i) => (
                <label
                  key={d.id}
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer ${
                    d.is_rest ? "opacity-40 cursor-not-allowed" : "border-[var(--color-divider)] hover:bg-[var(--color-neutral-100)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={d.is_rest}
                    checked={bulkDayIdxs.has(i)}
                    onChange={() => toggleBulkDay(i)}
                  />
                  {d.day_of_week}
                </label>
              ))}
            </div>
          </div>
          <Button
            onClick={applyRoutineToBulkDays}
            disabled={!bulkRoutineId || bulkDayIdxs.size === 0}
            className="w-full justify-center"
          >
            Aplicar a {bulkDayIdxs.size || 0} día{bulkDayIdxs.size === 1 ? "" : "s"}
          </Button>
        </div>
      </Modal>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Eliminar mesociclo">
        <p className="text-sm text-[var(--color-text)]/70 mb-4">
          ¿Eliminar el mesociclo &quot;{meso.name || "sin nombre"}&quot;? Esta acción no se puede deshacer.
        </p>
        {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={deleteMesocycle} disabled={saving}>
            {saving ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function SortableBlock({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border border-[var(--color-divider)] rounded-lg p-3 pl-7 ${className ?? ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        title="Arrastrar para reordenar"
        className="absolute left-1.5 top-3 text-[var(--color-text)]/25 hover:text-[var(--color-text)]/60 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={14} strokeWidth={2.5} aria-hidden="true" />
      </button>
      {children}
    </div>
  );
}
