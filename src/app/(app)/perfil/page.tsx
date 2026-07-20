"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RequireRole, useProfile } from "@/components/ProfileProvider";
import { Card, Field, Input, Textarea, Button, Spinner } from "@/components/ui";

export default function PerfilPage() {
  return (
    <RequireRole roles={["entrenador", "admin"]}>
      <PerfilForm />
    </RequireRole>
  );
}

function PerfilForm() {
  const { profile, loading, refresh } = useProfile();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [certifications, setCertifications] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [publicProfile, setPublicProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza el form con el perfil recien cargado
    setFullName(profile.full_name ?? "");
    setBio(profile.bio ?? "");
    setCertifications(profile.certifications ?? "");
    setContactEmail(profile.contact_email ?? "");
    setContactPhone(profile.contact_phone ?? "");
    setPublicProfile(profile.public_profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cargar el perfil, no en cada cambio de input
  }, [profile?.id]);

  if (loading || !profile) return <Spinner />;

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        bio: bio || null,
        certifications: certifications || null,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        public_profile: publicProfile,
      })
      .eq("id", profile!.id);
    setSaving(false);
    refresh();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Mi perfil</h1>
      <p className="text-sm text-[var(--color-text)]/55 mb-6">
        Esta información se muestra en el directorio de entrenadores si activas el perfil público.
      </p>

      <Card className="space-y-4">
        <Field label="Nombre">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre" />
        </Field>
        <Field label="Bio">
          <Textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntale a los escaladores quién eres y cómo entrenas..."
          />
        </Field>
        <Field label="Certificaciones / logros">
          <Textarea
            rows={3}
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="Cursos, capacitaciones, logros deportivos..."
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Correo de contacto">
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
            />
          </Field>
          <Field label="Teléfono de contacto">
            <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+54 9 ..." />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={publicProfile} onChange={(e) => setPublicProfile(e.target.checked)} />
          Perfil público (aparece en el directorio de entrenadores)
        </label>
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </Card>
    </div>
  );
}
