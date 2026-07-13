"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RequireRole } from "@/components/ProfileProvider";
import { Card, Input, Select, Button, Spinner, Badge } from "@/components/ui";
import { ROLES, type Athlete, type CoachAthlete, type Profile, type Role } from "@/lib/types";

export default function AdminPage() {
  return (
    <RequireRole roles={["admin"]}>
      <AdminPanel />
    </RequireRole>
  );
}

function AdminPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [coachAthletes, setCoachAthletes] = useState<CoachAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAthleteName, setNewAthleteName] = useState("");
  const [newAssignCoach, setNewAssignCoach] = useState("");
  const [newAssignAthlete, setNewAssignAthlete] = useState("");

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [{ data: p }, { data: a }, { data: ca }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("athletes").select("*").order("name"),
      supabase.from("coach_athletes").select("*"),
    ]);
    setProfiles((p as Profile[]) ?? []);
    setAthletes((a as Athlete[]) ?? []);
    setCoachAthletes((ca as CoachAthlete[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
    load();
  }, []);

  async function updateProfile(id: string, patch: Partial<Profile>) {
    const supabase = createClient();
    await supabase.from("profiles").update(patch).eq("id", id);
    load();
  }

  async function createAthlete() {
    if (!newAthleteName.trim()) return;
    const supabase = createClient();
    await supabase.from("athletes").insert({ name: newAthleteName.trim() });
    setNewAthleteName("");
    load();
  }

  async function addAssignment() {
    if (!newAssignCoach || !newAssignAthlete) return;
    const supabase = createClient();
    await supabase.from("coach_athletes").insert({ coach_id: newAssignCoach, athlete_id: newAssignAthlete });
    setNewAssignCoach("");
    setNewAssignAthlete("");
    load();
  }

  async function removeAssignment(id: string) {
    const supabase = createClient();
    await supabase.from("coach_athletes").delete().eq("id", id);
    load();
  }

  if (loading) return <Spinner />;

  const athleteName = (id: string | null) => athletes.find((a) => a.id === id)?.name ?? "-";
  const profileLabel = (id: string) => {
    const p = profiles.find((pr) => pr.id === id);
    return p?.full_name || p?.email || id;
  };
  const coaches = profiles.filter((p) => p.role === "entrenador" || p.role === "admin");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Administracion</h1>

      <Card>
        <h2 className="font-medium mb-4">Usuarios y roles</h2>
        <div className="space-y-3">
          {profiles.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 border border-neutral-200 rounded-lg p-3">
              <div className="min-w-[180px]">
                <p className="text-sm font-medium">{p.full_name || p.email || p.id}</p>
                <p className="text-xs text-neutral-400">{p.email}</p>
              </div>
              <Select
                value={p.role ?? ""}
                onChange={(e) => updateProfile(p.id, { role: (e.target.value || null) as Role | null })}
                className="w-auto"
              >
                <option value="">Sin rol (pendiente)</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
              {p.role === "escalador" && (
                <Select
                  value={p.athlete_id ?? ""}
                  onChange={(e) => updateProfile(p.id, { athlete_id: e.target.value || null })}
                  className="w-auto"
                >
                  <option value="">Sin atleta vinculado</option>
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              )}
              {p.role === "escalador" && p.athlete_id && <Badge tone="green">{athleteName(p.athlete_id)}</Badge>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Atletas</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {athletes.map((a) => (
            <Badge key={a.id}>{a.name}</Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nombre del nuevo atleta..."
            value={newAthleteName}
            onChange={(e) => setNewAthleteName(e.target.value)}
          />
          <Button onClick={createAthlete}>Crear atleta</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Asignaciones entrenador &rarr; escalador</h2>
        <div className="space-y-2 mb-4">
          {coachAthletes.length === 0 && <p className="text-sm text-neutral-400">Sin asignaciones todavia.</p>}
          {coachAthletes.map((ca) => (
            <div key={ca.id} className="flex items-center justify-between border border-neutral-200 rounded-lg p-3 text-sm">
              <span>
                {profileLabel(ca.coach_id)} &rarr; {athleteName(ca.athlete_id)}
              </span>
              <Button variant="danger" onClick={() => removeAssignment(ca.id)}>
                Quitar
              </Button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={newAssignCoach} onChange={(e) => setNewAssignCoach(e.target.value)} className="w-auto">
            <option value="">Entrenador...</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name || c.email}
              </option>
            ))}
          </Select>
          <Select value={newAssignAthlete} onChange={(e) => setNewAssignAthlete(e.target.value)} className="w-auto">
            <option value="">Atleta...</option>
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Button onClick={addAssignment}>Agregar asignacion</Button>
        </div>
      </Card>
    </div>
  );
}
