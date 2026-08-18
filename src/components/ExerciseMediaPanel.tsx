"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile, isAdmin, isCoach } from "./ProfileProvider";
import { Field, Input, Select, Textarea, Button } from "./ui";
import { EXERCISE_MEDIA_KINDS, type ExerciseMedia, type ExerciseMediaKind } from "@/lib/types";
import { Play, Trash2, Plus } from "lucide-react";

const KIND_LABELS: Record<ExerciseMediaKind, string> = {
  demo: "Demostración",
  cue: "Punto técnico",
  variant: "Variante",
};

function emptyDraft() {
  return { kind: "demo" as ExerciseMediaKind, url: "", title: "", notes: "", shared: false };
}

/**
 * Biblioteca de videos de un ejercicio (Fase 4 del plan de entrevistas).
 * URL externa (YouTube/Vimeo) por ahora, la subida a Storage queda diferida.
 * Privada por entrenador (owner_id) salvo que un admin la marque compartida.
 */
export function ExerciseMediaPanel({ exerciseId }: { exerciseId: string }) {
  const { profile } = useProfile();
  const canManage = isAdmin(profile) || isCoach(profile);
  const [media, setMedia] = useState<ExerciseMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(emptyDraft());
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("exercise_media").select("*").eq("exercise_id", exerciseId).order("position");
    setMedia((data as ExerciseMedia[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch al montar/cambiar de ejercicio
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  async function addMedia() {
    if (!draft.url.trim() || !profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("exercise_media").insert({
      exercise_id: exerciseId,
      kind: draft.kind,
      url: draft.url.trim(),
      title: draft.title.trim() || null,
      notes: draft.notes.trim() || null,
      owner_id: draft.shared && isAdmin(profile) ? null : profile.id,
    });
    setSaving(false);
    setDraft(emptyDraft());
    load();
  }

  async function removeMedia(id: string) {
    const supabase = createClient();
    await supabase.from("exercise_media").delete().eq("id", id);
    setMedia((m) => m.filter((x) => x.id !== id));
  }

  if (loading) return <p className="text-sm text-[var(--color-text)]/40">Cargando videos...</p>;

  return (
    <div className="space-y-4">
      {media.length === 0 ? (
        <p className="text-sm text-[var(--color-text)]/40">Sin videos cargados todavía.</p>
      ) : (
        <div className="space-y-2">
          {media.map((m) => (
            <div key={m.id} className="flex items-start justify-between gap-2 border border-[var(--color-divider)] rounded-lg p-3">
              <div className="min-w-0">
                <a
                  href={m.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent-700)] hover:underline truncate"
                >
                  <Play size={13} strokeWidth={2.75} className="shrink-0" aria-hidden="true" />
                  {m.title || KIND_LABELS[m.kind]}
                </a>
                <p className="text-xs text-[var(--color-text)]/50">
                  {KIND_LABELS[m.kind]}
                  {m.owner_id === null ? " · compartido" : ""}
                </p>
                {m.notes && <p className="text-xs text-[var(--color-text)]/55 mt-1">{m.notes}</p>}
              </div>
              {canManage && (profile?.id === m.owner_id || isAdmin(profile)) && (
                <button
                  onClick={() => removeMedia(m.id)}
                  className="shrink-0 text-[var(--color-text)]/30 hover:text-red-500"
                  aria-label="Borrar video"
                >
                  <Trash2 size={14} strokeWidth={2.5} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div className="space-y-3 pt-3 border-t border-[var(--color-divider)]">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <Select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as ExerciseMediaKind })}>
                {EXERCISE_MEDIA_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Título (opcional)">
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ej: Cue de cadera" />
            </Field>
          </div>
          <Field label="URL (YouTube, Vimeo...)">
            <Input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="Notas (opcional)">
            <Textarea rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </Field>
          {isAdmin(profile) && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.shared} onChange={(e) => setDraft({ ...draft, shared: e.target.checked })} />
              Compartido (visible para todos los entrenadores)
            </label>
          )}
          <Button onClick={addMedia} disabled={saving || !draft.url.trim()} className="w-full justify-center">
            <Plus size={14} strokeWidth={2.75} aria-hidden="true" /> {saving ? "Agregando..." : "Agregar video"}
          </Button>
        </div>
      )}
    </div>
  );
}
