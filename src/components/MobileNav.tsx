"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Activity, Heart, UserCircle } from "lucide-react";
import { useAthlete } from "./AthleteProvider";

export function MobileNav() {
  const pathname = usePathname();
  const { athleteId } = useAthlete();

  const items = [
    { href: "/", label: "Hoy", icon: House },
    { href: "/entrenamiento", label: "Entreno", icon: Activity },
    { href: "/checkin", label: "Check-in", icon: Heart },
    { href: athleteId ? `/atleta/${athleteId}` : "/", label: "Perfil", icon: UserCircle },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--color-surface)] border-t border-[var(--color-divider)] flex items-stretch">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs ${
              active ? "text-[var(--color-accent-700)] font-semibold" : "text-[var(--color-text)]/60"
            }`}
          >
            <Icon size={20} strokeWidth={2.75} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
