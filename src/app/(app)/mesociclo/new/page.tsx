"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MesocycleEditor } from "@/components/MesocycleEditor";
import { useProfile, canManageOwnMesocycle } from "@/components/ProfileProvider";
import { Spinner } from "@/components/ui";

export default function NewMesocyclePage() {
  const { profile, loading } = useProfile();
  const router = useRouter();
  const allowed = canManageOwnMesocycle(profile);

  useEffect(() => {
    if (!loading && !allowed) router.replace("/mesociclo");
  }, [loading, allowed, router]);

  if (loading || !allowed) return <Spinner />;
  return <MesocycleEditor />;
}
