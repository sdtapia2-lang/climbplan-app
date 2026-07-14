"use client";

import Link from "next/link";
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
    <div className="border-b border-neutral-200 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
            C
          </div>
          <span className="font-semibold">ClimbPlan</span>
        </div>

        <div className="relative flex items-center gap-2">
          {profile?.role && (
            <span className="text-xs text-neutral-400 hidden sm:inline">{ROLE_LABELS[profile.role]}</span>
          )}
          <button
            onClick={() => canSwitch && setOpen((o) => !o)}
            className={`flex items-center gap-1 border border-neutral-300 rounded-md px-3 py-1.5 text-sm ${
              canSwitch ? "hover:bg-neutral-50" : "cursor-default"
            }`}
          >
            {athlete?.name ?? "Sin atletas"}
            {canSwitch && <span className="text-xs text-neutral-400">v</span>}
          </button>
          {open && canSwitch && (
            <div className="absolute right-10 top-9 bg-white border border-neutral-200 rounded-md shadow-md min-w-[140px] py-1">
              {athletes.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setAthleteId(a.id);
                    setOpen(false);
                  }}
                  className="block w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  {a.name}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Cerrar sesion"
            className="text-neutral-400 hover:text-neutral-700 px-1"
          >
            &#x21aa;
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-2 text-sm border-b-2 whitespace-nowrap ${
                active
                  ? "border-orange-500 text-orange-600 font-medium"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
