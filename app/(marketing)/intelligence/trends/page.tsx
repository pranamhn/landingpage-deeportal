import { getFundingTrends, type FundingTrendPoint } from "@/lib/api/companiesService";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Funding Trends — Deeportal", description: "Monthly funding trends by sector and country across the Asia startup ecosystem." };

function formatUsd(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const YEARS = ["2026", "2025", "2024", "2023", "2022"];

export default async function TrendsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const groupBy = params.group_by === "country" ? "country" : "sector";
  const year = params.year || "all";

  const result = await getFundingTrends(groupBy, 120);
  const points: FundingTrendPoint[] = result.success ? result.data : [];

  const filtered = year !== "all"
    ? points.filter((p) => p.month.startsWith(year) && !p.month.startsWith("-"))
    : points.filter((p) => !p.month.startsWith("-"));

  // Aggregate
  const aggregated = new Map<string, { count: number; total_amount_usd: number }>();
  for (const p of filtered) {
    const key = p.group_key;
    if (!aggregated.has(key)) aggregated.set(key, { count: 0, total_amount_usd: 0 });
    const entry = aggregated.get(key)!;
    entry.count += p.count;
    entry.total_amount_usd += p.total_amount_usd;
  }

  const sorted = [...aggregated.entries()].sort((a, b) => b[1].count - a[1].count);
  const maxCount = sorted.length > 0 ? Math.max(...sorted.map(([, v]) => v.count)) : 1;

  return (
    <div>
      <section className="mb-5">
        <p className="eyebrow">Intelligence</p>
        <h1 className="font-display text-display-page font-bold">Funding Trends</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
            {sorted.length} {groupBy === "sector" ? "sectors" : "countries"}
          </span>
          <span className="text-sm text-muted">
            {year === "all" ? "All time" : year} · ranked by deal count
          </span>
        </div>
      </section>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white/80 p-1 shadow-sm backdrop-blur">
          <Link
            href={`/intelligence/trends?group_by=sector&year=${year}`}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${groupBy === "sector" ? "bg-brand-600 text-white shadow-sm" : "text-muted hover:text-gray-900 hover:bg-gray-100"}`}
          >
            By Sector
          </Link>
          <Link
            href={`/intelligence/trends?group_by=country&year=${year}`}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${groupBy === "country" ? "bg-brand-600 text-white shadow-sm" : "text-muted hover:text-gray-900 hover:bg-gray-100"}`}
          >
            By Country
          </Link>
        </div>
        <div className="inline-flex rounded-xl border border-gray-200 bg-white/80 p-1 shadow-sm backdrop-blur">
          <Link
            href={`/intelligence/trends?group_by=${groupBy}&year=all`}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${year === "all" ? "bg-gray-900 text-white shadow-sm" : "text-muted hover:text-gray-900 hover:bg-gray-100"}`}
          >
            All
          </Link>
          {YEARS.map((y) => (
            <Link
              key={y}
              href={`/intelligence/trends?group_by=${groupBy}&year=${y}`}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${year === y ? "bg-gray-900 text-white shadow-sm" : "text-muted hover:text-gray-900 hover:bg-gray-100"}`}
            >
              {y}
            </Link>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No funding data for this period." description="Try switching grouping or year." />
      ) : (
        <section className="card">
          <div className="space-y-3">
            {sorted.map(([key, val]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-40 shrink-0 truncate text-sm font-medium capitalize">{key}</div>
                <div className="relative flex-1">
                  <div
                    className="h-7 rounded bg-brand-100 transition-all"
                    style={{ width: `${Math.max((val.count / maxCount) * 100, 2)}%` }}
                  />
                  <span className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold text-brand-700">
                    {val.count.toLocaleString()}
                  </span>
                </div>
                <div className="w-24 shrink-0 text-right text-sm font-semibold text-muted">{formatUsd(val.total_amount_usd)}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
