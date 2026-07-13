"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/components/ProfileProvider";
import { Card, Button, Badge, Spinner, EmptyState } from "@/components/ui";
import type { FormTemplate } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = { evaluation: "Evaluacion", checkin: "Check-in" };

export default function FormTemplatesPage() {
  const { profile } = useProfile();
  const canCreate = profile?.role === "admin" || profile?.role === "entrenador";
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.from("form_templates").select("*").order("created_at", { ascending: false });
      setTemplates((data as FormTemplate[]) ?? []);
      setLoading(false);
    })();
  }, []);

  function canEdit(t: FormTemplate) {
    return profile?.role === "admin" || (profile?.role === "entrenador" && t.created_by === profile.id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Plantillas de formulario</h1>
        {canCreate && (
          <Link href="/formularios/new">
            <Button>+ Nueva plantilla</Button>
          </Link>
        )}
      </div>
      <p className="text-sm text-neutral-500 mb-6">
        El formulario por defecto de Evaluacion y Check-in (con el protocolo Tindeq, PAR-Q, etc.) sigue siempre
        disponible. Estas son plantillas adicionales para casos especificos: lesiones, otra disciplina, o cualquier
        informacion extra que le interese registrar a un entrenador.
      </p>

      {loading ? (
        <Spinner />
      ) : templates.length === 0 ? (
        <EmptyState text="No hay plantillas personalizadas todavia." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <Card key={t.id}>
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium">{t.name}</p>
                <Badge tone="orange">{TYPE_LABELS[t.type]}</Badge>
              </div>
              {t.description && <p className="text-sm text-neutral-500 mb-3">{t.description}</p>}
              <div className="flex gap-2">
                <Link href={`/formularios/${t.id}/usar`}>
                  <Button variant="secondary">Usar</Button>
                </Link>
                {canEdit(t) && (
                  <Link href={`/formularios/${t.id}`}>
                    <Button variant="secondary">Editar</Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
