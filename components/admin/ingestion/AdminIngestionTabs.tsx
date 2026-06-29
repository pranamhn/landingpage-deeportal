"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LocalDataTable, type LocalColumn } from "@/components/admin/data-quality/LocalDataTable";
import { SourceOverviewTable } from "@/components/admin/ingestion/SourceOverviewTable";
import type { Period } from "@/components/admin/ingestion/SourceOverviewTable";
import { RetryExtractionPanel } from "@/components/admin/ingestion/RetryExtractionPanel";
import { RefetchArticlesPanel } from "@/components/admin/ingestion/RefetchArticlesPanel";
import {
  adminSeverityPillMap,
  adminSeverityDotMap,
} from "@/components/admin/ui/adminTheme";
import { cn } from "@/lib/cn";
import type { AdminIngestionSourceYield, AdminSection, AdminSeverity } from "@/types/admin";

type IngestionTabId = "runs" | "sources" | "refetch" | "retry";

export type { IngestionTabId };

function isValidTab(value: string | null): value is IngestionTabId {
  return !!value && (value === "runs" || value === "sources" || value === "refetch" || value === "retry");
}

function getSectionSeverity(section?: AdminSection): AdminSeverity {
  const severities = (section?.items ?? []).map((item) => item.severity ?? "muted");
  if (severities.includes("danger")) return "danger";
  if (severities.includes("warning")) return "warning";
  if (severities.includes("info")) return "info";
  if (severities.includes("good")) return "good";
  return "muted";
}

interface TabMeta { id: IngestionTabId; label: string; severity: AdminSeverity; count: number; }

