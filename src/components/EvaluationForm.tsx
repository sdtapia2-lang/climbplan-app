"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "./AthleteProvider";
import { Field, Input, Textarea, Button, Segmented } from "./ui";
import type { Evaluation } from "@/lib/types";
import { TriangleAlert } from "lucide-react";

const TABS = ["General", "Salud", "Movilidad", "Fuerza", "Dedos/Tindeq", "Resistencia", "Nivel"] as const;

type Draft = Omit<Evaluation, "id" | "athlete_id" | "created_at">;

function emptyDraft(): Draft {
  return {
    eval_date: new Date().toISOString().slice(0, 10),
    weight_kg: null,
    height_cm: null,
    wingspan_cm: null,
    health_screening: {},
    pain_by_zone: {},
    shoulder_ir: "",
    shoulder_er: "",
    wrist_mobility: "",
    deep_squat: null,
    thomas_test: "",
    mobility_notes: "",
    pullups_max: "",
    horizontal_push: "",
    plank_seconds: null,
    lsit_seconds: null,
    vertical_jump_cm: null,
    left_mvc_kg: null,
    left_mvc_bw_pct: null,
    left_cf_reps: null,
    left_cf_avg_force_kg: null,
    left_cf_drop_pct: null,
    left_rfd_100: null,
    left_rfd_150: null,
    left_rfd_200: null,
    left_rfd_250: null,
    right_mvc_kg: null,
    right_mvc_bw_pct: null,
    right_cf_reps: null,
    right_cf_avg_force_kg: null,
    right_cf_drop_pct: null,
    right_rfd_100: null,
    right_rfd_150: null,
    right_rfd_200: null,
    right_rfd_250: null,
    asymmetry_mvc_pct: null,
    asymmetry_cf_pct: null,
    arc_duration_min: null,
    arc_rpe: null,
    arc_completed: null,
    endurance_notes: "",
    boulder_redpoint: "",
    boulder_onsight: "",
    sport_redpoint: "",
    sport_onsight: "",
    summary_flags: [],
    evaluator_notes: "",
  };
}

const HEALTH_QUESTIONS: [string, string][] = [
  ["heart_condition", "Problema cardiaco diagnosticado"],
  ["chest_pain", "Dolor de pecho con actividad fisica"],
  ["dizziness", "Perdida de equilibrio o mareo en el ultimo ano"],
  ["bp_medication", "Medicacion para presion arterial o corazon"],
  ["joint_issue", "Problema oseo o articular que empeore con ejercicio"],
  ["other_medical", "Otra razon medica relevante"],
];

const PAIN_ZONES_LIST: [string, string][] = [
  ["fingers", "Dedos / poleas"],
  ["wrist", "Muneca"],
  ["elbow", "Codo"],
  ["shoulder", "Hombro"],
  ["low_back", "Espalda baja"],
  ["knee", "Rodilla"],
];

function numOrNull(v: string) {
  return v === "" ? null : Number(v);
}

