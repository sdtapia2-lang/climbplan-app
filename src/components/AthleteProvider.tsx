"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Athlete } from "@/lib/types";

type AthleteContextValue = {
  athletes: Athlete[];
  athlete: Athlete | null;
  athleteId: string | null;
  loading: boolean;
  setAthleteId: (id: string) => void;
  refresh: () => Promise<void>;
};

const AthleteContext = createContext<AthleteContextValue | null>(null);

const STORAGE_KEY = "climbplan.athleteId";

export function AthleteProvider({ children }: { children: React.ReactNode }) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [athleteId, setAthleteIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    // RLS filtra automaticamente segun el rol: admin ve todos, entrenador solo
    // sus asignados (coach_athletes), escalador solo el suyo (profiles.athlete_id).
    const { data } = await supabase.from("athletes").select("*").order("name");
    const list = (data ?? []) as Athlete[];
    setAthletes(list);

    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const validStored = stored && list.some((a) => a.id === stored) ? stored : null;
    setAthleteIdState(validStored ?? list[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
    load();
  }, [load]);

  function setAthleteId(id: string) {
    setAthleteIdState(id);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
  }

  const athlete = athletes.find((a) => a.id === athleteId) ?? null;

  return (
    <AthleteContext.Provider
      value={{ athletes, athlete, athleteId, loading, setAthleteId, refresh: load }}
    >
      {children}
    </AthleteContext.Provider>
  );
}

export function useAthlete() {
  const ctx = useContext(AthleteContext);
  if (!ctx) throw new Error("useAthlete debe usarse dentro de AthleteProvider");
  return ctx;
}
