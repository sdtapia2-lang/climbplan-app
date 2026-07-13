"use client";

import { useParams } from "next/navigation";
import { FormTemplateBuilder } from "@/components/FormTemplateBuilder";
import { RequireRole } from "@/components/ProfileProvider";

export default function EditFormTemplatePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequireRole roles={["admin", "entrenador"]} redirectTo="/formularios">
      <FormTemplateBuilder templateId={id} />
    </RequireRole>
  );
}
