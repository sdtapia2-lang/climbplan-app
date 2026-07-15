"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "./ProfileProvider";
import { Card, Field, Input, Select, Textarea, Button } from "./ui";
import { FIELD_TYPES, FORM_TYPES, type FieldType, type FormType } from "@/lib/types";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";

type FieldDraft = {
  id: string;
  section: string;
  key: string;
  label: string;
  field_type: FieldType;
  options: string;
  help_text: string;
  required: boolean;
};

function uid() {
  return crypto.randomUUID();
}
function slugify(label: string) {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
function emptyField(): FieldDraft {
  return { id: uid(), section: "General", key: "", label: "", field_type: "text", options: "", help_text: "", required: false };
}

const TYPE_LABELS: Record<FormType, string> = { evaluation: "Evaluacion", checkin: "Check-in" };

export function FormTemplateBuilder({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const { profile } = useProfile();
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<FormType>("evaluation");
  const [isPublished, setIsPublished] = useState(true);
  const [fields, setFields] = useState<FieldDraft[]>([emptyField()]);
  const [loading, setLoading] = useState(!!templateId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: t } = await supabase.from("form_templates").select("*").eq("id", templateId).single();
      if (t) {
        setName(t.name);
        setDescription(t.description ?? "");
        setType(t.type);
        setIsPublished(t.is_published);
        setCreatedBy(t.created_by);
      }
      const { data: f } = await supabase
        .from("form_template_fields")
        .select("*")
        .eq("template_id", templateId)
        .order("position");
      setFields(
        (f ?? []).map((row) => ({
          id: row.id,
          section: row.section,
          key: row.key,
          label: row.label,
          field_type: row.field_type,
          options: (row.options ?? []).join(", "),
          help_text: row.help_text ?? "",
          required: row.required,
        })),
      );
      setLoading(false);
    })();
  }, [templateId]);

  function addField() {
    setFields((f) => [...f, emptyField()]);
  }
  function removeField(idx: number) {
    setFields((f) => f.filter((_, i) => i !== idx));
  }
  function updateField(idx: number, patch: Partial<FieldDraft>) {
    setFields((f) => f.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }
  function moveField(idx: number, dir: -1 | 1) {
    setFields((f) => {
      const next = [...f];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return f;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }
  function onLabelBlur(idx: number) {
    const field = fields[idx];
    if (!field.key.trim() && field.label.trim()) {
      updateField(idx, { key: slugify(field.label) });
    }
  }

  async function save() {
    setError(null);
    if (!name.trim()) {
      setError("Pon un nombre para la plantilla.");
      return;
    }
    const keys = fields.map((f) => f.key.trim());
    if (fields.some((f) => !f.key.trim() || !f.label.trim())) {
      setError("Todos los campos necesitan clave y etiqueta.");
      return;
    }
    if (new Set(keys).size !== keys.length) {
      setError("Hay claves de campo repetidas.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let id = templateId;
    if (id) {
      await supabase
        .from("form_templates")
        .update({ name, description: description || null, is_published: isPublished, updated_at: new Date().toISOString() })
        .eq("id", id);
      await supabase.from("form_template_fields").delete().eq("template_id", id);
    } else {
      const { data, error: insErr } = await supabase
        .from("form_templates")
        .insert({ name, description: description || null, type, is_published: isPublished, created_by: user?.id })
        .select("id")
        .single();
      if (insErr || !data) {
        setSaving(false);
        setError(insErr?.message ?? "No se pudo crear la plantilla");
        return;
      }
      id = data.id;
    }

    const fieldRows = fields.map((f, pos) => ({
      id: f.id,
      template_id: id,
      section: f.section || "General",
      key: f.key.trim(),
      label: f.label.trim(),
      field_type: f.field_type,
      options: f.field_type === "select" ? f.options.split(",").map((o) => o.trim()).filter(Boolean) : null,
      help_text: f.help_text || null,
      required: f.required,
      position: pos,
    }));
    await supabase.from("form_template_fields").insert(fieldRows);

    setSaving(false);
    router.push("/formularios");
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
        <p className="text-[var(--color-text)]/55">Solo quien creo esta plantilla puede editarla.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)]">
            &larr;
          </button>
          <h1 className="text-xl font-semibold">{templateId ? "Editar plantilla" : "Nueva plantilla"}</h1>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Card className="mb-6">
        <div className="space-y-4">
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Evaluacion post-lesion de hombro" />
          </Field>
          {!templateId && (
            <Field label="Tipo">
              <Select value={type} onChange={(e) => setType(e.target.value as FormType)}>
                {FORM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Descripcion">
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span className="text-sm">Publica (la puede usar cualquiera; si no, solo tu y tus escaladores)</span>
          </label>
        </div>
      </Card>

      <h2 className="font-medium mb-3">Campos</h2>
      <div className="space-y-3">
        {fields.map((f, idx) => (
          <Card key={f.id}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[var(--color-text)]/40 tracking-wide">CAMPO {idx + 1}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => moveField(idx, -1)} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)]" title="Subir">
                  <ChevronUp size={16} strokeWidth={2.75} aria-hidden="true" />
                </button>
                <button onClick={() => moveField(idx, 1)} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)]" title="Bajar">
                  <ChevronDown size={16} strokeWidth={2.75} aria-hidden="true" />
                </button>
                <button onClick={() => removeField(idx)} className="text-red-400 hover:text-red-600" title="Quitar">
                  <Trash2 size={15} strokeWidth={2.75} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Etiqueta (lo que ve el usuario)">
                <Input value={f.label} onChange={(e) => updateField(idx, { label: e.target.value })} onBlur={() => onLabelBlur(idx)} />
              </Field>
              <Field label="Clave interna">
                <Input value={f.key} onChange={(e) => updateField(idx, { key: slugify(e.target.value) })} />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <Field label="Seccion / pestana">
                <Input value={f.section} onChange={(e) => updateField(idx, { section: e.target.value })} />
              </Field>
              <Field label="Tipo de dato">
                <Select value={f.field_type} onChange={(e) => updateField(idx, { field_type: e.target.value as FieldType })}>
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <label className="flex items-center gap-2 pt-6 text-sm">
                <input type="checkbox" checked={f.required} onChange={(e) => updateField(idx, { required: e.target.checked })} />
                Obligatorio
              </label>
            </div>
            {f.field_type === "select" && (
              <Field label="Opciones (separadas por coma)">
                <Input value={f.options} onChange={(e) => updateField(idx, { options: e.target.value })} placeholder="Verde, Amarillo, Rojo" />
              </Field>
            )}
          </Card>
        ))}
      </div>
      <Button variant="secondary" onClick={addField} className="w-full justify-center mt-3">
        + Agregar campo
      </Button>
    </div>
  );
}
