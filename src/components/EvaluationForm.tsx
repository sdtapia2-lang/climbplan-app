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
    shoulder_ir_l: "",
    shoulder_ir_r: "",
    frog_l: "",
    frog_r: "",
    thomas_l: "",
    thomas_r: "",
    mobility_notes: "",
    weighted_pullup_kg: null,
    bench_press_kg: null,
    deadlift_kg: null,
    goblet_squat_kg: null,
    pushup_max_reps: null,
    plank_seconds: null,
    lsit_seconds: null,
    vertical_jump_cm: null,
    left_mvc_kg: null,
    left_mvc_bw_pct: null,
    left_cf_reps: null,
    left_cf_avg_force_kg: null,
    left_cf_drop_pct: null,
    left_rfd_100: null,
    left_rfd_2080: null,
    right_mvc_kg: null,
    right_mvc_bw_pct: null,
    right_cf_reps: null,
    right_cf_avg_force_kg: null,
    right_cf_drop_pct: null,
    right_rfd_100: null,
    right_rfd_2080: null,
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
  ["heart_condition", "Problema cardíaco diagnosticado"],
  ["chest_pain", "Dolor de pecho con actividad física"],
  ["dizziness", "Pérdida de equilibrio o mareo en el último año"],
  ["bp_medication", "Medicación para presión arterial o corazón"],
  ["joint_issue", "Problema óseo o articular que empeore con ejercicio"],
  ["other_medical", "Otra razón médica relevante"],
];

const PAIN_ZONES_LIST: [string, string][] = [
  ["fingers", "Dedos / poleas"],
  ["wrist", "Muñeca"],
  ["elbow", "Codo"],
  ["shoulder", "Hombro"],
  ["low_back", "Espalda baja"],
  ["knee", "Rodilla"],
];

function numOrNull(v: string) {
  return v === "" ? null : Number(v);
}

