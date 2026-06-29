"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LocalDataTable, type LocalColumn } from "@/components/admin/data-quality/LocalDataTable";
import { cn } from "@/lib/cn";
import type { AdminIngestionSourceYield, AdminSourceReviewFlag } from "@/types/admin";

interface SourceHealthRow {
  name: string;
  kind: string;
  last_fetched_at: number | null;
  last_success_at: number | null;
  consecutive_failures: number;
}

interface SourceBreakdownRow {
  source: string;
  total: number;
  processed: number;
  failed: number;
  pending: number;
  last_article_at: number | null;
}

function since(timestamp: number | null): string {
  if (!timestamp) return "never";
  const diffSec = Math.floor(Date.now() / 1000 - timestamp);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

type Period = "1h" | "24h" | "30d" | "365d" | "all";

export type { Period };

const PERIODS: { key: Period; label: string; seconds: number | null }[] = [
  { key: "1h", label: "1h", seconds: 3600 },
  { key: "24h", label: "24h", seconds: 86400 },
  { key: "30d", label: "30d", seconds: 30 * 86400 },
  { key: "365d", label: "1y", seconds: 365 * 86400 },
  { key: "all", label: "All", seconds: null },
];

const FLAG_LABELS: Record<Exclude<AdminSourceReviewFlag, null>, string> = {
  low_yield: "Low yield",
  high_cost: "High cost",
  low_yield_high_cost: "Low yield + high cost",
};

async function toggleSource(name: string, enabled: boolean): Promise<{ success: boolean; message?: string }> {
  try {
    const resp = await fetch("/api/v1/admin/sources/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, enabled }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.success) {
      return { success: false, message: data?.message || `HTTP ${resp.status}` };
    }
    return { success: true };
  } catch {
    return { success: false, message: "Could not reach the server." };
  }
}

function ToggleButton({ name, enabled, onError }: { name: string; enabled: boolean; onError: (message: string) => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    const result = await toggleSource(name, !enabled);
    setPending(false);
    if (!result.success) {
      onError(result.message || `Failed to ${enabled ? "disable" : "enable"} ${name}.`);
      return;
    }
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all disabled:opacity-50",
        enabled
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      )}
    >
      {pending ? "..." : enabled ? "Disable" : "Enable"}
    </button>
  );
}

const COLUMNS: LocalColumn[] = [
  { key: "name", label: "Source" },
  {
    key: "status", label: "Status", width: "100px", render: (v, row) => {
      if (row.enabled === false) {
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            Disabled
          </span>
        );
      }
      const failures = Number(row.consecutive_failures) || 0;
      const ok = !failures && row.last_success_at;
      const label = ok ? "Healthy" : failures > 0 ? "Failing" : "Unknown";
      const dotColor = ok ? "bg-emerald-500" : failures > 0 ? "bg-rose-500" : "bg-gray-400";
      const badgeBg = ok
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : failures > 0
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-gray-50 text-gray-500 border-gray-200";
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeBg} dark:bg-opacity-20`}>
          <span className={`h-2 w-2 rounded-full ${dotColor} ${ok ? "animate-pulse" : ""}`} />
          {label}
        </span>
      );
    }
  },
  { key: "kind", label: "Kind", width: "70px" },
  { key: "total", label: "Total", width: "60px" },
  { key: "processed", label: "Done", width: "60px" },
  { key: "failed_articles", label: "Failed", width: "60px" },
  { key: "pending", label: "Pending", width: "70px" },
  {
    key: "rate", label: "Success", width: "80px", render: (v) => {
      const rate = Number(v) || 0;
      const color = rate >= 80 ? "text-emerald-600 font-semibold" : rate >= 50 ? "text-amber-600 font-semibold" : "text-rose-600 font-semibold";
      return <span className={color}>{rate}%</span>;
    }
  },
  {
    key: "yield_rate", label: "Yield", width: "70px", render: (v, row) => {
      if (row.yield_rate == null) return <span className="text-gray-400">—</span>;
      const pct = Math.round(Number(v) * 100);
      const color = pct >= 10 ? "text-emerald-600 font-semibold" : pct >= 2 ? "text-amber-600 font-semibold" : "text-rose-600 font-semibold";
      return <span className={color}>{pct}%</span>;
    }
  },
  {
    key: "cost_per_event_usd", label: "Cost/Event", width: "90px", render: (v, row) => {
      if (row.cost_per_event_usd == null) return <span className="text-gray-400">—</span>;
      return <span className="tabular-nums text-gray-700 dark:text-gray-300">${Number(v).toFixed(4)}</span>;
    }
  },
  {
    key: "review_flag", label: "Review", width: "150px", render: (v) => {
      const flag = v as AdminSourceReviewFlag;
      if (!flag) return <span className="text-gray-400">—</span>;
      return (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          {FLAG_LABELS[flag]}
        </span>
      );
    }
  },
  {
    key: "last_fetched_at", label: "Last Fetch", width: "110px",
    render: (v) => since(v as number | null),
  },
  {
    key: "last_success_at", label: "Last Success", width: "120px",
    render: (v) => since(v as number | null),
  },
  {
    key: "consecutive_failures", label: "Errors", width: "70px",
    render: (v) => {
      const n = Number(v) || 0;
      return n > 0 ? <span className="font-bold text-rose-600">{n}</span> : <span className="text-gray-400">—</span>;
    }
  },
];

export function SourceOverviewTable({
  health,
  breakdown,
  yieldData,
  period,
}: {
  health: SourceHealthRow[];
  breakdown: SourceBreakdownRow[];
  yieldData?: AdminIngestionSourceYield[];
  period: Period;
}) {
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const now = Date.now() / 1000;
    const cutoff = PERIODS.find((p) => p.key === period)?.seconds;
    const breakdownMap = new Map(breakdown.map((b) => [b.source, b]));
    const yieldMap = new Map((yieldData ?? []).map((y) => [y.source, y]));
    return health
      .filter((h) => {
        if (cutoff == null || !h.last_fetched_at) return true;
        return (now - h.last_fetched_at) <= cutoff;
      })
      .map((h) => {
        const b = breakdownMap.get(h.name);
        const y = yieldMap.get(h.name);
        const rate = b && b.total > 0 ? Math.round((b.processed / b.total) * 100) : 0;
        return {
          name: h.name,
          kind: h.kind,
          total: b?.total ?? 0,
          processed: b?.processed ?? 0,
          failed_articles: b?.failed ?? 0,
          pending: b?.pending ?? 0,
          rate,
          yield_rate: y?.yield_rate ?? null,
          cost_per_event_usd: y?.cost_per_event_usd ?? null,
          review_flag: y?.review_flag ?? null,
          enabled: y?.enabled ?? true,
          last_fetched_at: h.last_fetched_at,
          last_success_at: h.last_success_at,
          consecutive_failures: h.consecutive_failures,
          status: "", // placeholder for render
        };
      });
  }, [health, breakdown, yieldData, period]);

  const columnsWithAction: LocalColumn[] = useMemo(() => [
    ...COLUMNS,
    {
      key: "action", label: "", width: "90px", render: (_v, row) => (
        <ToggleButton name={String(row.name)} enabled={row.enabled !== false} onError={setError} />
      ),
    },
  ], []);

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">✕</button>
        </div>
      )}
      <LocalDataTable
        title="Sources"
        rows={rows}
        columns={columnsWithAction}
        defaultPerPage={10}
      />
    </div>
  );
}
