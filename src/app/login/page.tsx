"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Field, Input, Button } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (mode === "signup") {
      setError("Cuenta creada. Si tu proyecto Supabase pide confirmacion por email, revisa tu correo antes de entrar.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm bg-[var(--color-surface)] rounded-[32px] p-8 shadow-[var(--shadow-organic-md)]">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/prusik-logo.png"
            alt="Prusik"
            width={44}
            height={44}
            unoptimized
            className="rounded-[16px] object-cover shadow-[var(--shadow-organic-sm)]"
          />
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl m-0">Prusik</h1>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text)]/70 mb-6">Tu cordada perfecta para progresar.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Contrasena">
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? "Un momento..." : mode === "signin" ? "Entrar" : "Crear cuenta"}
          </Button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-center text-xs text-[var(--color-text)]/60 mt-4 hover:underline"
        >
          {mode === "signin"
            ? "Primera vez? Crear una cuenta"
            : "Ya tengo cuenta, iniciar sesion"}
        </button>
      </div>
    </div>
  );
}
