"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useAthlete } from "./AthleteProvider";
import { useProfile } from "./ProfileProvider";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  entrenador: "Entrenador",
  escalador: "Escalador",
};

/** A partir de esta cantidad de atletas, el buscador dentro del desplegable se justifica. */
const SEARCH_THRESHOLD = 6;

export function AthleteSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { athletes, athlete, athleteId, setAthleteId } = useAthlete();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const canSwitch = athletes.length > 1;
  const showSearch = athletes.length > SEARCH_THRESHOLD;
  const initial = (profile?.full_name || profile?.email || "?").trim().charAt(0).toUpperCase();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return athletes;
    return athletes.filter((a) => a.name.toLowerCase().includes(q));
  }, [athletes, query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative px-3 pt-3 pb-2">
      {open && canSwitch && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} aria-hidden="true" />
          <div className="absolute left-3 right-3 top-[calc(100%-4px)] bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-organic-md)] py-1 z-20">
            {showSearch && (
              <div className="px-2 pb-1.5 mb-1 border-b border-[var(--color-divider)]">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--color-bg)]">
                  <Search size={13} strokeWidth={2.5} className="text-[var(--color-text)]/40 shrink-0" aria-hidden="true" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar atleta..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            )}
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-[var(--color-text)]/50">Sin resultados</p>
              ) : (
                filtered.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setAthleteId(a.id);
                      close();
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--color-text)]/[0.06] ${
                      a.id === athleteId ? "font-medium text-[var(--color-accent-700)]" : ""
                    }`}
                  >
                    {a.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
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
