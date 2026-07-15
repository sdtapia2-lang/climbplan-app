"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, Spinner, EmptyState } from "@/components/ui";
import type { Profile } from "@/lib/types";

export default function EntrenadoresPage() {
  const [coaches, setCoaches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["entrenador", "admin"])
        .eq("public_profile", true)
        .order("full_name");
      setCoaches((data as Profile[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Entrenadores</h1>
      <p className="text-sm text-[var(--color-text)]/55 mb-6">Entrenadores disponibles en la app.</p>

      {coaches.length === 0 ? (
        <EmptyState text="Todavia no hay entrenadores con perfil publico." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((c) => (
            <Link key={c.id} href={`/entrenadores/${c.id}`}>
              <Card className="h-full hover:shadow-[var(--shadow-organic-md)] transition-shadow">
                <p className="font-medium mb-2">{c.full_name || "Entrenador"}</p>
                {c.bio && <p className="text-sm text-[var(--color-text)]/70 line-clamp-3">{c.bio}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
