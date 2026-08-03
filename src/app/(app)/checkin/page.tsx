"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { useProfile, isSelfCoached } from "@/components/ProfileProvider";
import { Card, Field, Input, Select, Textarea, Button, Modal, Spinner, EmptyState } from "@/components/ui";
import {
  PAIN_ZONES,
  MILESTONE_CATEGORIES,
  type CheckIn,
  type Mesocycle,
  type Week,
  type Milestone,
  type MetricDefinition,
  type MetricLog,
} from "@/lib/types";
import { computeCurrentWeek } from "@/lib/weeks";
import { Flag, Trash2, LineChart, Plus } from "lucide-react";

function emptyDraft(): Omit<CheckIn, "id" | "athlete_id" | "created_at"> {
  return {
    week_id: null,
    checkin_date: new Date().toISOString().slice(0, 10),
    sleep_quality: 7,
    motivation: 7,
    adherence_pct: 100,
    pain_by_zone: {},
    comment: "",
  };
}

function emptyMilestoneDraft(): Omit<Milestone, "id" | "athlete_id" | "created_at" | "created_by"> {
  return {
    milestone_date: new Date().toISOString().slice(0, 10),
    title: "",
    category: MILESTONE_CATEGORIES[0],
    description: "",
  };
}

function emptyMetricDraft(): Omit<MetricDefinition, "id" | "athlete_id" | "created_at"> {
  return { name: "", unit: "" };
}

function emptyLogDraft(): { log_date: string; value: string; note: string } {
  return { log_date: new Date().toISOString().slice(0, 10), value: "", note: "" };
}

