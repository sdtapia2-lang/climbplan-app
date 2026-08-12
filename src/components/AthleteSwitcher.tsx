"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAthlete } from "./AthleteProvider";
import { useProfile } from "./ProfileProvider";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  entrenador: "Entrenador",
  escalador: "Escalador",
};

export function AthleteSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { athletes, athlete, setAthleteId } = useAthlete();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const canSwitch = athletes.length > 1;
  const initial = (profile?.full_name || profile?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative px-3 pt-3 pb-2">
      {open && canSwitch && (
        <div className="absolute left-3 top-[calc(100%-4px)] bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-organic-md)] min-w-[160px] py-1 z-20">
          {athletes.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setAthleteId(a.id);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--color-text)]/[0.06]"
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => canSwitch && setOpen((o) => !o)}
        className={`flex items-center gap-2 w-full rounded-2xl bg-[var(--color-bg)] px-2 py-1.5 ${collapsed ? "justify-center" : ""}`}
      >
        <div
          className="w-8 h-8 rounded-full bg-[var(--color-accent-300)] text-[var(--color-accent-800)] flex items-center justify-center text-sm font-semibold shrink-0"
          title={profile?.full_name || profile?.email || ""}
        >
          {initial}
        </div>
        {!collapsed && (
          <div className="text-left overflow-hidden">
            <p className="text-sm truncate flex items-center gap-1">
              {athlete?.name ?? "Sin atletas"}
              {canSwitch && <ChevronDown size={12} strokeWidth={2.75} className="text-[var(--color-text)]/50 shrink-0" aria-hidden="true" />}
            </p>
            {profile?.role && <p className="text-xs text-[var(--color-text)]/55">{ROLE_LABELS[profile.role]}</p>}
          </div>
        )}
      </button>
    </div>
  );
}
