"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function MobileTopBar() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-divider)] flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <Image
          src="/apex-logo.svg"
          alt="Ápex"
          width={24}
          height={24}
          unoptimized
          className="rounded-[8px] object-cover shrink-0"
        />
        <span className="font-[family-name:var(--font-wordmark)] text-[15px]">Ápex</span>
      </div>
      <button
        onClick={handleLogout}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className="text-[var(--color-text)]/60 hover:text-[var(--color-text)] p-1.5"
      >
        <LogOut size={19} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </header>
  );
}
