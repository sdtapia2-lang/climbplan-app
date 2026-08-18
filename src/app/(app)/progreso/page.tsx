"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Segmented } from "@/components/ui";
import EvaluationListPage from "../evaluacion/page";
import CheckInPage from "../checkin/page";
import AnalyticsPage from "../analitica/page";

type Tab = "evaluacion" | "checkin" | "analitica";

function ProgresoTabs() {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");
  const initialTab: Tab = initialTabParam === "evaluacion" || initialTabParam === "analitica" ? initialTabParam : "checkin";
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div>
      <div className="mb-4">
        <Segmented<Tab>
          options={[
            { value: "checkin", label: "Check-in" },
            { value: "evaluacion", label: "Evaluación" },
            { value: "analitica", label: "Analítica" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === "checkin" ? <CheckInPage /> : tab === "evaluacion" ? <EvaluationListPage /> : <AnalyticsPage />}
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
