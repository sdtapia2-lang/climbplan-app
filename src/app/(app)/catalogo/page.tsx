"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Field, Input, Textarea, Select, Button, Modal, Badge, Spinner, EmptyState } from "@/components/ui";
import { EQUIPMENT_OPTIONS, EXERCISE_CATEGORIES, type Exercise } from "@/lib/types";
import { useProfile, canManageCatalog } from "@/components/ProfileProvider";

const emptyExercise: Omit<Exercise, "id" | "created_at"> = {
  name: "",
  category: "Strength and Power",
  equipment_required: [],
  typical_sets: "",
  typical_reps: "",
  typical_time: "",
  typical_duration: "",
  typical_effort: "",
  description: "",
  is_benchmark: false,
};

export default function CatalogPage() {
  const { profile } = useProfile();
  const canEdit = canManageCatalog(profile);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas las categorías");
  const [equipmentFilter, setEquipmentFilter] = useState("Todo equipo");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<typeof emptyExercise>(emptyExercise);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("exercises").select("*").order("name");
    setExercises((data as Exercise[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
    load();
  }, []);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "Todas las categorías" && ex.category !== categoryFilter) return false;
      if (equipmentFilter !== "Todo equipo" && !ex.equipment_required.includes(equipmentFilter)) return false;
      return true;
    });
  }, [exercises, search, categoryFilter, equipmentFilter]);

  function toggleDraftEquipment(item: string) {
    setDraft((d) => ({
      ...d,
      equipment_required: d.equipment_required.includes(item)
        ? d.equipment_required.filter((e) => e !== item)
        : [...d.equipment_required, item],
    }));
  }

  async function createExercise() {
    if (!draft.name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("exercises").insert(draft);
    setSaving(false);
    setModalOpen(false);
    setDraft(emptyExercise);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Catálogo de ejercicios</h1>
        {canEdit && <Button onClick={() => setModalOpen(true)}>+ Nuevo</Button>}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option>Todas las categorias</option>
          {EXERCISE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select value={equipmentFilter} onChange={(e) => setEquipmentFilter(e.target.value)}>
          <option>Todo equipo</option>
          {EQUIPMENT_OPTIONS.map((eq) => (
            <option key={eq}>{eq}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState text="Sin ejercicios que coincidan con el filtro." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((ex) => (
            <Card key={ex.id}>
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium">{ex.name}</p>
                {ex.is_benchmark && <Badge tone="orange">Test</Badge>}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge>{ex.category}</Badge>
              </div>
              {ex.description && <p className="text-sm text-[var(--color-text)]/55 mb-2">{ex.description}</p>}
              <div className="flex flex-wrap gap-1 mb-2">
                {ex.equipment_required.map((eq) => (
                  <Badge key={eq} tone="green">
                    {eq}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-[var(--color-text)]/40">
                {[ex.typical_sets && `${ex.typical_sets} series`, ex.typical_reps, ex.typical_time, ex.typical_duration, ex.typical_effort]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo ejercicio">
        <div className="space-y-4">
          <Field label="Nombre">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Categoría">
            <Select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
              {EXERCISE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Equipamiento requerido">
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((item) => {
                const active = draft.equipment_required.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDraftEquipment(item)}
                    className={`text-sm px-3 py-1 rounded-full border ${
                      active ? "bg-[var(--color-accent-500)] text-white border-[var(--color-accent-500)]" : "border-[var(--color-divider)] hover:bg-[var(--color-neutral-100)]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Series típicas">
              <Input value={draft.typical_sets ?? ""} onChange={(e) => setDraft({ ...draft, typical_sets: e.target.value })} />
            </Field>
            <Field label="Reps típicas">
              <Input value={draft.typical_reps ?? ""} onChange={(e) => setDraft({ ...draft, typical_reps: e.target.value })} />
            </Field>
            <Field label="Tiempo típico">
              <Input value={draft.typical_time ?? ""} onChange={(e) => setDraft({ ...draft, typical_time: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Esfuerzo típico">
              <Input value={draft.typical_effort ?? ""} onChange={(e) => setDraft({ ...draft, typical_effort: e.target.value })} />
            </Field>
            <Field label="Duración típica">
              <Input value={draft.typical_duration ?? ""} onChange={(e) => setDraft({ ...draft, typical_duration: e.target.value })} />
            </Field>
          </div>
          <Field label="Descripción / intención">
            <Textarea rows={3} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.is_benchmark}
              onChange={(e) => setDraft({ ...draft, is_benchmark: e.target.checked })}
            />
            <span className="text-sm">Es test / benchmark</span>
          </label>
          <Button onClick={createExercise} disabled={saving} className="w-full justify-center">
            {saving ? "Creando..." : "Crear"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