export default function CheckInPage() {
  const { athlete, athleteId } = useAthlete();
  const { profile } = useProfile();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState(emptyMilestoneDraft());
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [metricLogs, setMetricLogs] = useState<Record<string, MetricLog[]>>({});
  const [metricModalOpen, setMetricModalOpen] = useState(false);
  const [metricDraft, setMetricDraft] = useState(emptyMetricDraft());
  const [savingMetric, setSavingMetric] = useState(false);
  const [logModalMetric, setLogModalMetric] = useState<MetricDefinition | null>(null);
  const [logDraft, setLogDraft] = useState(emptyLogDraft());
  const [savingLog, setSavingLog] = useState(false);

  async function load() {
    if (!athleteId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("checkins")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("checkin_date", { ascending: false });
    setCheckins((data as CheckIn[]) ?? []);

    const { data: milestoneRows } = await supabase
      .from("milestones")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("milestone_date", { ascending: false });
    setMilestones((milestoneRows as Milestone[]) ?? []);

    const { data: metricRows } = await supabase
      .from("metric_definitions")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("created_at");
    const metricDefs = (metricRows as MetricDefinition[]) ?? [];
    setMetrics(metricDefs);

    if (metricDefs.length > 0) {
      const { data: logRows } = await supabase
        .from("metric_logs")
        .select("*")
        .in("metric_id", metricDefs.map((m) => m.id))
        .order("log_date", { ascending: true });
      const grouped: Record<string, MetricLog[]> = {};
      for (const log of (logRows as MetricLog[]) ?? []) {
        (grouped[log.metric_id] ??= []).push(log);
      }
      setMetricLogs(grouped);
    } else {
      setMetricLogs({});
    }

    const { data: mesos } = await supabase
      .from("mesocycles")
      .select("*")
      .eq("athlete_id", athleteId)
      .neq("status", "Completado")
      .order("created_at", { ascending: false })
      .limit(1);
    const meso = (mesos?.[0] as Mesocycle) ?? null;
    if (meso) {
      const { data: weeksData } = await supabase.from("weeks").select("*").eq("mesocycle_id", meso.id).order("week_number");
      const currentWeek = computeCurrentWeek(meso, (weeksData as Week[]) ?? []);
      setActiveWeekId(currentWeek?.id ?? null);
    } else {
      setActiveWeekId(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch al cambiar de atleta
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athleteId]);

  async function save() {
    if (!athleteId) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("checkins")
      .insert({ ...draft, athlete_id: athleteId, week_id: activeWeekId })
      .select("id")
      .single();
    setSaving(false);
    setModalOpen(false);
    setDraft(emptyDraft());
    load();

    if (data?.id && isSelfCoached(profile)) {
      // Dispara el ajuste de IA en segundo plano -- no bloquea el cierre del modal.
      fetch("/api/adjust-mesocycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, checkinId: data.id }),
      }).catch(() => {});
    }
  }

  async function saveMilestone() {
    if (!athleteId || !milestoneDraft.title.trim()) return;
    setSavingMilestone(true);
    const supabase = createClient();
    await supabase.from("milestones").insert({ ...milestoneDraft, athlete_id: athleteId });
    setSavingMilestone(false);
    setMilestoneModalOpen(false);
    setMilestoneDraft(emptyMilestoneDraft());
    load();
  }

  async function deleteMilestone(id: string) {
    const supabase = createClient();
    await supabase.from("milestones").delete().eq("id", id);
    setMilestones((ms) => ms.filter((m) => m.id !== id));
  }

  async function saveMetric() {
    if (!athleteId || !metricDraft.name.trim()) return;
    setSavingMetric(true);
    const supabase = createClient();
    await supabase.from("metric_definitions").insert({ ...metricDraft, athlete_id: athleteId });
    setSavingMetric(false);
    setMetricModalOpen(false);
    setMetricDraft(emptyMetricDraft());
    load();
  }

  async function deleteMetric(id: string) {
    const supabase = createClient();
    await supabase.from("metric_definitions").delete().eq("id", id);
    setMetrics((ms) => ms.filter((m) => m.id !== id));
  }

  async function saveLog() {
    if (!athleteId || !logModalMetric || !logDraft.value.trim()) return;
    setSavingLog(true);
    const supabase = createClient();
    await supabase.from("metric_logs").insert({
      metric_id: logModalMetric.id,
      athlete_id: athleteId,
      log_date: logDraft.log_date,
      value: Number(logDraft.value),
      note: logDraft.note || null,
    });
    setSavingLog(false);
    setLogModalMetric(null);
    setLogDraft(emptyLogDraft());
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">Check-in semanal &mdash; {athlete?.name}</h1>
        <Button onClick={() => setModalOpen(true)}>+ Nuevo</Button>
      </div>
      <p className="text-sm text-[var(--color-text)]/55 mb-6">
        Este es el check-in por defecto. También hay{" "}
        <Link href="/formularios" className="text-[var(--color-accent-700)] hover:underline">
          plantillas de check-in personalizadas
        </Link>
        .
      </p>

      {loading ? (
        <Spinner />
      ) : checkins.length === 0 ? (
        <EmptyState text="Sin check-ins registrados" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checkins.map((c) => (
            <Card key={c.id}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{c.checkin_date}</p>
                <span className="text-sm text-[var(--color-text)]/55">Adherencia {c.adherence_pct}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-text)]/55 mb-2">
                <span>Sueño: {c.sleep_quality}/10</span>
                <span>Motivación: {c.motivation}/10</span>
              </div>
              {c.comment && <p className="text-sm text-[var(--color-text)]/70">{c.comment}</p>}
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-10 mb-2">
        <h2 className="text-lg font-semibold flex items-center gap-1.5">
          <LineChart size={16} strokeWidth={2.75} aria-hidden="true" /> Métricas
        </h2>
        <Button variant="secondary" onClick={() => setMetricModalOpen(true)}>
          + Nueva métrica
        </Button>
      </div>
      <p className="text-sm text-[var(--color-text)]/55 mb-6">
        Definí tus propias métricas (peso corporal, horas de sueño, lo que quieras trackear) y registrá valores en el tiempo.
      </p>

      {loading ? (
        <Spinner />
      ) : metrics.length === 0 ? (
        <EmptyState text="Sin métricas definidas" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((m) => {
            const logs = (metricLogs[m.id] ?? []).slice(-8);
            const last = logs[logs.length - 1];
            const max = Math.max(...logs.map((l) => l.value), 1);
            return (
              <Card key={m.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {m.name} {m.unit && <span className="text-[var(--color-text)]/50 font-normal">({m.unit})</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      title="Registrar valor"
                      onClick={() => {
                        setLogModalMetric(m);
                        setLogDraft(emptyLogDraft());
                      }}
                      className="text-[var(--color-accent-700)] hover:text-[var(--color-accent-500)]"
                    >
                      <Plus size={16} strokeWidth={2.75} aria-hidden="true" />
                    </button>
                    <button onClick={() => deleteMetric(m.id)} className="text-[var(--color-text)]/30 hover:text-red-500">
                      <Trash2 size={14} strokeWidth={2.75} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {last ? (
                  <>
                    <p className="text-2xl font-[family-name:var(--font-heading)] text-[var(--color-accent-700)] mb-2">
                      {last.value} <span className="text-sm text-[var(--color-text)]/50">{m.unit}</span>
                    </p>
                    {logs.length > 1 && (
                      <div className="flex items-end gap-1.5 h-16">
                        {logs.map((l) => (
                          <div key={l.id} className="flex-1 flex flex-col items-center justify-end h-full">
                            <div
                              className="w-full rounded-t-sm bg-[var(--color-accent-500)]"
                              style={{ height: `${Math.max((l.value / max) * 100, 4)}%` }}
                              title={`${l.log_date}: ${l.value}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[var(--color-text)]/50">Sin valores todavía</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={metricModalOpen} onClose={() => setMetricModalOpen(false)} title="Nueva métrica">
        <div className="space-y-5">
          <Field label="Nombre">
            <Input
              placeholder="Ej: Peso corporal"
              value={metricDraft.name}
              onChange={(e) => setMetricDraft({ ...metricDraft, name: e.target.value })}
            />
          </Field>
          <Field label="Unidad (opcional)">
            <Input
              placeholder="Ej: kg, hs, %"
              value={metricDraft.unit ?? ""}
              onChange={(e) => setMetricDraft({ ...metricDraft, unit: e.target.value })}
            />
          </Field>
          <Button onClick={saveMetric} disabled={savingMetric || !metricDraft.name.trim()} className="w-full justify-center">
            {savingMetric ? "Guardando..." : "Crear métrica"}
          </Button>
        </div>
      </Modal>

      <Modal open={!!logModalMetric} onClose={() => setLogModalMetric(null)} title={`Registrar ${logModalMetric?.name ?? ""}`}>
        <div className="space-y-5">
          <Field label="Fecha">
            <Input type="date" value={logDraft.log_date} onChange={(e) => setLogDraft({ ...logDraft, log_date: e.target.value })} />
          </Field>
          <Field label={`Valor ${logModalMetric?.unit ? `(${logModalMetric.unit})` : ""}`}>
            <Input
              type="number"
              step="any"
              value={logDraft.value}
              onChange={(e) => setLogDraft({ ...logDraft, value: e.target.value })}
            />
          </Field>
          <Field label="Nota (opcional)">
            <Input value={logDraft.note} onChange={(e) => setLogDraft({ ...logDraft, note: e.target.value })} />
          </Field>
          <Button onClick={saveLog} disabled={savingLog || !logDraft.value.trim()} className="w-full justify-center">
            {savingLog ? "Guardando..." : "Guardar valor"}
          </Button>
        </div>
      </Modal>

      <div className="flex items-center justify-between mt-10 mb-2">
        <h2 className="text-lg font-semibold flex items-center gap-1.5">
          <Flag size={16} strokeWidth={2.75} aria-hidden="true" /> Hitos
        </h2>
        <Button variant="secondary" onClick={() => setMilestoneModalOpen(true)}>
          + Nuevo hito
        </Button>
      </div>
      <p className="text-sm text-[var(--color-text)]/55 mb-6">
        Logros puntuales que valga la pena recordar: una vía nueva, un PR de fuerza, un test superado.
      </p>

      {loading ? (
        <Spinner />
      ) : milestones.length === 0 ? (
        <EmptyState text="Sin hitos registrados" />
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => (
            <Card key={m.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{m.title}</span>
                  {m.category && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)]">
                      {m.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text)]/50 mb-1">{m.milestone_date}</p>
                {m.description && <p className="text-sm text-[var(--color-text)]/70">{m.description}</p>}
              </div>
              <button onClick={() => deleteMilestone(m.id)} className="text-[var(--color-text)]/30 hover:text-red-500 shrink-0">
                <Trash2 size={14} strokeWidth={2.75} aria-hidden="true" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={milestoneModalOpen} onClose={() => setMilestoneModalOpen(false)} title="Nuevo hito">
        <div className="space-y-5">
          <Field label="Fecha">
            <Input
              type="date"
              value={milestoneDraft.milestone_date}
              onChange={(e) => setMilestoneDraft({ ...milestoneDraft, milestone_date: e.target.value })}
            />
          </Field>
          <Field label="Título">
            <Input
              placeholder="Ej: Primer 7a encadenado"
              value={milestoneDraft.title}
              onChange={(e) => setMilestoneDraft({ ...milestoneDraft, title: e.target.value })}
            />
          </Field>
          <Field label="Categoría">
            <Select
              value={milestoneDraft.category ?? ""}
              onChange={(e) => setMilestoneDraft({ ...milestoneDraft, category: e.target.value })}
            >
              {MILESTONE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Descripción (opcional)">
            <Textarea
              rows={3}
              value={milestoneDraft.description ?? ""}
              onChange={(e) => setMilestoneDraft({ ...milestoneDraft, description: e.target.value })}
            />
          </Field>
          <Button onClick={saveMilestone} disabled={savingMilestone || !milestoneDraft.title.trim()} className="w-full justify-center">
            {savingMilestone ? "Guardando..." : "Guardar hito"}
          </Button>
        </div>
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Check-in semanal">
        <div className="space-y-5">
          <Field label="Fecha">
            <Input type="date" value={draft.checkin_date} onChange={(e) => setDraft({ ...draft, checkin_date: e.target.value })} />
          </Field>

          <SliderField
            label={`Calidad de sueño: ${draft.sleep_quality}/10`}
            value={draft.sleep_quality ?? 7}
            onChange={(v) => setDraft({ ...draft, sleep_quality: v })}
          />
          <SliderField
            label={`Motivación: ${draft.motivation}/10`}
            value={draft.motivation ?? 7}
            onChange={(v) => setDraft({ ...draft, motivation: v })}
          />
          <SliderField
            label={`Adherencia al plan: ${draft.adherence_pct}%`}
            value={draft.adherence_pct ?? 100}
            max={100}
            onChange={(v) => setDraft({ ...draft, adherence_pct: v })}
          />

          <div>
            <p className="text-sm font-medium mb-2">Dolor por zona (0-10)</p>
            <div className="grid grid-cols-2 gap-3">
              {PAIN_ZONES.map(([key, label]) => (
                <Field key={key} label={label}>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={draft.pain_by_zone[key] ?? 0}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        pain_by_zone: { ...draft.pain_by_zone, [key]: Number(e.target.value) },
                      })
                    }
                  />
                </Field>
              ))}
            </div>
          </div>

          <Field label="Comentario">
            <Textarea rows={3} value={draft.comment ?? ""} onChange={(e) => setDraft({ ...draft, comment: e.target.value })} />
          </Field>

          <Button onClick={save} disabled={saving} className="w-full justify-center">
            {saving ? "Guardando..." : "Guardar check-in"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
