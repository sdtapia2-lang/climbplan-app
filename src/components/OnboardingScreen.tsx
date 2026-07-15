"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Field, Input, Textarea, Button, Spinner, EmptyState } from "./ui";
import type { CoachRequest, Profile } from "@/lib/types";
import { Compass, Dumbbell } from "lucide-react";

type Step = "loading" | "choose" | "directory" | "request-form" | "request-sent";

export function OnboardingScreen({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [coaches, setCoaches] = useState<Profile[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Profile | null>(null);
  const [sentToCoachName, setSentToCoachName] = useState<string>("");
  const [athleteName, setAthleteName] = useState(profile.full_name ?? "");
  const [message, setMessage] = useState("");
  const [declinedByCoachName, setDeclinedByCoachName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("coach_requests")
        .select("*")
        .eq("requester_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const req = existing as CoachRequest | null;

      if (req && req.status === "pending") {
        const { data: coach } = await supabase.from("profiles").select("full_name").eq("id", req.coach_id).maybeSingle();
        setSentToCoachName(coach?.full_name || "tu entrenador");
        setStep("request-sent");
        return;
      }

      if (req && req.status === "declined") {
        const { data: coach } = await supabase.from("profiles").select("full_name").eq("id", req.coach_id).maybeSingle();
        setDeclinedByCoachName(coach?.full_name || "el entrenador");
      }

      setStep("choose");
    })();
  }, [profile.id]);

  async function handleFreeTraining() {
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("start_free_training", { athlete_name: athleteName || profile.full_name || "Escalador" });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onDone();
  }

  async function loadDirectory() {
    setError(null);
    setStep("directory");
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["entrenador", "admin"])
      .eq("public_profile", true)
      .order("full_name");
    setCoaches((data as Profile[]) ?? []);
  }

  function chooseCoach(coach: Profile) {
    setSelectedCoach(coach);
    setAthleteName(profile.full_name ?? "");
    setMessage("");
    setStep("request-form");
  }

  async function sendRequest() {
    if (!selectedCoach) return;
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("coach_requests").insert({
      requester_id: profile.id,
      coach_id: selectedCoach.id,
      athlete_name: athleteName.trim() || profile.full_name || "Escalador",
      message: message.trim() || null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSentToCoachName(selectedCoach.full_name || "tu entrenador");
    setStep("request-sent");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (step === "loading") return <Spinner />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {step === "choose" && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="font-[family-name:var(--font-heading)] text-2xl">Bienvenido a Prusik</p>
              <p className="text-sm text-[var(--color-text)]/55 mt-1">Elegi como queres empezar a entrenar.</p>
            </div>

            {declinedByCoachName && (
              <p className="text-sm text-center text-[var(--color-text)]/60 bg-[var(--color-neutral-100)] rounded-2xl px-4 py-2">
                {declinedByCoachName} no pudo tomarte por ahora. Podes elegir otro entrenador o arrancar con entrenamiento libre.
              </p>
            )}

            <Card>
              <Dumbbell size={20} strokeWidth={2.75} className="text-[var(--color-accent-500)] mb-2" aria-hidden="true" />
              <p className="font-medium mb-1">Entrenamiento libre</p>
              <p className="text-sm text-[var(--color-text)]/55 mb-4">
                Armas tu propio plan desde el catalogo de ejercicios, sin depender de nadie.
              </p>
              <Button onClick={handleFreeTraining} disabled={saving} className="w-full justify-center">
                {saving ? "Un momento..." : "Empezar"}
              </Button>
            </Card>

            <Card>
              <Compass size={20} strokeWidth={2.75} className="text-[var(--color-accent-500)] mb-2" aria-hidden="true" />
              <p className="font-medium mb-1">Buscar entrenador</p>
              <p className="text-sm text-[var(--color-text)]/55 mb-4">
                Elegi un entrenador del directorio y pedile una entrevista.
              </p>
              <Button variant="secondary" onClick={loadDirectory} className="w-full justify-center">
                Ver entrenadores
              </Button>
            </Card>

            {error && <p className="text-sm text-red-700 text-center">{error}</p>}

            <button onClick={handleLogout} className="w-full text-center text-xs text-[var(--color-text)]/50 hover:underline">
              Cerrar sesion
            </button>
          </div>
        )}

        {step === "directory" && (
          <Card>
            <button onClick={() => setStep("choose")} className="text-xs text-[var(--color-text)]/50 hover:underline mb-4">
              &larr; Volver
            </button>
            <p className="font-medium mb-4">Entrenadores disponibles</p>
            {coaches.length === 0 ? (
              <EmptyState text="Todavia no hay entrenadores con perfil publico." />
            ) : (
              <div className="space-y-2">
                {coaches.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => chooseCoach(c)}
                    className="w-full text-left border border-[var(--color-divider)] rounded-2xl p-3 hover:bg-[var(--color-text)]/[0.04]"
                  >
                    <p className="font-medium text-sm">{c.full_name || "Entrenador"}</p>
                    {c.bio && <p className="text-xs text-[var(--color-text)]/55 line-clamp-2 mt-0.5">{c.bio}</p>}
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        {step === "request-form" && selectedCoach && (
          <Card>
            <button onClick={() => setStep("directory")} className="text-xs text-[var(--color-text)]/50 hover:underline mb-4">
              &larr; Volver
            </button>
            <p className="font-medium mb-1">Solicitar entrevista</p>
            <p className="text-sm text-[var(--color-text)]/55 mb-4">A {selectedCoach.full_name || "este entrenador"}</p>
            <div className="space-y-4">
              <Field label="Como queres que te identifique">
                <Input value={athleteName} onChange={(e) => setAthleteName(e.target.value)} placeholder="Tu nombre" />
              </Field>
              <Field label="Mensaje (opcional)">
                <Textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Contale brevemente tu objetivo o disponibilidad..."
                />
              </Field>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <Button onClick={sendRequest} disabled={saving} className="w-full justify-center">
                {saving ? "Enviando..." : "Enviar solicitud"}
              </Button>
            </div>
          </Card>
        )}

        {step === "request-sent" && (
          <Card className="text-center">
            <p className="font-medium mb-2">Solicitud enviada</p>
            <p className="text-sm text-[var(--color-text)]/55 mb-4">
              Le pedimos una entrevista a <span className="font-medium">{sentToCoachName}</span>. Te vamos a avisar
              cuando la acepte.
            </p>
            <Button variant="secondary" onClick={handleLogout} className="w-full justify-center">
              Cerrar sesion
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
