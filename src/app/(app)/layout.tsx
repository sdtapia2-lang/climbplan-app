"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProfileProvider, useProfile } from "@/components/ProfileProvider";
import { AthleteProvider } from "@/components/AthleteProvider";
import { NavBar } from "@/components/NavBar";
import { Spinner, Button, Card } from "@/components/ui";

function PendingScreen({ email }: { email: string | null }) {
  const router = useRouter();
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-sm text-center">
        <p className="font-medium mb-2">Cuenta creada</p>
        <p className="text-sm text-[var(--color-text)]/55 mb-4">
          {email ? <span className="font-mono">{email}</span> : "Tu cuenta"} todavia no tiene un rol
          asignado. Pedile a un administrador que te asigne un rol (Admin, Entrenador o Escalador)
          desde el panel de administracion.
        </p>
        <Button variant="secondary" onClick={handleLogout}>
          Cerrar sesion
        </Button>
      </Card>
    </div>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfile();

  if (loading) return <Spinner />;
  if (!profile || !profile.role) return <PendingScreen email={profile?.email ?? null} />;

  return (
    <AthleteProvider>
      <NavBar />
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1">{children}</main>
    </AthleteProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <Gate>{children}</Gate>
    </ProfileProvider>
  );
}