const RUN_COLUMNS: LocalColumn[] = [
  { key: "title", label: "Started" },
  {
    key: "status", label: "Status", width: "90px", render: (v) => {
      const s = (v as string) || "done";
      const dot = s === "running" ? "bg-blue-500 animate-pulse" : s === "stopped" ? "bg-amber-500" : s === "crashed" ? "bg-rose-500" : "bg-emerald-500";
      const bg = s === "running" ? "bg-blue-50 text-blue-700 border-blue-200" : s === "stopped" ? "bg-amber-50 text-amber-700 border-amber-200" : s === "crashed" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
      return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${bg} dark:bg-opacity-20`}><span className={`h-2 w-2 rounded-full ${dot}`} />{s}</span>;
    }
  },
  { key: "articles_seen", label: "Seen" },
  { key: "articles_processed", label: "Processed" },
  { key: "articles_filtered", label: "Filtered" },
  { key: "events_found", label: "Events" },
  { key: "companies_touched", label: "Companies" },
  { key: "errors", label: "Errors" },
  {
    key: "rate", label: "Success", width: "80px", render: (v) => {
      const r = Number(v) || 0;
      return <span className={r >= 80 ? "text-emerald-600 font-semibold" : r >= 50 ? "text-amber-600 font-semibold" : "text-gray-500"}>{r}%</span>;
    }
  },
  { key: "duration", label: "Duration" },
  { key: "finished", label: "Finished", width: "140px" },
];

export function AdminIngestionTabs({
  sections,
  initialTabId = "runs",
  sourceHealth,
  sourceBreakdown,
  sourceYield,
  totals,
}: {
  sections: AdminSection[];
  initialTabId?: IngestionTabId;
  sourceHealth?: { name: string; kind: string; last_fetched_at: number | null; last_success_at: number | null; consecutive_failures: number }[];
  sourceBreakdown?: { source: string; total: number; processed: number; failed: number; pending: number; retryable?: number; refetchable?: number; last_article_at: number | null }[];
  sourceYield?: AdminIngestionSourceYield[];
  totals?: { runs: number; articles: number; errors: number };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTabId = isValidTab(requestedTab) ? requestedTab : initialTabId;

  const runsSection = sections.find((s) => s.eyebrow === "Runs");

  const runRows = useMemo(() => (runsSection?.items ?? []).map((item) => {
    const desc = item.description || "";
    const get = (key: string) => { const m = desc.match(new RegExp(`${key}:\\s*(\\S+)`)); return m ? m[1] : "—"; };
    const seen = parseInt(get("articles_seen")) || 0;
    const processed = parseInt(get("articles_processed")) || 0;
    const rate = seen > 0 ? Math.round((processed / seen) * 100) : 0;
    const status = (item.meta || []).find((m: string) => m.startsWith("status:"))?.replace("status: ", "") || "done";
    const finishedRaw = (item.meta || []).find((m: string) => m.startsWith("finished:"))?.replace("finished: ", "") || "";
    const finished = finishedRaw && finishedRaw !== "None" && finishedRaw !== ""
      ? new Date(Number(finishedRaw) * 1000).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
      : "—";
    return {
      title: item.title || "—",
      status,
      articles_seen: String(seen),
      articles_processed: String(processed),
      articles_filtered: get("articles_filtered"),
      events_found: get("events_found"),
      companies_touched: get("companies_touched"),
      errors: get("errors"),
      rate,
      duration: (item.meta || []).find((m: string) => m.startsWith("durasi:"))?.replace("durasi: ", "") || "—",
      finished,
    };
  }), [runsSection]);

  const totalRetryable = useMemo(
    () => (sourceBreakdown ?? []).reduce((sum, s) => sum + (Number(s.retryable) || 0), 0),
    [sourceBreakdown],
  );
  const totalRefetchable = useMemo(
    () => (sourceBreakdown ?? []).reduce((sum, s) => sum + (Number(s.refetchable) || 0), 0),
    [sourceBreakdown],
  );

  const tabs: TabMeta[] = useMemo(() => [
    { id: "runs", label: "Runs", count: totals?.runs ?? runsSection?.items?.length ?? 0, severity: getSectionSeverity(runsSection) },
    { id: "sources", label: "Sources", count: sourceHealth?.length ?? 0, severity: "info" as AdminSeverity },
    { id: "refetch", label: "Refetch", count: totalRefetchable, severity: totalRefetchable > 0 ? "warning" as AdminSeverity : "muted" as AdminSeverity },
    { id: "retry", label: "Extractions", count: totalRetryable, severity: totalRetryable > 0 ? "warning" as AdminSeverity : "muted" as AdminSeverity },
  ], [runsSection, sourceHealth, totalRetryable, totalRefetchable, totals]);

  const [runVisibleCols, setRunVisibleCols] = useState<Set<string>>(new Set(RUN_COLUMNS.map((c) => c.key)));
  const period = (searchParams.get("period") as Period) || "all";

  function handleTabChange(nextTabId: string) {
    if (!isValidTab(nextTabId)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div className="mb-6 inline-flex gap-1 rounded-2xl bg-gray-100/80 p-1 dark:bg-gray-800/80">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative flex-1 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 focus:outline-none",
                active
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              )}
            >
              <span className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                adminSeverityDotMap[tab.severity],
                active && "scale-125 shadow-sm",
              )} />
              <span>{tab.label}</span>
              {(tab.count ?? 0) > 0 && (
                <span className={cn(
                  "inline-flex min-w-[22px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                  active
                    ? "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                    : "bg-gray-200/70 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
                )}>
                  {tab.count! > 99 ? "99+" : tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTabId === "runs" && (
        <LocalDataTable
          title="Runs"
          rows={runRows}
          columns={RUN_COLUMNS.filter((c) => runVisibleCols.has(c.key))}
          defaultPerPage={10}
          showCheckbox
          rowKey="title"
          columnKeys={RUN_COLUMNS.map((c) => c.key)}
          visibleColumns={runVisibleCols}
          onToggleColumn={(key) => setRunVisibleCols((prev) => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; })}
          onRefresh={() => router.refresh()}
        />
      )}
      {activeTabId === "sources" && sourceHealth && (
        <SourceOverviewTable health={sourceHealth} breakdown={sourceBreakdown ?? []} yieldData={sourceYield} period={period} />
      )}
      {activeTabId === "refetch" && (
        <RefetchArticlesPanel
          rows={(sourceBreakdown ?? []).map((s) => ({
            source: s.source,
            failed: s.failed,
            refetchable: s.refetchable ?? 0,
          }))}
        />
      )}
      {activeTabId === "retry" && (
        <RetryExtractionPanel
          rows={(sourceBreakdown ?? []).map((s) => ({
            source: s.source,
            failed: s.failed,
            retryable: s.retryable ?? 0,
          }))}
        />
      )}
    </div>
  );
}
