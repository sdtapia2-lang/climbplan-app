"use client";

import { useState } from "react";
import { RequireRole } from "@/components/ProfileProvider";
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
  const [athleteName, setAthleteName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(randomPassword());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; password: string; athleteName: string } | null>(null);

  async function submit() {
    setError(null);
    setSaving(true);
    // La sesion viaja como cookie httpOnly en el mismo origen; el Route
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
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-2">Invitar escalador</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Crea una cuenta que vos administras: el escalador solo va a ver los planes y formularios que vos le crees,
        y no va a poder agregar ni modificar ejercicios de su planificacion (solo registrar lo que hizo).
      </p>

      <Card className="space-y-4">
        <Field label="Nombre del escalador">
          <Input value={athleteName} onChange={(e) => setAthleteName(e.target.value)} placeholder="Ej: Diego" />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@ejemplo.com" />
        </Field>
        <Field label="Contrasena (se la compartis vos, no se envia mail)">
          <div className="flex gap-2">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button variant="secondary" onClick={() => setPassword(randomPassword())}>
              Generar
            </Button>
          </div>
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button onClick={submit} disabled={saving} className="w-full justify-center">
          {saving ? "Creando..." : "Crear cuenta"}
        </Button>
      </Card>

      {result && (
        <Card className="mt-6 border-green-300">
          <p className="font-medium mb-2">Cuenta creada para {result.athleteName}</p>
          <p className="text-sm text-neutral-500 mb-3">
            Compartile estos datos por el medio que prefieras (no se envio ningun email automatico):
          </p>
          <div className="text-sm font-mono bg-neutral-50 rounded-md p-3 space-y-1">
            <p>Email: {result.email}</p>
            <p>Contrasena: {result.password}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
