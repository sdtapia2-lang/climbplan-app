"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardKicker, Spinner, EmptyState } from "@/components/ui";
import type { Profile } from "@/lib/types";
import { Mail, Phone, Award } from "lucide-react";

export default function EntrenadorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [coach, setCoach] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .eq("role", "entrenador")
        .eq("public_profile", true)
        .maybeSingle();
      setCoach((data as Profile) ?? null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="text-[var(--color-text)]/40 hover:text-[var(--color-neutral-700)] mb-4">
        &larr; Volver
      </button>

      {!coach ? (
        <EmptyState text="Este entrenador no tiene un perfil publico disponible." />
      ) : (
        <Card>
          <CardKicker>Entrenador</CardKicker>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl mb-3">{coach.full_name || "Entrenador"}</h1>

          {coach.bio && <p className="text-sm text-[var(--color-text)]/80 mb-4 whitespace-pre-line">{coach.bio}</p>}

          {coach.certifications && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[var(--color-text)]/40 tracking-wide mb-1">
                <Award size={13} strokeWidth={2.75} className="inline-block align-[-2px] mr-1" aria-hidden="true" />
                CERTIFICACIONES Y LOGROS
              </p>
              <p className="text-sm text-[var(--color-text)]/80 whitespace-pre-line">{coach.certifications}</p>
            </div>
          )}

          {(coach.contact_email || coach.contact_phone) && (
            <div className="space-y-1 mt-4 pt-4 border-t border-[var(--color-divider)]">
              {coach.contact_email && (
                <p className="text-sm flex items-center gap-1.5">
                  <Mail size={14} strokeWidth={2.75} className="text-[var(--color-text)]/40" aria-hidden="true" />
                  {coach.contact_email}
                </p>
              )}
              {coach.contact_phone && (
                <p className="text-sm flex items-center gap-1.5">
                  <Phone size={14} strokeWidth={2.75} className="text-[var(--color-text)]/40" aria-hidden="true" />
                  {coach.contact_phone}
                </p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
