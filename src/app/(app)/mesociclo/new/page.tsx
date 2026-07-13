"use client";

import { MesocycleEditor } from "@/components/MesocycleEditor";
import { RequireRole } from "@/components/ProfileProvider";

export default function NewMesocyclePage() {
  return (
    <RequireRole roles={["admin", "entrenador"]} redirectTo="/mesociclo">
      <MesocycleEditor />
    </RequireRole>
  );
}
