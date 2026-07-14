"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "./AthleteProvider";
import { useProfile, isAdmin, canCreateMesocycles } from "./ProfileProvider";

const TABS = [
  { href: "/", label: "Dashboard" },
  { href: "/plantillas", label: "Planes" },
  { href: "/mesociclo", label: "Mesociclo" },
  { href: "/entrenamiento", label: "Entrenamiento" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/evaluacion", label: "Evaluacion" },
  { href: "/checkin", label: "Check-in" },
  { href: "/formularios", label: "Formularios" },
  { href: "/analitica", label: "Analitica" },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  entrenador: "Entrenador",
  escalador: "Escalador",
};

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { athletes, athlete, setAthleteId } = useAthlete();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const canSwitch = athletes.length > 1;
  const initial = (profile?.full_name || profile?.email || "?").trim().charAt(0).toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const tabs = [
    ...TABS,
    ...(canCreateMesocycles(profile) ? [{ href: "/escaladores/nuevo", label: "Invitar" }] : []),
    ...(isAdmin(profile) ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="bg-[var(--color-surface)] sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Image
            src="/prusik-logo.png"
            alt="Prusik"
            width={30}
            height={30}
            unoptimized
            className="rounded-[10px] object-cover shadow-[var(--shadow-organic-sm)]"
          />
          <span className="font-[family-name:var(--font-heading)] text-[18px]">Prusik</span>
        </div>

        <div className="flex-1 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[var(--color-accent-200)] text-[var(--color-accent-800)] font-semibold"
                    : "text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="relative flex items-center gap-3 shrink-0">
          <button
            onClick={() => canSwitch && setOpen((o) => !o)}
            className={`flex items-center gap-1 text-sm text-[var(--color-text)]/80 ${
              canSwitch ? "hover:text-[var(--color-text)]" : "cursor-default"
            }`}
          >
            {athlete?.name ?? "Sin atletas"}
            {canSwitch && <span className="text-xs text-[var(--color-text)]/50">v</span>}
          </button>
          {open && canSwitch && (
            <div className="absolute right-16 top-8 bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-organic-md)] min-w-[140px] py-1 z-20">
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

          {profile?.role && (
            <span className="text-xs text-[var(--color-text)]/55 hidden sm:inline">{ROLE_LABELS[profile.role]}</span>
          )}

          <div
            className="w-8 h-8 rounded-full bg-[var(--color-accent-300)] text-[var(--color-accent-800)] flex items-center justify-center text-sm font-semibold"
            title={profile?.full_name || profile?.email || ""}
          >
            {initial}
          </div>

          <button
            onClick={handleLogout}
            title="Cerrar sesion"
            className="text-[var(--color-text)]/50 hover:text-[var(--color-text)] px-1"
          >
            &#x21aa;
          </button>
        </div>
      </div>
    </div>
  );
}
