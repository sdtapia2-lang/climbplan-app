"use client";

import { FormTemplateBuilder } from "@/components/FormTemplateBuilder";
import { RequireRole } from "@/components/ProfileProvider";

export default function NewFormTemplatePage() {
  return (
    <RequireRole roles={["admin", "entrenador"]} redirectTo="/formularios">
      <FormTemplateBuilder />
    </RequireRole>
  );
}
