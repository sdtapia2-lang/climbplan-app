"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "./AthleteProvider";
import { Card, Field, Input, Select, Textarea, Button } from "./ui";
import { DAYS_OF_WEEK, EXERCISE_CATEGORIES, type Exercise } from "@/lib/types";
import { Save, Copy, Files, Trash2, ChevronDown, ChevronUp } from "lucide-react";

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
};

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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(!!mesocycleId);
  const [saving, setSaving] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

  function toggleBlockExpanded(blockId: string) {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  }

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("exercises").select("*").order("name");
      setExercises((data as Exercise[]) ?? []);
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

  function onExerciseNameBlur(dayIdx: number, blockIdx: number, value: string) {
    const match = exercises.find((ex) => ex.name.toLowerCase() === value.trim().toLowerCase());
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

  const exerciseNames = useMemo(() => exercises.map((e) => e.name), [exercises]);

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
          position: pos,
        })),
      ),
    );
    if (blockRows.length) await supabase.from("blocks").insert(blockRows);

    setSaving(false);
    router.push(`/mesociclo/${id}`);
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
        <Button onClick={saveAll} disabled={saving}>
          <Save size={14} strokeWidth={2.75} aria-hidden="true" /> {saving ? "Guardando..." : "Guardar todo"}
        </Button>
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
              <option>Introduccion</option>
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
          <Field label="Distribucion">
            <Input value={currentWeek.distribution} onChange={(e) => updateWeek({ distribution: e.target.value })} />
          </Field>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {currentWeek.days.map((day, dayIdx) => (
          <Card key={day.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{day.day_of_week}</span>
              <div className="flex items-center gap-2">
                <button title="Duplicar a dia siguiente" onClick={() => duplicateDayToNext(dayIdx)} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)]">
                  <Files size={14} strokeWidth={2.75} aria-hidden="true" />
                </button>
                <button title="Vaciar dia" onClick={() => clearDay(dayIdx)} className="text-[var(--color-text)]/40 hover:text-red-500">
                  <Trash2 size={14} strokeWidth={2.75} aria-hidden="true" />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-[var(--color-text)]/70 mb-2">
              <input
                type="checkbox"
                checked={day.is_rest}
                onChange={(e) => updateDay(dayIdx, { is_rest: e.target.checked })}
              />
              Descanso
            </label>

            {day.is_rest ? (
              <span className="inline-block self-start px-2.5 py-0.5 rounded-full text-[11px] bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)]">
                Descanso
              </span>
            ) : (
              <>
                <Input
                  placeholder="Foco del dia..."
                  value={day.day_focus}
                  onChange={(e) => updateDay(dayIdx, { day_focus: e.target.value })}
                  className="mb-3 text-xs"
                />
                <div className="space-y-2 flex-1">
                  {day.blocks.map((block, blockIdx) => {
                    const isOpen = expandedBlocks.has(block.id);
                    const metaLine = [block.sets && `${block.sets}s`, block.reps_or_time, block.load]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <div key={block.id} className="border border-[var(--color-divider)] rounded-lg p-2">
                        <button
                          onClick={() => toggleBlockExpanded(block.id)}
                          className="flex items-center justify-between w-full text-left gap-1"
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-medium truncate">
                              {block.exercise_name_freetext || "Ejercicio sin nombre"}
                            </span>
                            {metaLine && <span className="block text-[11px] text-[var(--color-text)]/55 truncate">{metaLine}</span>}
                          </span>
                          {isOpen ? (
                            <ChevronUp size={14} strokeWidth={2.75} className="shrink-0 text-[var(--color-text)]/40" aria-hidden="true" />
                          ) : (
                            <ChevronDown size={14} strokeWidth={2.75} className="shrink-0 text-[var(--color-text)]/40" aria-hidden="true" />
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
                            <Field label="Ejercicio">
                              <Input
                                list="exercise-names"
                                value={block.exercise_name_freetext}
                                onChange={(e) => updateBlock(dayIdx, blockIdx, { exercise_name_freetext: e.target.value })}
                                onBlur={(e) => onExerciseNameBlur(dayIdx, blockIdx, e.target.value)}
                                placeholder="Buscar ejercicio o escribir libre..."
                              />
                            </Field>
                            <Field label="Categoria">
                              <Select value={block.category} onChange={(e) => updateBlock(dayIdx, blockIdx, { category: e.target.value })}>
                                {EXERCISE_CATEGORIES.map((c) => (
                                  <option key={c}>{c}</option>
                                ))}
                              </Select>
                            </Field>
                            <Field label="RPE objetivo">
                              <Input value={block.rpe_target} onChange={(e) => updateBlock(dayIdx, blockIdx, { rpe_target: e.target.value })} />
                            </Field>
                            <Field label="Series">
                              <Input value={block.sets} onChange={(e) => updateBlock(dayIdx, blockIdx, { sets: e.target.value })} />
                            </Field>
                            <Field label="Reps/Tiempo">
                              <Input value={block.reps_or_time} onChange={(e) => updateBlock(dayIdx, blockIdx, { reps_or_time: e.target.value })} />
                            </Field>
                            <Field label="Tiempo">
                              <Input value={block.time} onChange={(e) => updateBlock(dayIdx, blockIdx, { time: e.target.value })} />
                            </Field>
                            <Field label="Carga (kg/%BW)">
                              <Input value={block.load} onChange={(e) => updateBlock(dayIdx, blockIdx, { load: e.target.value })} />
                            </Field>
                            <Field label="Descanso">
                              <Input value={block.rest} onChange={(e) => updateBlock(dayIdx, blockIdx, { rest: e.target.value })} />
                            </Field>
                            <Field label="Notas kinesio">
                              <Textarea rows={2} value={block.kinesio_notes} onChange={(e) => updateBlock(dayIdx, blockIdx, { kinesio_notes: e.target.value })} />
                            </Field>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Button variant="secondary" onClick={() => addBlock(dayIdx)} className="w-full justify-center mt-2">
                  + Bloque
                </Button>
              </>
            )}
          </Card>
        ))}
      </div>

      <datalist id="exercise-names">
        {exerciseNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </div>
  );
}