export function EvaluationForm({
  evaluationId,
  isOnboardingGate = false,
  onOnboardingComplete,
}: {
  evaluationId?: string;
  isOnboardingGate?: boolean;
  onOnboardingComplete?: () => void;
}) {
  const { athleteId } = useAthlete();
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("General");
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [loading, setLoading] = useState(!!evaluationId);
  const [saving, setSaving] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

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
  const leftMvcBwPct = leftMvc && draft.weight_kg ? (leftMvc / draft.weight_kg) * 100 : null;
  const rightMvcBwPct = rightMvc && draft.weight_kg ? (rightMvc / draft.weight_kg) * 100 : null;

  const [savedForGate, setSavedForGate] = useState(false);

  async function save() {
    if (!athleteId) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      ...draft,
      athlete_id: athleteId,
      asymmetry_mvc_pct: asymmetry,
      left_mvc_bw_pct: leftMvcBwPct,
      right_mvc_bw_pct: rightMvcBwPct,
    };

    if (evaluationId) {
      await supabase.from("evaluations").update(payload).eq("id", evaluationId);
      router.push("/evaluacion");
    } else if (isOnboardingGate) {
      await supabase.from("evaluations").insert(payload);
      setSaving(false);
      setSavedForGate(true);
      return;
    } else {
      const { data } = await supabase.from("evaluations").insert(payload).select("id").single();
      router.push(data ? `/evaluacion/${data.id}` : "/evaluacion");
    }
    setSaving(false);
    router.refresh();
  }

  async function generatePlan() {
    setGeneratingPlan(true);
    try {
      await fetch("/api/generate-mesocycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, mode: "initial" }),
      });
    } catch {
      // Si falla la generación (red, API caída, etc.) igual dejamos pasar al
      // atleta -- va a ver el estado vacío de /mesociclo con su opción manual.
    }
    onOnboardingComplete?.();
  }

  if (generatingPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-8 h-8 border-2 border-[var(--color-neutral-300)] border-t-[var(--color-accent-500)] rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-text)]/70 max-w-xs">
          Armando tu planificación inicial...
        </p>
      </div>
    );
  }

  if (loading) return <p className="text-[var(--color-text)]/40">Cargando...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {evaluationId ? "Editar evaluación" : "Nueva evaluación"} &mdash; {draft.eval_date}
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
            Cualquier &quot;Sí&quot; implica consultar con un profesional de salud antes de continuar con tests de máxima intensidad.
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
          <MobilityTestRow
            label="Movilidad interna (hombro)"
            tooltip="Rotación interna de hombro con el brazo en abducción de 90 grados: cuánto rota el hombro hacia adentro. Limitación típica en escaladores por el sesgo de tracción."
            leftValue={draft.shoulder_ir_l ?? ""}
            rightValue={draft.shoulder_ir_r ?? ""}
            onLeftChange={(v) => set("shoulder_ir_l", v)}
            onRightChange={(v) => set("shoulder_ir_r", v)}
          />
          <MobilityTestRow
            label="Apertura de ranita (cadera)"
            tooltip="Acostado boca arriba, rodillas y caderas flexionadas abriendo hacia los costados (posición de rana). Evalúa movilidad de cadera en rotación externa."
            leftValue={draft.frog_l ?? ""}
            rightValue={draft.frog_r ?? ""}
            onLeftChange={(v) => set("frog_l", v)}
            onRightChange={(v) => set("frog_r", v)}
          />
          <MobilityTestRow
            label="Test de Thomas (cadera)"
            tooltip="Acostado boca arriba al borde de la camilla, una pierna llevada al pecho y la otra colgando extendida. Evalúa acortamiento de psoas / recto femoral."
            leftValue={draft.thomas_l ?? ""}
            rightValue={draft.thomas_r ?? ""}
            onLeftChange={(v) => set("thomas_l", v)}
            onRightChange={(v) => set("thomas_r", v)}
          />
          <Field label="Notas de movilidad">
            <Textarea rows={3} value={draft.mobility_notes ?? ""} onChange={(e) => set("mobility_notes", e.target.value)} />
          </Field>
        </div>
      )}

      {tab === "Fuerza" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Dominadas lastradas (kg)">
            <Input type="number" value={draft.weighted_pullup_kg ?? ""} onChange={(e) => set("weighted_pullup_kg", numOrNull(e.target.value))} />
          </Field>
          <Field label="Press banca (kg)">
            <Input type="number" value={draft.bench_press_kg ?? ""} onChange={(e) => set("bench_press_kg", numOrNull(e.target.value))} />
          </Field>
          <Field
            label="Push-ups máximos (reps)"
            tooltip="Si no hay test de press banca, se estima desde estas reps a fallo (64% del peso corporal x fórmula de Epley) como respaldo de baja confianza."
          >
            <Input type="number" value={draft.pushup_max_reps ?? ""} onChange={(e) => set("pushup_max_reps", numOrNull(e.target.value))} />
          </Field>
          <Field label="Peso muerto (kg)">
            <Input type="number" value={draft.deadlift_kg ?? ""} onChange={(e) => set("deadlift_kg", numOrNull(e.target.value))} />
          </Field>
          <Field
            label="Sentadilla goblet (kg)"
            tooltip="Si no hay test de peso muerto, se usa esta carga x2 como estimación de baja confianza."
          >
            <Input type="number" value={draft.goblet_squat_kg ?? ""} onChange={(e) => set("goblet_squat_kg", numOrNull(e.target.value))} />
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
          <HandSection label="Mano izquierda" prefix="left" draft={draft} set={set} bwPct={leftMvcBwPct} />
          <HandSection label="Mano derecha" prefix="right" draft={draft} set={set} bwPct={rightMvcBwPct} />
          {asymmetry !== null && (
            <p className="text-sm text-[var(--color-text)]/70">
              Asimetría MVC calculada: <span className="font-medium">{asymmetry.toFixed(1)}%</span>{" "}
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
            <Field label="Duración ARC (min)">
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

      <div className="mt-6 flex justify-end gap-2">
        {isOnboardingGate && (
          <Button onClick={generatePlan} disabled={!savedForGate} variant="secondary">
            Generar planificación
          </Button>
        )}
        <Button onClick={save} disabled={saving || (isOnboardingGate && savedForGate)}>
          {saving ? "Guardando..." : isOnboardingGate && savedForGate ? "Guardado" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

function MobilityTestRow({
  label,
  tooltip,
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
}: {
  label: string;
  tooltip: string;
  leftValue: string;
  rightValue: string;
  onLeftChange: (value: string) => void;
  onRightChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label={`${label} -- izquierda`} tooltip={tooltip}>
        <Input value={leftValue} onChange={(e) => onLeftChange(e.target.value)} />
      </Field>
      <Field label={`${label} -- derecha`} tooltip={tooltip}>
        <Input value={rightValue} onChange={(e) => onRightChange(e.target.value)} />
      </Field>
    </div>
  );
}

function HandSection({
  label,
  prefix,
  draft,
  set,
  bwPct,
}: {
  label: string;
  prefix: "left" | "right";
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  bwPct: number | null;
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
        <Field label="MVC %BW" tooltip="Se calcula solo: MVC (kg) / peso corporal de la evaluación x 100.">
          <Input type="number" value={bwPct !== null ? bwPct.toFixed(1) : ""} disabled readOnly className="opacity-70" />
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
        <Field label="% caída">
          <Input
            type="number"
            value={draft[`${prefix}_cf_drop_pct`] ?? ""}
            onChange={(e) => set(`${prefix}_cf_drop_pct`, numOrNull(e.target.value))}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="RFD 100ms (kg/s)">
          <Input
            type="number"
            value={draft[`${prefix}_rfd_100`] ?? ""}
            onChange={(e) => set(`${prefix}_rfd_100`, numOrNull(e.target.value))}
          />
        </Field>
        <Field label="RFD 20-80% (kg/s)" tooltip="RFD entre el 20% y el 80% de la MVC -- así lo reporta la app de Tindeq.">
          <Input
            type="number"
            value={draft[`${prefix}_rfd_2080`] ?? ""}
            onChange={(e) => set(`${prefix}_rfd_2080`, numOrNull(e.target.value))}
          />
        </Field>
      </div>
    </div>
  );
}
