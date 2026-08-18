"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RequireRole, useProfile, canAddAthlete, isCoach } from "@/components/ProfileProvider";
import { Card, Field, Input, Button } from "@/components/ui";

function randomPassword() {
  return Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6);
}

export default function NewRestrictedAthletePage() {
  return (
    <RequireRole roles={["admin", "entrenador"]}>
      <InviteForm />
    </RequireRole>
  );
}

function InviteForm() {
  const { profile } = useProfile();
  const [athleteName, setAthleteName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(randomPassword());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; password: string; athleteName: string } | null>(null);
  const [quota, setQuota] = useState<{ count: number; max: number | null } | null>(null);

  async function loadQuota() {
    if (!profile?.id || !isCoach(profile)) return;
    const supabase = createClient();
    const [{ data: max }, { data: count }] = await Promise.all([
      supabase.rpc("coach_max_athletes", { p_coach_id: profile.id }),
      supabase.rpc("coach_athlete_count", { p_coach_id: profile.id }),
    ]);
    setQuota({ count: count ?? 0, max: max ?? null });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar/cambiar de perfil
    loadQuota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const atQuota = quota !== null && !canAddAthlete(profile, quota.count, quota.max);

  async function submit() {
    setError(null);
    setSaving(true);
    // La sesión viaja como cookie httpOnly en el mismo origen; el Route
    // Handler la lee con el cliente server-side (@/lib/supabase/server).
    const res = await fetch("/api/create-athlete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteName, email, password }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la cuenta.");
      return;
    }
    setResult({ email, password, athleteName });
    setAthleteName("");
    setEmail("");
    setPassword(randomPassword());
    loadQuota();
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-2">Invitar escalador</h1>
      <p className="text-sm text-[var(--color-text)]/55 mb-2">
        Crea una cuenta que tú administras: el escalador solo va a ver los planes y formularios que le creas,
        y no va a poder agregar ni modificar ejercicios de su planificación (solo registrar lo que hizo).
      </p>
      {quota && (
        <p className="text-xs text-[var(--color-text)]/55 mb-6">
          Cupo de tu plan: {quota.count}
          {quota.max !== null ? ` / ${quota.max}` : ""} {quota.max !== null ? "atletas" : "atletas (sin tope)"}
        </p>
      )}

      <Card className="space-y-4">
        {atQuota && (
          <p className="text-sm text-red-600">
            Llegaste al cupo de tu plan ({quota?.max} atletas). Pídele a un admin que te asigne un plan con más cupo.
          </p>
        )}
        <Field label="Nombre del escalador">
          <Input value={athleteName} onChange={(e) => setAthleteName(e.target.value)} placeholder="Ej: Diego" disabled={atQuota} />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@ejemplo.com"
            disabled={atQuota}
          />
        </Field>
        <Field label="Contraseña (se la compartes tú, no se envía mail)">
          <div className="flex gap-2">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} disabled={atQuota} />
            <Button variant="secondary" onClick={() => setPassword(randomPassword())} disabled={atQuota}>
              Generar
            </Button>
          </div>
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button onClick={submit} disabled={saving || atQuota} className="w-full justify-center">
          {saving ? "Creando..." : "Crear cuenta"}
        </Button>
      </Card>

      {result && (
        <Card className="mt-6 border-green-300">
          <p className="font-medium mb-2">Cuenta creada para {result.athleteName}</p>
          <p className="text-sm text-[var(--color-text)]/55 mb-3">
            Comparte estos datos por el medio que prefieras (no se envió ningún email automático):
          </p>
          <div className="text-sm font-mono bg-[var(--color-neutral-100)] rounded-md p-3 space-y-1">
            <p>Email: {result.email}</p>
            <p>Contraseña: {result.password}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
