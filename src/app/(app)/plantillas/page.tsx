"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { useProfile, isAdmin, canCreateMesocycles } from "@/components/ProfileProvider";
import { Card, Button, Badge, Spinner, EmptyState, Modal, Field, Input } from "@/components/ui";
import type { TemplateMesocycle } from "@/lib/types";

export default function TemplatesPage() {
  const { athlete, athleteId } = useAthlete();
  const { profile } = useProfile();
  const router = useRouter();
  const admin = isAdmin(profile);
  const canCreate = canCreateMesocycles(profile);
  const canEdit = (t: TemplateMesocycle) => admin || (profile?.role === "entrenador" && t.created_by === profile.id);
  const [templates, setTemplates] = useState<TemplateMesocycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<TemplateMesocycle | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("template_mesocycles").select("*").order("created_at", { ascending: false });
    setTemplates((data as TemplateMesocycle[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
    load();
  }, []);

  async function confirmApply() {
    if (!applying || !athleteId) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("apply_mesocycle_template", {
      p_template_id: applying.id,
      p_athlete_id: athleteId,
      p_start_date: startDate,
    });
    setSaving(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setApplying(null);
    if (admin || profile?.role === "entrenador") {
      router.push(`/mesociclo/${data}`);
    } else {
      router.push("/mesociclo");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Planes por defecto</h1>
        {canCreate && (
          <Link href="/plantillas/new">
            <Button>+ Nueva plantilla</Button>
          </Link>
        )}
      </div>
      <p className="text-sm text-[var(--color-text)]/55 mb-6">
        Plantillas de mesociclo listas para aplicar a {athlete?.name ?? "un atleta"}. Al aplicar una, se crea una
        copia editable con fecha de inicio propia.
      </p>

      {loading ? (
        <Spinner />
      ) : templates.length === 0 ? (
        <EmptyState text="No hay plantillas todavía." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <Card key={t.id}>
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium">{t.name}</p>
                <div className="flex gap-1">
                  {!t.is_published && <Badge tone="red">Privada</Badge>}
                  {t.phase && <Badge tone="orange">{t.phase}</Badge>}
                </div>
              </div>
              {t.description && <p className="text-sm text-[var(--color-text)]/55 mb-3">{t.description}</p>}
              <div className="flex gap-2">
                <Button onClick={() => { setApplying(t); setError(null); }} disabled={!athleteId}>
                  Aplicar a {athlete?.name ?? "..."}
                </Button>
                {canEdit(t) && (
                  <Link href={`/plantillas/${t.id}`}>
                    <Button variant="secondary">Editar</Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!applying} onClose={() => setApplying(null)} title={`Aplicar "${applying?.name ?? ""}"`}>
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text)]/55">
            Se va a crear un mesociclo nuevo para <strong>{athlete?.name}</strong> a partir de esta plantilla.
          </p>
          <Field label="Fecha de inicio">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={confirmApply} disabled={saving} className="w-full justify-center">
            {saving ? "Aplicando..." : "Confirmar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
