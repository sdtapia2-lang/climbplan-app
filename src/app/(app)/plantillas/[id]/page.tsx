"use client";

import { useParams } from "next/navigation";
import { TemplateEditor } from "@/components/TemplateEditor";
import { RequireRole } from "@/components/ProfileProvider";

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequireRole roles={["admin"]} redirectTo="/plantillas">
      <TemplateEditor templateId={id} />
    </RequireRole>
  );
}
