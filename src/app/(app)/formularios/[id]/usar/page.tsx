"use client";

import { useParams } from "next/navigation";
import { DynamicForm } from "@/components/DynamicForm";

export default function UseFormTemplatePage() {
  const { id } = useParams<{ id: string }>();
  return <DynamicForm templateId={id} />;
}