export function EvaluationForm({ evaluationId }: { evaluationId?: string }) {
  const { athleteId } = useAthlete();
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("General");
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [loading, setLoading] = useState(!!evaluationId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!evaluationId) return;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.from("evaluations").select("*").eq("id", evaluationId).single();
      if (data) setDraft(data as Draft);
      setLoading(false);
    })();
  }, [evaluationId]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setHealth(key: string, value: boolean) {
    setDraft((d) => ({ ...d, health_screening: { ...d.health_screening, [key]: value } }));
  }

  function setPain(key: string, value: number) {
    setDraft((d) => ({ ...d, pain_by_zone: { ...d.pain_by_zone, [key]: value } }));
  }

  const leftMvc = draft.left_mvc_kg;
  const rightMvc = draft.right_mvc_kg;
  const asymmetry =
    leftMvc && rightMvc
      ? (Math.abs(leftMvc - rightMvc) / Math.max(leftMvc, rightMvc)) * 100
      : null;

  async function save() {
    if (!athleteId) return;
    setSaving(true);
    const supabase = createClient();
    const payload = { ...draft, athlete_id: athleteId, asymmetry_mvc_pct: asymmetry };

    if (evaluationId) {
      await supabase.from("evaluations").update(payload).eq("id", evaluationId);
      router.push("/evaluacion");
    } else {
      const { data } = await supabase.from("evaluations").insert(payload).select("id").single();
      router.push(data ? `/evaluacion/${data.id}` : "/evaluacion");
    }
    setSaving(false);
    router.refresh();
  }

  if (loading) return <p className="text-[var(--color-text)]/40">Cargando...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {evaluationId ? "Editar evaluacion" : "Nueva evaluacion"} &mdash; {draft.eval_date}
        </h2>
      </div>

      <div className="mb-6">
        <Segmented options={TABS.map((t) => ({ value: t, label: t }))} value={tab} onChange={setTab} />
      </div>

      {tab === "General" && (
        <div className="grid grid-cols-3 gap-4">
          <Field label="Fecha">
            <Input type="date" value={draft.eval_date} onChange={(e) => set("eval_date", e.target.value)} />
          </Field>
          <Field label="Peso (kg)">
            <Input type="number" value={draft.weight_kg ?? ""} onChange={(e) => set("weight_kg", numOrNull(e.target.value))} />
          </Field>
          <Field label="Altura (cm)">
            <Input type="number" value={draft.height_cm ?? ""} onChange={(e) => set("height_cm", numOrNull(e.target.value))} />
          </Field>
          <Field label="Envergadura (cm)">
            <Input type="number" value={draft.wingspan_cm ?? ""} onChange={(e) => set("wingspan_cm", numOrNull(e.target.value))} />
          </Field>
        </div>
      )}

      {tab === "Salud" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text)]/55">
            Cualquier &quot;Si&quot; implica consultar con un profesional de salud antes de continuar con tests de maxima intensidad.
          </p>
          {HEALTH_QUESTIONS.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!draft.health_screening[key]}
                onChange={(e) => setHealth(key, e.target.checked)}
              />
              {label}
            </label>
          ))}
          <p className="text-sm font-medium mt-4">Dolor actual (0-10) por zona</p>
          <div className="grid grid-cols-2 gap-3">
            {PAIN_ZONES_LIST.map(([key, label]) => (
              <Field key={key} label={label}>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={draft.pain_by_zone[key] ?? ""}
                  onChange={(e) => setPain(key, Number(e.target.value))}
                />
              </Field>
            ))}
          </div>
        </div>
      )}

      {tab === "Movilidad" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rotacion interna hombro">
              <Input value={draft.shoulder_ir ?? ""} onChange={(e) => set("shoulder_ir", e.target.value)} />
            </Field>
            <Field label="Rotacion externa hombro">
              <Input value={draft.shoulder_er ?? ""} onChange={(e) => set("shoulder_er", e.target.value)} />
            </Field>
            <Field label="Movilidad de muneca">
              <Input value={draft.wrist_mobility ?? ""} onChange={(e) => set("wrist_mobility", e.target.value)} />
            </Field>
            <Field label="Test de Thomas (cadera)">
              <Input value={draft.thomas_test ?? ""} onChange={(e) => set("thomas_test", e.target.value)} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!draft.deep_squat}
              onChange={(e) => set("deep_squat", e.target.checked)}
            />
            Sentadilla profunda completa (talones apoyados)
          </label>
          <Field label="Notas de movilidad">
            <Textarea rows={3} value={draft.mobility_notes ?? ""} onChange={(e) => set("mobility_notes", e.target.value)} />
          </Field>
        </div>
      )}

      {tab === "Fuerza" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Dominadas maximas">
            <Input value={draft.pullups_max ?? ""} onChange={(e) => set("pullups_max", e.target.value)} />
          </Field>
          <Field label="Empuje horizontal">
            <Input value={draft.horizontal_push ?? ""} onChange={(e) => set("horizontal_push", e.target.value)} />
          </Field>
          <Field label="Plancha (segundos)">
            <Input type="number" value={draft.plank_seconds ?? ""} onChange={(e) => set("plank_seconds", numOrNull(e.target.value))} />
          </Field>
          <Field label="L-sit (segundos)">
            <Input type="number" value={draft.lsit_seconds ?? ""} onChange={(e) => set("lsit_seconds", numOrNull(e.target.value))} />
          </Field>
          <Field label="Salto vertical (cm)">
            <Input type="number" value={draft.vertical_jump_cm ?? ""} onChange={(e) => set("vertical_jump_cm", numOrNull(e.target.value))} />
          </Field>
        </div>
      )}

      {tab === "Dedos/Tindeq" && (
        <div className="space-y-6">
          <HandSection label="Mano izquierda" prefix="left" draft={draft} set={set} />
          <HandSection label="Mano derecha" prefix="right" draft={draft} set={set} />
          {asymmetry !== null && (
            <p className="text-sm text-[var(--color-text)]/70">
              Asimetria MVC calculada: <span className="font-medium">{asymmetry.toFixed(1)}%</span>{" "}
              {asymmetry > 15 && (
                <span className="inline-flex items-center gap-1 text-red-600">
                  <TriangleAlert size={13} strokeWidth={2.75} aria-hidden="true" /> supera 15%
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {tab === "Resistencia" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Duracion ARC (min)">
              <Input type="number" value={draft.arc_duration_min ?? ""} onChange={(e) => set("arc_duration_min", numOrNull(e.target.value))} />
            </Field>
            <Field label="RPE percibido">
              <Input type="number" min={1} max={10} value={draft.arc_rpe ?? ""} onChange={(e) => set("arc_rpe", numOrNull(e.target.value))} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!draft.arc_completed}
              onChange={(e) => set("arc_completed", e.target.checked)}
            />
            Completo sin caer / soltar
          </label>
          <Field label="Notas">
            <Textarea rows={2} value={draft.endurance_notes ?? ""} onChange={(e) => set("endurance_notes", e.target.value)} />
          </Field>
        </div>
      )}

      {tab === "Nivel" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Boulder redpoint">
            <Input value={draft.boulder_redpoint ?? ""} onChange={(e) => set("boulder_redpoint", e.target.value)} />
          </Field>
          <Field label="Boulder onsight">
            <Input value={draft.boulder_onsight ?? ""} onChange={(e) => set("boulder_onsight", e.target.value)} />
          </Field>
          <Field label="Deportiva redpoint">
            <Input value={draft.sport_redpoint ?? ""} onChange={(e) => set("sport_redpoint", e.target.value)} />
          </Field>
          <Field label="Deportiva onsight">
            <Input value={draft.sport_onsight ?? ""} onChange={(e) => set("sport_onsight", e.target.value)} />
          </Field>
          <div className="col-span-2">
            <Field label="Notas del evaluador / resumen">
              <Textarea rows={3} value={draft.evaluator_notes ?? ""} onChange={(e) => set("evaluator_notes", e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

function HandSection({
  label,
  prefix,
  draft,
  set,
}: {
  label: string;
  prefix: "left" | "right";
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
}) {
  return (
    <div className="border border-[var(--color-divider)] rounded-lg p-4">
      <p className="font-medium mb-3">{label}</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="MVC Peak Force (kg)">
          <Input
            type="number"
            value={draft[`${prefix}_mvc_kg`] ?? ""}
            onChange={(e) => set(`${prefix}_mvc_kg`, numOrNull(e.target.value))}
          />
        </Field>
        <Field label="MVC %BW">
          <Input
            type="number"
            value={draft[`${prefix}_mvc_bw_pct`] ?? ""}
            onChange={(e) => set(`${prefix}_mvc_bw_pct`, numOrNull(e.target.value))}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="CF reps completadas">
          <Input
            type="number"
            value={draft[`${prefix}_cf_reps`] ?? ""}
            onChange={(e) => set(`${prefix}_cf_reps`, numOrNull(e.target.value))}
          />
        </Field>
        <Field label="CF fuerza promedio (kg)">
          <Input
            type="number"
            value={draft[`${prefix}_cf_avg_force_kg`] ?? ""}
            onChange={(e) => set(`${prefix}_cf_avg_force_kg`, numOrNull(e.target.value))}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="% caida">
          <Input
            type="number"
            value={draft[`${prefix}_cf_drop_pct`] ?? ""}
            onChange={(e) => set(`${prefix}_cf_drop_pct`, numOrNull(e.target.value))}
          />
        </Field>
        <Field label="RFD 100ms">
          <Input
            type="number"
            value={draft[`${prefix}_rfd_100`] ?? ""}
            onChange={(e) => set(`${prefix}_rfd_100`, numOrNull(e.target.value))}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="RFD 150ms">
          <Input
            type="number"
            value={draft[`${prefix}_rfd_150`] ?? ""}
            onChange={(e) => set(`${prefix}_rfd_150`, numOrNull(e.target.value))}
          />
        </Field>
        <Field label="RFD 200ms">
          <Input
            type="number"
            value={draft[`${prefix}_rfd_200`] ?? ""}
            onChange={(e) => set(`${prefix}_rfd_200`, numOrNull(e.target.value))}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label="RFD 250ms">
          <Input
            type="number"
            value={draft[`${prefix}_rfd_250`] ?? ""}
            onChange={(e) => set(`${prefix}_rfd_250`, numOrNull(e.target.value))}
          />
        </Field>
      </div>
    </div>
  );
}
