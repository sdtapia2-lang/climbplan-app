"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "./AthleteProvider";
import { useProfile, isAdmin, isCoach, isAthleteRole, canCreateMesocycles } from "./ProfileProvider";
import { AthleteSwitcher } from "./AthleteSwitcher";
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
  Compass,
  UserCog,
  Inbox,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };
type NavGroup = { label: string; items: NavItem[] };

const STORAGE_KEY = "climbplan.sidebarCollapsed";
const GROUPS_STORAGE_KEY = "climbplan.sidebarCollapsedGroups";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { athlete } = useAthlete();
  const { profile } = useProfile();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee preferencia guardada al montar
    if (stored === "1") setCollapsed(true);
    const storedGroups = typeof window !== "undefined" ? localStorage.getItem(GROUPS_STORAGE_KEY) : null;
    if (storedGroups) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- lee preferencia guardada al montar
        setCollapsedGroups(new Set(JSON.parse(storedGroups)));
      } catch {
        // ignora preferencia corrupta
      }
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      if (typeof window !== "undefined") localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const groups: NavGroup[] = [
    {
      label: "Planificación",
      items: [
        { href: "/mesociclo", label: "Mesociclo", icon: Calendar },
        { href: "/plantillas", label: "Planes", icon: Layers },
        { href: "/entrenamiento", label: "Entrenamiento", icon: Dumbbell },
        { href: "/catalogo", label: "Catálogo", icon: BookOpen },
      ],
    },
    {
      label: "Seguimiento",
      items: [
        { href: "/evaluacion", label: "Evaluación", icon: ClipboardCheck },
        { href: "/checkin", label: "Check-in", icon: Heart },
        { href: "/formularios", label: "Formularios", icon: FileText },
        ...(isCoach(profile) || isAdmin(profile)
          ? [{ href: "/analitica", label: "Analítica", icon: BarChart3 }]
          : []),
      ],
    },
    {
      label: "Personas",
      items: [
        { href: "/entrenadores", label: "Entrenadores", icon: Compass },
        ...(canCreateMesocycles(profile) ? [{ href: "/escaladores/nuevo", label: "Invitar", icon: UserPlus }] : []),
        ...(isCoach(profile) || isAdmin(profile) ? [{ href: "/solicitudes", label: "Solicitudes", icon: Inbox }] : []),
        ...(isAdmin(profile) ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
      ],
    },
  ];

  const perfilHref = isAthleteRole(profile) && athlete ? `/atleta/${athlete.id}` : "/perfil";

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <aside
      className={`hidden md:flex sticky top-0 h-screen shrink-0 bg-[var(--color-surface)] flex-col transition-[width] duration-150 ${
        collapsed ? "w-[68px]" : "w-[228px]"
      }`}
    >
      <div className={`flex items-center gap-2 p-3 ${collapsed ? "justify-center" : ""}`}>
        <Image
          src="/apex-logo.svg"
          alt="Ápex"
          width={30}
          height={30}
          unoptimized
          className="rounded-[10px] object-cover shadow-[var(--shadow-organic-sm)] shrink-0"
        />
        {!collapsed && <span className="font-[family-name:var(--font-heading)] text-[18px]">Ápex</span>}
      </div>

      <AthleteSwitcher collapsed={collapsed} />

      <button
        onClick={toggleCollapsed}
        title={collapsed ? "Expandir menú" : "Colapsar menú"}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
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

      <nav className="flex-1 overflow-y-auto px-2 space-y-3">
        <Link
          href="/"
          title={collapsed ? "Dashboard" : undefined}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            collapsed ? "justify-center" : ""
          } ${
            isActive("/")
              ? "bg-[var(--color-accent-200)] text-[var(--color-accent-800)] font-semibold"
              : "text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07]"
          }`}
        >
          <LayoutDashboard size={17} strokeWidth={2.75} className="shrink-0" aria-hidden="true" />
          {!collapsed && "Dashboard"}
        </Link>

        {groups.map((group) => {
          const isGroupOpen = !collapsedGroups.has(group.label);
          return (
          <div key={group.label}>
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-2.5 mb-0.5 text-[10px] tracking-[0.08em] uppercase text-[var(--color-text)]/45 hover:text-[var(--color-text)]/70"
                aria-expanded={isGroupOpen}
              >
                <span>{group.label}</span>
                {isGroupOpen ? (
                  <ChevronUp size={11} strokeWidth={2.75} aria-hidden="true" />
                ) : (
                  <ChevronDown size={11} strokeWidth={2.75} aria-hidden="true" />
                )}
              </button>
            )}
            <div className={`space-y-0.5 ${!collapsed && !isGroupOpen ? "hidden" : ""}`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isActive(item.href)
                        ? "bg-[var(--color-accent-200)] text-[var(--color-accent-800)] font-semibold"
                        : "text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07]"
                    }`}
                  >
                    <Icon size={17} strokeWidth={2.75} className="shrink-0" aria-hidden="true" />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--color-divider)] space-y-0.5">
        <Link
          href={perfilHref}
          title={collapsed ? "Mi perfil" : undefined}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            collapsed ? "justify-center" : ""
          } ${
            isActive(perfilHref)
              ? "bg-[var(--color-accent-200)] text-[var(--color-accent-800)] font-semibold"
              : "text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07]"
          }`}
        >
          <UserCog size={17} strokeWidth={2.75} className="shrink-0" aria-hidden="true" />
          {!collapsed && "Mi perfil"}
        </Link>

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-full text-sm w-full text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07] ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={17} strokeWidth={2.75} className="shrink-0" aria-hidden="true" />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}
