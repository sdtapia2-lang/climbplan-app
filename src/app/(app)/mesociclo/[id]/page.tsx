"use client";

import { useParams } from "next/navigation";
import { MesocycleEditor } from "@/components/MesocycleEditor";

export default function EditMesocyclePage() {
  const { id } = useParams<{ id: string }>();
  return <MesocycleEditor mesocycleId={id} />;
}
