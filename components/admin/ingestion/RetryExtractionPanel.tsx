"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocalDataTable, type LocalColumn } from "@/components/admin/data-quality/LocalDataTable";
import { cn } from "@/lib/cn";

interface SourceRetryRow {
  source: string;
  failed: number;
  retryable: number;
}

interface RetryProgress {
  source: string | null;
  total: number;
  retried: number;
  succeeded: number;
  still_failed: number;
  events_found: number;
  started_at: number;
  finished_at?: number | null;
}

interface RetryHistoryEntry {
  succeeded: number;
  still_failed: number;
  finished_at: number;
}

interface RetryStatus {
  running: boolean;
  current: RetryProgress | null;
  history: Record<string, RetryHistoryEntry>;
}

async function fetchRetryStatus(): Promise<RetryStatus | null> {
  try {
    const resp = await fetch("/api/v1/admin/ingestion/retry-status");
    const data = await resp.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

async function triggerRetry(source: string | null, limit: number): Promise<{ success: boolean; message?: string }> {
  try {
    const resp = await fetch("/api/v1/admin/commands/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: "retry-failed",
        params: { source: source ?? "", limit },
      }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.success) {
      return { success: false, message: data?.message || data?.data?.output || `HTTP ${resp.status}` };
    }
    return { success: true, message: data?.data?.output };
  } catch {
    return { success: false, message: "Could not reach the server." };
  }
}

function RetryButton({
  source, retryable, disabled, onTriggered, onError,
}: {
  source: string | null;
  retryable: number;
  disabled: boolean;
  onTriggered: () => void;
  onError: (message: string) => void;
}) {
  const [pending, setPending] = useState(false);

  if (retryable <= 0) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const handleClick = async () => {
    setPending(true);
    const result = await triggerRetry(source, source ? retryable : Math.min(retryable, 500));
    setPending(false);
    if (!result.success) {
      onError(result.message || "Failed to start retry.");
      return;
    }
    onTriggered();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || disabled}
      title={disabled ? "Another retry job is already running" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-400",
      )}
    >
      {pending ? (
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
      {pending ? "Starting..." : source ? "Retry" : "Retry All"}
    </button>
  );
}

export function RetryExtractionPanel({ rows }: { rows: SourceRetryRow[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<RetryStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Tracks running -> not-running transitions so we know exactly when a job
  // finishes and can refetch server data (summary cards, Total Failed /
  // Retryable columns) right away instead of waiting for the 30s
  // AdminAutoRefresh tick.
  const wasRunningRef = useRef(false);
  const didInitialRefresh = useRef(false);

  const totalRetryable = useMemo(() => rows.reduce((sum, r) => sum + (Number(r.retryable) || 0), 0), [rows]);
  const sortedRows = useMemo(
    () => [...rows].filter((r) => r.retryable > 0).sort((a, b) => b.retryable - a.retryable),
    [rows],
  );

  const poll = async () => {
    const s = await fetchRetryStatus();
    if (!s) return;
    if (wasRunningRef.current && !s.running) {
      router.refresh();
    }
    wasRunningRef.current = s.running;
    setStatus(s);
    // Refresh server cards once after initial data loads
    if (!didInitialRefresh.current && totalRetryable > 0) {
      didInitialRefresh.current = true;
      router.refresh();
    }
  };

  useEffect(() => {
    poll();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status?.running) {
      pollRef.current = setInterval(poll, 3000);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.running]);

  const refresh = () => { poll(); router.refresh(); };
  const handleTriggered = () => { setError(null); poll(); };
  const handleError = (message: string) => setError(message);
  const [stopping, setStopping] = useState(false);

  async function handleStop() {
    setStopping(true);
    try {
      await fetch("/api/v1/admin/commands/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "retry-failed" }),
      });
      poll();
    } catch { /* ignore */ }
    setStopping(false);
  }

  const isRunning = !!status?.running;
  const current = status?.current;

  const progressFor = (src: string): string => {
    if (current && current.source === src && isRunning) {
      return `${current.retried}/${current.total}...`;
    }
    if (current && current.source === null && isRunning) {
      return "running (all)";
    }
    return "—";
  };

  const succeededFor = (src: string): React.ReactNode => {
    const h = status?.history?.[src];
    if (!h) return <span className="text-gray-400">—</span>;
    return <span className="font-semibold text-emerald-600">{h.succeeded}</span>;
  };

  const columns: LocalColumn[] = [
    { key: "source", label: "Source" },
    { key: "failed", label: "Total Failed" },
    {
      key: "retryable", label: "Retryable", render: (v) => (
        <span className="font-semibold text-amber-600">{String(v)}</span>
      ),
    },
    {
      key: "succeeded", label: "Succeeded", render: (_v, row) => succeededFor(String(row.source)),
    },
    {
      key: "progress", label: "Progress", render: (_v, row) => (
        <span className={cn("text-xs", progressFor(String(row.source)) !== "—" ? "font-semibold text-blue-600" : "text-gray-400")}>
          {progressFor(String(row.source))}
        </span>
      ),
    },
    {
      key: "action", label: "", width: "140px", render: (_v, row) => (
        <RetryButton
          source={String(row.source)}
          retryable={Number(row.retryable) || 0}
          disabled={isRunning}
          onTriggered={handleTriggered}
          onError={handleError}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {totalRetryable.toLocaleString()} articles ready to retry
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Failed articles with cached full text — retries the LLM extraction only, no re-fetch.
          </p>
        </div>
        <RetryButton
          source={null}
          retryable={totalRetryable}
          disabled={isRunning}
          onTriggered={handleTriggered}
          onError={handleError}
        />
      </div>

      {isRunning && current && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <div className="flex items-center gap-3">
            <svg className="h-4 w-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>
              Retrying {current.source ?? "all sources"}: {current.retried}/{current.total}
              {" "}({current.succeeded} succeeded, {current.still_failed} still failed)
            </span>
          </div>
          <button
            type="button"
            onClick={handleStop}
            disabled={stopping}
            className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50"
          >
            {stopping ? "Stopping..." : "Stop"}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">✕</button>
        </div>
      )}

      <LocalDataTable
        title="Retry by Source"
        rows={sortedRows as unknown as Record<string, unknown>[]}
        columns={columns}
        defaultPerPage={10}
        onRefresh={refresh}
      />
    </div>
  );
}
