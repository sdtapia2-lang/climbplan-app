"use client";

import { useParams } from "next/navigation";
import { EvaluationForm } from "@/components/EvaluationForm";

export default function EditEvaluationPage() {
  const { id } = useParams<{ id: string }>();
  return <EvaluationForm evaluationId={id} />;
}
