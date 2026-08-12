"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui";
import EvaluationListPage from "../evaluacion/page";
import CheckInPage from "../checkin/page";

type Tab = "evaluacion" | "checkin";

export default function ProgresoPage() {
  const [tab, setTab] = useState<Tab>("checkin");

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
