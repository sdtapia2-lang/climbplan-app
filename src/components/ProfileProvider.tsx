"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Role } from "@/lib/types";
import { Spinner } from "./ui";

type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile((data as Profile) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
    load();
  }, [load]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refresh: load }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile debe usarse dentro de ProfileProvider");
  return ctx;
}

export function isAdmin(profile: Profile | null) {
  return profile?.role === "admin";
}
export function isCoach(profile: Profile | null) {
  return profile?.role === "entrenador";
}
export function isAthleteRole(profile: Profile | null) {
  return profile?.role === "escalador";
}
export function canManageCatalog(profile: Profile | null) {
  return isAdmin(profile);
}
export function canCreateMesocycles(profile: Profile | null) {
  return isAdmin(profile) || isCoach(profile);
}

/** Redirige si el rol actual no esta en la lista permitida. Usar dentro de una pagina. */
export function RequireRole({
  roles,
  redirectTo = "/",
  children,
}: {
  roles: Role[];
  redirectTo?: string;
  children: React.ReactNode;
}) {
  const { profile, loading } = useProfile();
  const router = useRouter();
  const allowed = profile?.role && roles.includes(profile.role);

  useEffect(() => {
    if (!loading && !allowed) router.replace(redirectTo);
  }, [loading, allowed, router, redirectTo]);

  if (loading || !allowed) return <Spinner />;
  return <>{children}</>;
}
