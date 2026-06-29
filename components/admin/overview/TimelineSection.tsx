"use client";

import { useState } from "react";
import { PeriodFilter } from "./PeriodFilter";
import { TimelineChartWithFilter } from "./TimelineChartWithFilter";
import type { AdminStatsFundingTimeline, AdminStatsNewsTimeline } from "@/types/admin";

type Period = "7d" | "30d" | "90d" | "6m" | "1y" | "all";

interface Props {
  fundingTimeline: AdminStatsFundingTimeline[];
  newsTimeline: AdminStatsNewsTimeline[];
}

export function TimelineSection({ fundingTimeline, newsTimeline }: Props) {
  const [period, setPeriod] = useState<Period>("30d");

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Activity Timeline</h3>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>
      <TimelineChartWithFilter
        fundingTimeline={fundingTimeline}
        newsTimeline={newsTimeline}
        period={period}
      />
    </>
  );
}
