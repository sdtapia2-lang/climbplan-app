"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { Card, Field, Input, Textarea, Button, Modal, Spinner, EmptyState } from "@/components/ui";
import { PAIN_ZONES, type CheckIn } from "@/lib/types";

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

export default function CheckInPage() {
  const { athlete, athleteId } = useAthlete();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [saving, setSaving] = useState(false);

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
    await supabase.from("checkins").insert({ ...draft, athlete_id: athleteId });
    setSaving(false);
    setModalOpen(false);
    setDraft(emptyDraft());
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Check-in semanal &mdash; {athlete?.name}</h1>
        <Button onClick={() => setModalOpen(true)}>+ Nuevo</Button>
      </div>

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
                <span className="text-sm text-neutral-500">Adherencia {c.adherence_pct}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-neutral-500 mb-2">
                <span>Sueno: {c.sleep_quality}/10</span>
                <span>Motivacion: {c.motivation}/10</span>
              </div>
              {c.comment && <p className="text-sm text-neutral-600">{c.comment}</p>}
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Check-in semanal">
        <div className="space-y-5">
          <Field label="Fecha">
            <Input type="date" value={draft.checkin_date} onChange={(e) => setDraft({ ...draft, checkin_date: e.target.value })} />
          </Field>

          <SliderField
            label={`Calidad de sueno: ${draft.sleep_quality}/10`}
            value={draft.sleep_quality ?? 7}
            onChange={(v) => setDraft({ ...draft, sleep_quality: v })}
          />
          <SliderField
            label={`Motivacion: ${draft.motivation}/10`}
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
