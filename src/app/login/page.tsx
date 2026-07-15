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
  const [googleLoading, setGoogleLoading] = useState(false);
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

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // si no hay error, el navegador redirige a Google y esta pagina se abandona.
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

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-divider)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text)]/50">o</span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full justify-center gap-2"
        >
          <GoogleIcon />
          {googleLoading ? "Redirigiendo..." : "Continuar con Google"}
        </Button>

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

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
