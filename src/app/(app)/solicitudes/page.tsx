"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RequireRole, useProfile, isAdmin } from "@/components/ProfileProvider";
import { Card, Button, Badge, Spinner, EmptyState } from "@/components/ui";
import type { CoachRequest, Profile } from "@/lib/types";

export default function SolicitudesPage() {
  return (
    <RequireRole roles={["entrenador", "admin"]}>
      <SolicitudesPanel />
    </RequireRole>
  );
}

type RequestRow = CoachRequest & { coachName: string };

function SolicitudesPanel() {
  const { profile } = useProfile();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!profile) return;
    setLoading(true);
    const supabase = createClient();
    let query = supabase.from("coach_requests").select("*").eq("status", "pending").order("created_at");
    if (!isAdmin(profile)) query = query.eq("coach_id", profile.id);
    const { data } = await query;
    const rows = (data as CoachRequest[]) ?? [];

    const coachIds = Array.from(new Set(rows.map((r) => r.coach_id)));
    const { data: coachProfiles } = coachIds.length
      ? await supabase.from("profiles").select("id, full_name").in("id", coachIds)
      : { data: [] as Pick<Profile, "id" | "full_name">[] };
    const coachNameById = new Map((coachProfiles ?? []).map((c) => [c.id, c.full_name || "Entrenador"]));

    setRequests(rows.map((r) => ({ ...r, coachName: coachNameById.get(r.coach_id) ?? "Entrenador" })));
    setLoading(false);
  }

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch al cargar el perfil
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  async function accept(id: string) {
    setError(null);
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.rpc("accept_coach_request", { request_id: id });
    setBusyId(null);
    if (error) {
      setError(error.message);
      return;
    }
    load();
  }

  async function decline(id: string) {
    setError(null);
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("coach_requests")
      .update({ status: "declined", resolved_at: new Date().toISOString() })
      .eq("id", id);
    setBusyId(null);
    if (error) {
      setError(error.message);
      return;
    }
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Solicitudes</h1>
      <p className="text-sm text-[var(--color-text)]/55 mb-6">
        Escaladores nuevos que pidieron entrevista {isAdmin(profile) ? "a cualquier entrenador" : "para entrenar con vos"}.
      </p>

      {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

      {requests.length === 0 ? (
        <EmptyState text="No hay solicitudes pendientes." />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{r.athlete_name}</p>
                  {isAdmin(profile) && (
                    <p className="text-xs text-[var(--color-text)]/50 mt-0.5">
                      Para <Badge>{r.coachName}</Badge>
                    </p>
                  )}
                  {r.message && <p className="text-sm text-[var(--color-text)]/70 mt-2">{r.message}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" onClick={() => decline(r.id)} disabled={busyId === r.id}>
                    Rechazar
                  </Button>
                  <Button onClick={() => accept(r.id)} disabled={busyId === r.id}>
                    {busyId === r.id ? "..." : "Aceptar"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
