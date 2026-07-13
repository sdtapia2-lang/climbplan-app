"use client";

import { TemplateEditor } from "@/components/TemplateEditor";
import { RequireRole } from "@/components/ProfileProvider";

export default function NewTemplatePage() {
  return (
    <RequireRole roles={["admin"]} redirectTo="/plantillas">
      <TemplateEditor />
    </RequireRole>
  );
}
