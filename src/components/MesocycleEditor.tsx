"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "./AthleteProvider";
import { Card, Field, Input, Select, Textarea, Button, Modal, CategoryTag } from "./ui";
import { DAYS_OF_WEEK, EXERCISE_CATEGORIES, type Exercise, type Routine, type RoutineItem } from "@/lib/types";
import { defaultWorkType } from "@/lib/planner/knowledge/exerciseMeta";
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
  /** Físico vs. técnico/táctico en el muro (Fase 1.3). Se autocompleta al elegir ejercicio, editable a mano. */
  work_type: "fisico" | "tecnico" | null;
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

/**
 * True si el atleta ya registro algo en este bloque. Esas columnas no viven en el
 * borrador del editor, asi que si el bloque se borra el dato no se puede recuperar.
 */
function hasExecutionData(b: Record<string, unknown>): boolean {
  if (b.completed) return true;
  if (Array.isArray(b.set_logs) && b.set_logs.length > 0) return true;
  if (b.pain_during !== null && b.pain_during !== undefined) return true;
  for (const k of ["actual_sets", "actual_reps_or_time", "actual_load", "actual_rpe", "comment"]) {
    const v = b[k];
    if (v !== null && v !== undefined && String(v).trim() !== "") return true;
  }
  return false;
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

// Fase 5a del plan de entrevistas: Rorro pidió mesociclos de 2-3 a 6 semanas,
// no siempre 4. Mismo rango que microcycleTemplateFor en el generador.
const MIN_WEEKS = 2;
const MAX_WEEKS = 6;

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
    work_type: null,
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
  const [confirmDataLoss, setConfirmDataLoss] = useState<string[] | null>(null);

  // IDs que ya existen en la base al cargar. Al guardar solo borramos los que
  // desaparecieron del borrador: el resto se actualiza con upsert, para no tocar
  // las columnas de ejecucion del atleta (actual_*, set_logs, pain_during, etc.).
  const loadedIdsRef = useRef<{ weeks: Set<string>; days: Set<string>; blocks: Set<string> }>({
    weeks: new Set(),
    days: new Set(),
    blocks: new Set(),
  });
  // Bloques con ejecucion ya registrada, por id -> nombre visible. Si el editor
  // los elimina, ese dato se pierde para siempre: hay que avisar antes.
  const executedBlocksRef = useRef<Map<string, string>>(new Map());

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
        const ids = { weeks: new Set<string>(), days: new Set<string>(), blocks: new Set<string>() };
        const executed = new Map<string, string>();

        // Antes: una query de days por semana + una de blocks por día, todas
        // secuenciales (await dentro de for anidados) -- ~34 round-trips
        // seriados para un mesociclo de 4 semanas x 7 días, cada uno sumando
        // latencia de red. Trae days y blocks de TODAS las semanas en 2
        // queries con .in() y agrupa en memoria en vez de por-semana/por-día.
        const weekIds = weekRows.map((w) => w.id);
        const { data: allDayRowsRaw } = await supabase
          .from("days")
          .select("*")
          .in("week_id", weekIds)
          .order("position");
        const allDayRows = allDayRowsRaw ?? [];
        type DayRow = (typeof allDayRows)[number];
        const dayIds = allDayRows.map((d) => d.id);

        const { data: allBlockRowsRaw } = dayIds.length
          ? await supabase.from("blocks").select("*").in("day_id", dayIds).order("position")
          : { data: null };
        const allBlockRows = allBlockRowsRaw ?? [];
        type BlockRow = (typeof allBlockRows)[number];

        const daysByWeek = new Map<string, DayRow[]>();
        for (const d of allDayRows) {
          if (!daysByWeek.has(d.week_id)) daysByWeek.set(d.week_id, []);
          daysByWeek.get(d.week_id)!.push(d);
        }
        const blocksByDay = new Map<string, BlockRow[]>();
        for (const b of allBlockRows) {
          if (!blocksByDay.has(b.day_id)) blocksByDay.set(b.day_id, []);
          blocksByDay.get(b.day_id)!.push(b);
        }

        for (const w of weekRows) {
          ids.weeks.add(w.id);
          const dayRows = daysByWeek.get(w.id);
          const days: DayDraft[] = [];
          for (const d of dayRows ?? []) {
            ids.days.add(d.id);
            const blockRows = blocksByDay.get(d.id);
            for (const b of blockRows ?? []) {
              ids.blocks.add(b.id);
              if (hasExecutionData(b)) {
                const label = b.exercise_name_freetext || "Ejercicio sin nombre";
                executed.set(b.id, `Semana ${w.week_number} · ${d.day_of_week} · ${label}`);
              }
            }
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
                work_type: b.work_type ?? null,
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
        loadedIdsRef.current = ids;
        executedBlocksRef.current = executed;
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
        work_type: ex ? defaultWorkType(ex) : null,
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

  // Fase 5a: cantidad de semanas variable (2-6, ver planner/knowledge/microcycles.ts
  // para el mismo rango del lado del generador). Solo se agrega/quita la
  // última semana -- quitar una del medio obligaría a renumerar todo lo que
  // viene después, incluida la semana de Descarga, que los planes de
  // referencia siempre esperan al final.
  function addWeek() {
    if (weeks.length >= MAX_WEEKS) return;
    setWeeks((ws) => [...ws, emptyWeek(ws.length + 1)]);
  }

  function removeLastWeek() {
    if (weeks.length <= MIN_WEEKS) return;
    setWeeks((ws) => ws.slice(0, -1));
    setActiveWeek((i) => Math.min(i, weeks.length - 2));
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
        work_type: defaultWorkType(match),
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

  /**
   * Guarda con upsert por id en vez de borrar y reinsertar. Las columnas de
   * ejecucion del atleta (actual_*, set_logs, completed, pain_during, comment,
   * manually_edited) no van en el payload, asi que el upsert las deja intactas.
   * Solo se borran las filas que el editor efectivamente elimino.
   */
  async function persist() {
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
    const { error: weekErr } = await supabase.from("weeks").upsert(weekRows, { onConflict: "id" });
    if (weekErr) {
      setSaving(false);
      alert("No se pudieron guardar las semanas: " + weekErr.message);
      return;
    }

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
    if (dayRows.length) {
      const { error } = await supabase.from("days").upsert(dayRows, { onConflict: "id" });
      if (error) {
        setSaving(false);
        alert("No se pudieron guardar los dias: " + error.message);
        return;
      }
    }

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
          work_type: b.work_type || null,
          position: pos,
        })),
      ),
    );
    if (blockRows.length) {
      const { error } = await supabase.from("blocks").upsert(blockRows, { onConflict: "id" });
      if (error) {
        setSaving(false);
        alert("No se pudieron guardar los bloques: " + error.message);
        return;
      }
    }

    // Borrar solo lo que el editor elimino, hijos primero.
    const keptWeeks = new Set(weeks.map((w) => w.id));
    const keptDays = new Set(dayRows.map((d) => d.id));
    const keptBlocks = new Set(blockRows.map((b) => b.id));
    const orphanBlocks = [...loadedIdsRef.current.blocks].filter((x) => !keptBlocks.has(x));
    const orphanDays = [...loadedIdsRef.current.days].filter((x) => !keptDays.has(x));
    const orphanWeeks = [...loadedIdsRef.current.weeks].filter((x) => !keptWeeks.has(x));
    if (orphanBlocks.length) await supabase.from("blocks").delete().in("id", orphanBlocks);
    if (orphanDays.length) await supabase.from("days").delete().in("id", orphanDays);
    if (orphanWeeks.length) await supabase.from("weeks").delete().in("id", orphanWeeks);

    // Lo guardado pasa a ser la nueva linea base por si se guarda otra vez sin recargar.
    loadedIdsRef.current = { weeks: keptWeeks, days: keptDays, blocks: keptBlocks };
    for (const bid of orphanBlocks) executedBlocksRef.current.delete(bid);

    setSaving(false);
    router.push(`/mesociclo/${id}`);
    router.refresh();
  }

  async function saveAll() {
    if (!athleteId) return;
    // Si el editor quito bloques que el atleta ya ejecuto, avisar antes de perder ese registro.
    const keptBlocks = new Set(weeks.flatMap((w) => w.days.flatMap((d) => d.blocks.map((b) => b.id))));
    const losing = [...executedBlocksRef.current.entries()]
      .filter(([bid]) => !keptBlocks.has(bid))
      .map(([, label]) => label);
    if (losing.length > 0) {
      setConfirmDataLoss(losing);
      return;
    }
    await persist();
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
          <h1 className="text-2xl font-semibold">{mesocycleId ? "Editar mesociclo" : "Nuevo mesociclo"}</h1>
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
          <button
            onClick={removeLastWeek}
            disabled={weeks.length <= MIN_WEEKS}
            title="Quitar la última semana"
            className="px-2 py-1.5 text-sm rounded-md border border-[var(--color-divider)] hover:bg-[var(--color-neutral-100)] disabled:opacity-30 disabled:pointer-events-none"
          >
            − Semana
          </button>
          <button
            onClick={addWeek}
            disabled={weeks.length >= MAX_WEEKS}
            title="Agregar una semana al final"
            className="px-2 py-1.5 text-sm rounded-md border border-[var(--color-divider)] hover:bg-[var(--color-neutral-100)] disabled:opacity-30 disabled:pointer-events-none"
          >
            + Semana
          </button>
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
                            <Field label="Tipo de trabajo">
                              <div className="inline-flex rounded-full border border-[var(--color-divider)] overflow-hidden">
                                {(["fisico", "tecnico"] as const).map((wt, i) => (
                                  <button
                                    key={wt}
                                    type="button"
                                    onClick={() => updateBlock(dayIdx, blockIdx, { work_type: wt })}
                                    className={`px-3 py-1.5 text-xs ${i > 0 ? "border-l border-[var(--color-divider)]" : ""} ${
                                      block.work_type === wt
                                        ? "bg-[var(--color-accent-500)] text-[var(--color-bg)]"
                                        : "text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07]"
                                    }`}
                                  >
                                    {wt === "fisico" ? "Físico" : "Técnico (muro)"}
                                  </button>
                                ))}
                              </div>
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

      <Modal
        open={confirmDataLoss !== null}
        onClose={() => setConfirmDataLoss(null)}
        title="Se va a perder registro del atleta"
      >
        <p className="text-sm text-[var(--color-text)]/70 mb-3">
          {confirmDataLoss?.length === 1
            ? "Quitaste un ejercicio que el atleta ya ejecutó. Si guardas, se pierde lo que registró (series, cargas, dolor):"
            : `Quitaste ${confirmDataLoss?.length} ejercicios que el atleta ya ejecutó. Si guardas, se pierde lo que registró (series, cargas, dolor):`}
        </p>
        <ul className="text-sm text-[var(--color-text)]/70 mb-4 max-h-48 overflow-y-auto list-disc pl-5 space-y-1">
          {confirmDataLoss?.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDataLoss(null)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              setConfirmDataLoss(null);
              await persist();
            }}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar igual"}
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
