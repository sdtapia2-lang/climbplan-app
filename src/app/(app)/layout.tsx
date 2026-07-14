"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProfileProvider, useProfile } from "@/components/ProfileProvider";
import { AthleteProvider } from "@/components/AthleteProvider";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
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
      <div className="flex flex-1 min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-x-hidden px-4 md:px-6 py-6 pb-24 md:pb-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
      <MobileNav />
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
