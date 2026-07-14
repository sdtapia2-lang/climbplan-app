"use client";

import { TemplateEditor } from "@/components/TemplateEditor";
import { RequireRole } from "@/components/ProfileProvider";

export default function NewTemplatePage() {
  return (
    <RequireRole roles={["admin", "entrenador"]} redirectTo="/plantillas">
      <TemplateEditor />
    </RequireRole>
  );
}
