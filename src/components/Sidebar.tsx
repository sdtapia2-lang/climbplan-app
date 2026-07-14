"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "./AthleteProvider";
import { useProfile, isAdmin, canCreateMesocycles } from "./ProfileProvider";
import {
  LayoutDashboard,
  Layers,
  Calendar,
  Dumbbell,
  BookOpen,
  ClipboardCheck,
  Heart,
  FileText,
  BarChart3,
  UserPlus,
  ShieldCheck,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plantillas", label: "Planes", icon: Layers },
  { href: "/mesociclo", label: "Mesociclo", icon: Calendar },
  { href: "/entrenamiento", label: "Entrenamiento", icon: Dumbbell },
  { href: "/catalogo", label: "Catalogo", icon: BookOpen },
  { href: "/evaluacion", label: "Evaluacion", icon: ClipboardCheck },
  { href: "/checkin", label: "Check-in", icon: Heart },
  { href: "/formularios", label: "Formularios", icon: FileText },
  { href: "/analitica", label: "Analitica", icon: BarChart3 },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  entrenador: "Entrenador",
  escalador: "Escalador",
};

const STORAGE_KEY = "climbplan.sidebarCollapsed";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { athletes, athlete, setAthleteId } = useAthlete();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const canSwitch = athletes.length > 1;
  const initial = (profile?.full_name || profile?.email || "?").trim().charAt(0).toUpperCase();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee preferencia guardada al montar
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const items = [
    ...NAV_ITEMS,
    ...(canCreateMesocycles(profile) ? [{ href: "/escaladores/nuevo", label: "Invitar", icon: UserPlus }] : []),
    ...(isAdmin(profile) ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 bg-[var(--color-surface)] flex flex-col transition-[width] duration-150 ${
        collapsed ? "w-[68px]" : "w-[228px]"
      }`}
    >
      <div className={`flex items-center gap-2 p-3 ${collapsed ? "justify-center" : ""}`}>
        <Image
          src="/prusik-logo.png"
          alt="Prusik"
          width={30}
          height={30}
          unoptimized
          className="rounded-[10px] object-cover shadow-[var(--shadow-organic-sm)] shrink-0"
        />
        {!collapsed && <span className="font-[family-name:var(--font-heading)] text-[18px]">Prusik</span>}
      </div>

      <button
        onClick={toggleCollapsed}
        title={collapsed ? "Expandir menu" : "Colapsar menu"}
        aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
        className={`flex items-center gap-2 mx-3 mb-2 px-2 py-1.5 rounded-full text-[var(--color-text)]/50 hover:bg-[var(--color-text)]/[0.07] hover:text-[var(--color-text)] ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {collapsed ? (
          <ChevronsRight size={16} strokeWidth={2.75} aria-hidden="true" />
        ) : (
          <>
            <ChevronsLeft size={16} strokeWidth={2.75} aria-hidden="true" />
            <span className="text-xs">Colapsar</span>
          </>
        )}
      </button>

      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-[var(--color-accent-200)] text-[var(--color-accent-800)] font-semibold"
                  : "text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07]"
              }`}
            >
              <Icon size={17} strokeWidth={2.75} className="shrink-0" aria-hidden="true" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--color-divider)] relative">
        {open && canSwitch && (
          <div className="absolute left-3 bottom-[calc(100%+4px)] bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-organic-md)] min-w-[160px] py-1 z-20">
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
          className={`flex items-center gap-2 w-full mb-2 ${collapsed ? "justify-center" : ""}`}
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

        <button
          onClick={handleLogout}
          title="Cerrar sesion"
          aria-label="Cerrar sesion"
          className={`flex items-center gap-2 text-sm text-[var(--color-text)]/50 hover:text-[var(--color-text)] w-full ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={16} strokeWidth={2.75} aria-hidden="true" />
          {!collapsed && "Cerrar sesion"}
        </button>
      </div>
    </aside>
  );
}
