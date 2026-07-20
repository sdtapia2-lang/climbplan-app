"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "./ProfileProvider";
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

type TemplateMetaDraft = {
  name: string;
  description: string;
  phase: string;
  max_rpe_week: string;
  is_published: boolean;
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

export function TemplateEditor({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const { profile } = useProfile();
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [meta, setMeta] = useState<TemplateMetaDraft>({
    name: "Plan 1",
    description: "",
    phase: "Desarrollo",
    max_rpe_week: "",
    is_published: true,
  });
  const [weeks, setWeeks] = useState<WeekDraft[]>([emptyWeek(1), emptyWeek(2), emptyWeek(3), emptyWeek(4)]);
  const [activeWeek, setActiveWeek] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(!!templateId);
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
    if (!templateId) return;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: tRow } = await supabase.from("template_mesocycles").select("*").eq("id", templateId).single();
      if (tRow) {
        setMeta({
          name: tRow.name ?? "",
          description: tRow.description ?? "",
          phase: tRow.phase ?? "",
          max_rpe_week: tRow.max_rpe_week?.toString() ?? "",
          is_published: tRow.is_published,
        });
        setCreatedBy(tRow.created_by);
      }
      const { data: weekRows } = await supabase
        .from("template_weeks")
        .select("*")
        .eq("template_mesocycle_id", templateId)
        .order("week_number");
      if (weekRows && weekRows.length > 0) {
        const loaded: WeekDraft[] = [];
        for (const w of weekRows) {
          const { data: dayRows } = await supabase
            .from("template_days")
            .select("*")
            .eq("template_week_id", w.id)
            .order("position");
          const days: DayDraft[] = [];
          for (const d of dayRows ?? []) {
            const { data: blockRows } = await supabase
              .from("template_blocks")
              .select("*")
              .eq("template_day_id", d.id)
              .order("position");
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
          loaded.push({
            id: w.id,
            week_number: w.week_number,
            load_type: w.load_type ?? "",
            focus: w.focus ?? "",
            distribution: w.distribution ?? "",
            days,
          });
        }
        setWeeks(loaded);
      }
      setLoading(false);
    })();
  }, [templateId]);

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
      updateBlock(dayIdx, blockIdx, { exercise_id: match.id, exercise_name_freetext: match.name, category: match.category });
    } else {
      updateBlock(dayIdx, blockIdx, { exercise_id: null });
    }
  }

  const exerciseNames = useMemo(() => exercises.map((e) => e.name), [exercises]);

  async function saveAll() {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let id = templateId;
    const payload = {
      name: meta.name,
      description: meta.description || null,
      phase: meta.phase || null,
      max_rpe_week: meta.max_rpe_week ? Number(meta.max_rpe_week) : null,
      is_published: meta.is_published,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      await supabase.from("template_mesocycles").update(payload).eq("id", id);
      await supabase.from("template_weeks").delete().eq("template_mesocycle_id", id);
    } else {
      const { data, error } = await supabase
        .from("template_mesocycles")
        .insert({ ...payload, created_by: user?.id })
        .select("id")
        .single();
      if (error || !data) {
        setSaving(false);
        alert("No se pudo crear la plantilla: " + error?.message);
        return;
      }
      id = data.id;
    }

    const weekRows = weeks.map((w) => ({
      id: w.id,
      template_mesocycle_id: id,
      week_number: w.week_number,
      load_type: w.load_type || null,
      focus: w.focus || null,
      distribution: w.distribution || null,
    }));
    await supabase.from("template_weeks").insert(weekRows);

    const dayRows = weeks.flatMap((w) =>
      w.days.map((d, pos) => ({
        id: d.id,
        template_week_id: w.id,
        day_of_week: d.day_of_week,
        day_focus: d.day_focus || null,
        is_rest: d.is_rest,
        position: pos,
      })),
    );
    if (dayRows.length) await supabase.from("template_days").insert(dayRows);

    const blockRows = weeks.flatMap((w) =>
      w.days.flatMap((d) =>
        d.blocks.map((b, pos) => ({
          id: b.id,
          template_day_id: d.id,
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
    if (blockRows.length) await supabase.from("template_blocks").insert(blockRows);

    setSaving(false);
    router.push(`/plantillas/${id}`);
    router.refresh();
  }

  async function deleteTemplate() {
    if (!templateId) return;
    if (!confirm(`¿Eliminar la plantilla "${meta.name || "sin nombre"}"? Esta acción no se puede deshacer.`)) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("template_mesocycles").delete().eq("id", templateId);
    setSaving(false);
    if (error) {
      alert("No se pudo eliminar la plantilla: " + error.message);
      return;
    }
    router.push("/plantillas");
    router.refresh();
  }

  if (loading) return <p className="text-[var(--color-text)]/40">Cargando...</p>;

  const blockedByOwnership = !!templateId && profile?.role === "entrenador" && createdBy !== profile.id;
  if (blockedByOwnership) {
    return (
      <div>
        <button onClick={() => router.back()} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)] mb-4">
          &larr; Volver
        </button>
        <p className="text-[var(--color-text)]/55">Solo quien creó esta plantilla puede editarla.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)]">
            &larr;
          </button>
          <h1 className="text-xl font-semibold">{templateId ? "Editar plantilla" : "Nueva plantilla"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {templateId && (
            <Button variant="danger" onClick={deleteTemplate} disabled={saving}>
              <Trash2 size={14} strokeWidth={2.75} aria-hidden="true" /> Eliminar
            </Button>
          )}
          <Button onClick={saveAll} disabled={saving}>
            <Save size={14} strokeWidth={2.75} aria-hidden="true" /> {saving ? "Guardando..." : "Guardar todo"}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Nombre">
            <Input value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} />
          </Field>
          <Field label="Fase">
            <Select value={meta.phase} onChange={(e) => setMeta({ ...meta, phase: e.target.value })}>
              <option>Introducción</option>
              <option>Desarrollo</option>
              <option>Pico</option>
              <option>Descarga</option>
            </Select>
          </Field>
        </div>
        <div className="mb-4">
          <Field label="Descripción (para qué contexto sirve: nivel, lesión, disciplina...)">
            <Textarea
              rows={2}
              value={meta.description}
              onChange={(e) => setMeta({ ...meta, description: e.target.value })}
              placeholder="Ej: Mesociclo de base para escaladores intermedios sin lesiones activas, foco en fuerza de dedos"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <Field label="RPE max/semana sugerido">
            <Input type="number" value={meta.max_rpe_week} onChange={(e) => setMeta({ ...meta, max_rpe_week: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              checked={meta.is_published}
              onChange={(e) => setMeta({ ...meta, is_published: e.target.checked })}
            />
            <span className="text-sm">Pública (la puede usar cualquiera; si no, solo tú y tus escaladores)</span>
          </label>
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
              <Button key={w.id} variant="secondary" onClick={() => copyWeekTo(i)}>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {currentWeek.days.map((day, dayIdx) => (
          <Card key={day.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{day.day_of_week}</span>
              <div className="flex items-center gap-2">
                <button title="Duplicar a día siguiente" onClick={() => duplicateDayToNext(dayIdx)} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)]">
                  <Files size={14} strokeWidth={2.75} aria-hidden="true" />
                </button>
                <button title="Vaciar día" onClick={() => clearDay(dayIdx)} className="text-[var(--color-text)]/40 hover:text-red-500">
                  <Trash2 size={14} strokeWidth={2.75} aria-hidden="true" />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-[var(--color-text)]/70 mb-2">
              <input type="checkbox" checked={day.is_rest} onChange={(e) => updateDay(dayIdx, { is_rest: e.target.checked })} />
              Descanso
            </label>

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
                                list="template-exercise-names"
                                value={block.exercise_name_freetext}
                                onChange={(e) => updateBlock(dayIdx, blockIdx, { exercise_name_freetext: e.target.value })}
                                onBlur={(e) => onExerciseNameBlur(dayIdx, blockIdx, e.target.value)}
                                placeholder="Buscar ejercicio o escribir libre..."
                              />
                            </Field>
                            <Field label="Categoría">
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

      <datalist id="template-exercise-names">
        {exerciseNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </div>
  );
}
