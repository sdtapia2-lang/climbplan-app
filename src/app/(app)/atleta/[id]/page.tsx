"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { Card, Field, Input, Textarea, Button, Spinner } from "@/components/ui";
import { EQUIPMENT_OPTIONS, type Athlete } from "@/lib/types";

export default function AthleteProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { refresh } = useAthlete();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customEquipment, setCustomEquipment] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("athletes").select("*").eq("id", id).single();
      setAthlete(data as Athlete);
      setLoading(false);
    })();
  }, [id]);

  function update<K extends keyof Athlete>(key: K, value: Athlete[K]) {
    setAthlete((a) => (a ? { ...a, [key]: value } : a));
  }

  function toggleEquipment(item: string) {
    if (!athlete) return;
    const has = athlete.equipment.includes(item);
    update(
      "equipment",
      has ? athlete.equipment.filter((e) => e !== item) : [...athlete.equipment, item],
    );
  }

  function addCustomEquipment() {
    if (!athlete || !customEquipment.trim()) return;
    update("equipment", [...athlete.equipment, customEquipment.trim()]);
    setCustomEquipment("");
  }

  async function save() {
    if (!athlete) return;
    setSaving(true);
    const supabase = createClient();
    const { id: athleteId, created_at, ...rest } = athlete;
    void athleteId;
    void created_at;
    await supabase
      .from("athletes")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", athlete.id);
    setSaving(false);
    refresh();
  }

  if (loading) return <Spinner />;
  if (!athlete) return <p className="text-[var(--color-text)]/40">Atleta no encontrado.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)]">
            &larr;
          </button>
          <h1 className="text-xl font-semibold">Perfil de {athlete.name}</h1>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <Card>
        <h2 className="font-medium mb-4">Datos basicos</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre">
            <Input value={athlete.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Edad">
            <Input type="number" value={athlete.age ?? ""} onChange={(e) => update("age", e.target.value ? Number(e.target.value) : null)} />
          </Field>
          <Field label="Altura (cm)">
            <Input type="number" value={athlete.height_cm ?? ""} onChange={(e) => update("height_cm", e.target.value ? Number(e.target.value) : null)} />
          </Field>
          <Field label="Peso (kg)">
            <Input type="number" value={athlete.weight_kg ?? ""} onChange={(e) => update("weight_kg", e.target.value ? Number(e.target.value) : null)} />
          </Field>
          <Field label="Envergadura (cm)">
            <Input type="number" value={athlete.wingspan_cm ?? ""} onChange={(e) => update("wingspan_cm", e.target.value ? Number(e.target.value) : null)} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Grados</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Boulder indoor max">
            <Input value={athlete.boulder_indoor_max ?? ""} onChange={(e) => update("boulder_indoor_max", e.target.value)} />
          </Field>
          <Field label="Boulder outdoor max">
            <Input value={athlete.boulder_outdoor_max ?? ""} onChange={(e) => update("boulder_outdoor_max", e.target.value)} />
          </Field>
          <Field label="Deportiva indoor max">
            <Input value={athlete.sport_indoor_max ?? ""} onChange={(e) => update("sport_indoor_max", e.target.value)} />
          </Field>
          <Field label="Deportiva outdoor max">
            <Input value={athlete.sport_outdoor_max ?? ""} onChange={(e) => update("sport_outdoor_max", e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Grado consolidado">
            <Input value={athlete.consolidated_grade ?? ""} onChange={(e) => update("consolidated_grade", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Objetivos</h2>
        <div className="space-y-4">
          <Field label="Objetivo principal">
            <Input value={athlete.main_goal ?? ""} onChange={(e) => update("main_goal", e.target.value)} />
          </Field>
          <Field label="Objetivo secundario">
            <Input value={athlete.secondary_goal ?? ""} onChange={(e) => update("secondary_goal", e.target.value)} />
          </Field>
          <Field label="Limitante actual">
            <Input value={athlete.current_limiter ?? ""} onChange={(e) => update("current_limiter", e.target.value)} />
          </Field>
          <Field label="Formato de periodizacion">
            <Input value={athlete.periodization_format ?? ""} onChange={(e) => update("periodization_format", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Equipamiento disponible</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {EQUIPMENT_OPTIONS.map((item) => {
            const active = athlete.equipment.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleEquipment(item)}
                className={`text-sm px-3 py-1.5 rounded-full border ${
                  active
                    ? "bg-[var(--color-accent-500)] text-white border-[var(--color-accent-500)]"
                    : "border-[var(--color-divider)] hover:bg-[var(--color-neutral-100)]"
                }`}
              >
                {active ? "" : "+ "}
                {item}
              </button>
            );
          })}
          {athlete.equipment
            .filter((e) => !(EQUIPMENT_OPTIONS as readonly string[]).includes(e))
            .map((item) => (
              <button
                key={item}
                onClick={() => toggleEquipment(item)}
                className="text-sm px-3 py-1.5 rounded-full bg-[var(--color-accent-500)] text-white border border-[var(--color-accent-500)]"
              >
                {item}
              </button>
            ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Otro equipo..."
            value={customEquipment}
            onChange={(e) => setCustomEquipment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomEquipment()}
          />
          <Button variant="secondary" onClick={addCustomEquipment}>
            Agregar
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Estado de salud</h2>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={athlete.has_active_injury}
            onChange={(e) => update("has_active_injury", e.target.checked)}
          />
          <span className="text-sm">Lesion activa</span>
        </label>
        {athlete.has_active_injury && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ubicacion anatomica">
              <Input value={athlete.injury_location ?? ""} onChange={(e) => update("injury_location", e.target.value)} />
            </Field>
            <Field label="Diagnostico">
              <Input value={athlete.injury_diagnosis ?? ""} onChange={(e) => update("injury_diagnosis", e.target.value)} />
            </Field>
            <Field label="Desde">
              <Input type="date" value={athlete.injury_since ?? ""} onChange={(e) => update("injury_since", e.target.value)} />
            </Field>
            <Field label="Umbral de dolor (0-10)">
              <Input type="number" min={0} max={10} value={athlete.pain_threshold ?? ""} onChange={(e) => update("pain_threshold", e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <div className="col-span-2">
              <Field label="Descripcion">
                <Textarea rows={2} value={athlete.injury_description ?? ""} onChange={(e) => update("injury_description", e.target.value)} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Restricciones actuales">
                <Textarea rows={2} value={athlete.injury_restrictions ?? ""} onChange={(e) => update("injury_restrictions", e.target.value)} />
              </Field>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Notas kinesiologicas</h2>
        <div className="space-y-4">
          <Field label="Notas generales">
            <Textarea rows={3} value={athlete.general_notes ?? ""} onChange={(e) => update("general_notes", e.target.value)} />
          </Field>
          <Field label="Reglas transversales">
            <Textarea
              rows={3}
              placeholder="ej: Progresion de carga en dedos max 5-10%/semana, antagonistas obligatorios cada semana"
              value={athlete.transversal_rules ?? ""}
              onChange={(e) => update("transversal_rules", e.target.value)}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
