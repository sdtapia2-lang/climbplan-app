"use client";

import { useParams } from "next/navigation";
import { MesocycleEditor } from "@/components/MesocycleEditor";
import { RequireRole } from "@/components/ProfileProvider";

export default function EditMesocyclePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequireRole roles={["admin", "entrenador"]} redirectTo="/mesociclo">
      <MesocycleEditor mesocycleId={id} />
    </RequireRole>
  );
}
