"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "./AthleteProvider";
import { Card, Field, Input, Select, Textarea, Button, Spinner, Segmented } from "./ui";
import type { FormResponse, FormTemplate, FormTemplateField } from "@/lib/types";

type Values = Record<string, string | number | boolean | null>;

export function DynamicForm({ templateId }: { templateId: string }) {
  const { athlete, athleteId } = useAthlete();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [fields, setFields] = useState<FormTemplateField[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [values, setValues] = useState<Values>({});
  const [tab, setTab] = useState<string>("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data: t } = await supabase.from("form_templates").select("*").eq("id", templateId).single();
    setTemplate(t as FormTemplate);
    const { data: f } = await supabase.from("form_template_fields").select("*").eq("template_id", templateId).order("position");
    setFields((f as FormTemplateField[]) ?? []);
    setTab(f?.[0]?.section ?? "General");
    if (athleteId) {
      const { data: r } = await supabase
        .from("form_responses")
        .select("*")
        .eq("template_id", templateId)
        .eq("athlete_id", athleteId)
        .order("response_date", { ascending: false });
      setResponses((r as FormResponse[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial y al cambiar de atleta
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, athleteId]);

  const sections = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const f of fields) {
      if (!seen.has(f.section)) {
        seen.add(f.section);
        list.push(f.section);
      }
    }
    return list;
  }, [fields]);

  function setValue(key: string, value: string | number | boolean | null) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save() {
    if (!athleteId) return;
    const missing = fields.filter((f) => f.required && !values[f.key]);
    if (missing.length > 0) {
      alert("Faltan campos obligatorios: " + missing.map((f) => f.label).join(", "));
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("form_responses").insert({
      template_id: templateId,
      athlete_id: athleteId,
      field_values: values,
      created_by: user?.id,
    });
    setValues({});
    setSaving(false);
    load();
  }

  if (loading) return <Spinner />;
  if (!template) return <p className="text-[var(--color-text)]/40">Plantilla no encontrada.</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">{template.name}</h1>
      <p className="text-sm text-[var(--color-text)]/55 mb-6">
        {template.description} &mdash; para {athlete?.name ?? "..."}
      </p>

      {sections.length > 1 && (
        <div className="mb-6">
          <Segmented options={sections.map((s) => ({ value: s, label: s }))} value={tab} onChange={setTab} />
        </div>
      )}

      <div className="space-y-4 mb-6">
        {fields
          .filter((f) => sections.length <= 1 || f.section === tab)
          .map((f) => (
            <Field key={f.id} label={f.label + (f.required ? " *" : "")}>
              <DynamicInput field={f} value={values[f.key] ?? ""} onChange={(v) => setValue(f.key, v)} />
              {f.help_text && <p className="text-xs text-[var(--color-text)]/40 mt-1">{f.help_text}</p>}
            </Field>
          ))}
      </div>

      <Button onClick={save} disabled={saving || !athleteId}>
        {saving ? "Guardando..." : "Guardar respuesta"}
      </Button>

      {responses.length > 0 && (
        <div className="mt-10">
          <h2 className="font-medium mb-3">Respuestas anteriores</h2>
          <div className="space-y-3">
            {responses.map((r) => (
              <Card key={r.id}>
                <p className="text-sm font-medium mb-2">{r.response_date}</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-[var(--color-text)]/55">
                  {fields.map((f) => (
                    <span key={f.id}>
                      {f.label}: {String(r.field_values[f.key] ?? "-")}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DynamicInput({
  field,
  value,
  onChange,
}: {
  field: FormTemplateField;
  value: string | number | boolean;
  onChange: (v: string | number | boolean | null) => void;
}) {
  switch (field.field_type) {
    case "number":
      return (
        <Input
          type="number"
          value={value === "" ? "" : Number(value)}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );
    case "boolean":
      return (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm text-[var(--color-text)]/55">Si</span>
        </label>
      );
    case "textarea":
      return <Textarea rows={3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "select":
      return (
        <Select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          <option value="">Elegir...</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      );
    case "date":
      return <Input type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    default:
      return <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
}
