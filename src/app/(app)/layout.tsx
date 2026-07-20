"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProfileProvider, useProfile } from "@/components/ProfileProvider";
import { AthleteProvider } from "@/components/AthleteProvider";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { EvaluationForm } from "@/components/EvaluationForm";
import { Spinner, Card } from "@/components/ui";

function CompleteEvaluationGate({ onDone }: { onDone: () => void }) {
  return (
    <div className="min-h-screen px-4 py-10 flex justify-center">
      <div className="w-full max-w-2xl">
        <Card className="mb-6">
          <p className="font-medium mb-1">Antes de planificar, completa tu evaluación física</p>
          <p className="text-sm text-[var(--color-text)]/55">
            Nos da una línea base para armar tu plan desde el catálogo. Vas a poder completarla de nuevo más adelante.
          </p>
        </Card>
        <EvaluationForm isOnboardingGate onOnboardingComplete={onDone} />
      </div>
    </div>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const { profile, loading, refresh } = useProfile();
  const pathname = usePathname();
  const needsEvalGate = !!profile && profile.role === "escalador" && profile.onboarded_via_free && !!profile.athlete_id;
  const [evalCount, setEvalCount] = useState<number | null>(null);

  useEffect(() => {
    if (!needsEvalGate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetea el gate si deja de aplicar
      setEvalCount(null);
      return;
    }
    (async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from("evaluations")
        .select("id", { count: "exact", head: true })
        .eq("athlete_id", profile!.athlete_id!);
      setEvalCount(count ?? 0);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsEvalGate, profile?.athlete_id, pathname]);

  if (loading || !profile) return <Spinner />;
  if (!profile.role) return <OnboardingScreen profile={profile} onDone={refresh} />;

  if (needsEvalGate) {
    if (evalCount === null) return <Spinner />;
    if (evalCount === 0) {
      return (
        <AthleteProvider>
          <CompleteEvaluationGate onDone={() => setEvalCount((c) => (c ?? 0) + 1)} />
        </AthleteProvider>
      );
    }
  }

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
