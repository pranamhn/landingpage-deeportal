"use client";

import { useMemo } from "react";
import { AdminLineChart } from "@/components/admin/charts/AdminLineChart";
import { formatRoundType } from "@/lib/formatters/format";
import type { ChartDataPoint, AdminStatsFundingTimeline, AdminStatsNewsTimeline } from "@/types/admin";

type Period = "7d" | "30d" | "90d" | "6m" | "1y" | "all";

function getCutoff(period: Period): string {
  const now = new Date();
  switch (period) {
    case "7d": now.setDate(now.getDate() - 7); break;
    case "30d": now.setDate(now.getDate() - 30); break;
    case "90d": now.setDate(now.getDate() - 90); break;
    case "6m": now.setMonth(now.getMonth() - 6); break;
    case "1y": now.setFullYear(now.getFullYear() - 1); break;
    default: return "";
  }
  return now.toISOString().slice(0, 7);
}

interface Props {
  fundingTimeline: AdminStatsFundingTimeline[];
  newsTimeline: AdminStatsNewsTimeline[];
  period: Period;
}

export function TimelineChartWithFilter({ fundingTimeline, newsTimeline, period }: Props) {
  const { fundingSeries, newsData } = useMemo(() => {
    const cutoff = getCutoff(period);

    const months = [...new Set(fundingTimeline.map((f) => f.month))]
      .sort()
      .filter((m) => !cutoff || m >= cutoff);
    // Group by FORMATTED name, not raw round_type — different raw values
    // (e.g. "pre-series_a" vs "pre_series_a") can format to the same label,
    // which would otherwise produce two series with the same name/key.
    const names = [...new Set(fundingTimeline.map((f) => formatRoundType(f.round_type)))];
    const fSeries = names.map((name) => ({
      name,
      data: months.map((month) => {
        const c = fundingTimeline
          .filter((f) => f.month === month && formatRoundType(f.round_type) === name)
          .reduce((sum, f) => sum + f.c, 0);
        return { label: month, value: c };
      }),
    }));

    const nData: ChartDataPoint[] = newsTimeline
      .filter((n) => !cutoff || n.month >= cutoff)
      .map((n) => ({ label: n.month, value: n.c }));

    return { fundingSeries: fSeries, newsData: nData };
  }, [fundingTimeline, newsTimeline, period]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Funding Rounds</h4>
        {fundingSeries.length > 0 ? (
          <AdminLineChart series={fundingSeries} height={240} />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">No data</div>
        )}
      </div>
      <div>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">News Events</h4>
        {newsData.length > 0 ? (
          <AdminLineChart data={newsData} height={240} />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">No data</div>
        )}
      </div>
    </div>
  );
}
