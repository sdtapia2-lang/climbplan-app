"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Segmented } from "@/components/ui";
import EvaluationListPage from "../evaluacion/page";
import CheckInPage from "../checkin/page";

type Tab = "evaluacion" | "checkin";

function ProgresoTabs() {
  const searchParams = useSearchParams();
  const initialTab: Tab = searchParams.get("tab") === "evaluacion" ? "evaluacion" : "checkin";
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div>
      <div className="mb-4">
        <Segmented<Tab>
          options={[
            { value: "checkin", label: "Check-in" },
            { value: "evaluacion", label: "Evaluación" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === "checkin" ? <CheckInPage /> : <EvaluationListPage />}
    </div>
  );
}

export default function ProgresoPage() {
  return (
    <Suspense>
      <ProgresoTabs />
    </Suspense>
  );
}
