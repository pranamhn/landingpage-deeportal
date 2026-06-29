"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocalDataTable, type LocalColumn } from "@/components/admin/data-quality/LocalDataTable";
import { cn } from "@/lib/cn";

interface SourceErrorRow {
  source: string;
  errors: number;
  retryable: number;
  refetchable: number;
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

interface JobStatus {
  running: boolean;
  current: RetryProgress | null;
  history: Record<string, RetryHistoryEntry>;
}

async function fetchRetryStatus(): Promise<JobStatus | null> {
  try {
    const resp = await fetch("/api/v1/admin/ingestion/retry-status");
    const data = await resp.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

async function fetchRefetchStatus(): Promise<JobStatus | null> {
  try {
    const resp = await fetch("/api/v1/admin/ingestion/refetch-status");
    const data = await resp.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

async function triggerCommand(command: string, source: string | null, limit: number): Promise<{ success: boolean; message?: string }> {
  try {
    const resp = await fetch("/api/v1/admin/commands/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command,
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

function ActionButton({
  label, command, source, count, disabled, busy, onTriggered, onError,
}: {
  label: string;
  command: string;
  source: string | null;
  count: number;
  disabled: boolean;
  busy: boolean;
  onTriggered: () => void;
  onError: (message: string) => void;
}) {
  if (count <= 0) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const handleClick = async () => {
    const result = await triggerCommand(command, source, source ? count : Math.min(count, 500));
    if (!result.success) {
      onError(result.message || `Failed to start ${command}.`);
      return;
    }
    onTriggered();
  };

  const colorClass = command === "retry-failed"
    ? "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-400"
    : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || busy}
      title={disabled ? "Another job is already running" : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        colorClass,
      )}
    >
      {busy ? (
        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {label}
    </button>
  );
}

export function ErrorRetryPanel({
  errorItems,
  sourceBreakdown,
}: {
  errorItems: { description: string }[];
  sourceBreakdown: { source: string; total: number; failed: number; retryable?: number; refetchable?: number }[];
}) {
  const router = useRouter();
  const [retryStatus, setRetryStatus] = useState<JobStatus | null>(null);
  const [refetchStatus, setRefetchStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasRetryRunningRef = useRef(false);
  const wasRefetchRunningRef = useRef(false);
  const didInitialRefresh = useRef(false);

  // Count errors per source from error items
  const errorCountBySource = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of errorItems) {
      const parts = (item.description || "").split(" · ");
      const sourcePart = parts.find((p) => p.startsWith("source:"))?.replace("source: ", "") || "unknown";
      map[sourcePart] = (map[sourcePart] || 0) + 1;
    }
    return map;
  }, [errorItems]);

  // Build rows: merge error counts with source_breakdown retryable/refetchable
  const rows: SourceErrorRow[] = useMemo(() => {
    const breakdownMap = new Map(sourceBreakdown.map((s) => [s.source, s]));
    const allSources = new Set([...Object.keys(errorCountBySource), ...sourceBreakdown.map((s) => s.source)]);
    return [...allSources]
      .map((source) => {
        const bd = breakdownMap.get(source);
        return {
          source,
          errors: errorCountBySource[source] || 0,
          retryable: Number(bd?.retryable) || 0,
          refetchable: Number(bd?.refetchable) || 0,
        };
      })
      .sort((a, b) => b.errors - a.errors);
  }, [errorCountBySource, sourceBreakdown]);

  const totalErrors = useMemo(() => rows.reduce((sum, r) => sum + r.errors, 0), [rows]);
  const totalRetryable = useMemo(() => rows.reduce((sum, r) => sum + r.retryable, 0), [rows]);
  const totalRefetchable = useMemo(() => rows.reduce((sum, r) => sum + r.refetchable, 0), [rows]);

  const isRunning = !!(retryStatus?.running || refetchStatus?.running);
  const currentJob = retryStatus?.running ? retryStatus.current : refetchStatus?.current;

  const poll = async () => {
    const [rs, fs] = await Promise.all([fetchRetryStatus(), fetchRefetchStatus()]);
    if (rs) {
      if (wasRetryRunningRef.current && !rs.running) router.refresh();
      wasRetryRunningRef.current = rs.running;
      setRetryStatus(rs);
    }
    if (fs) {
      if (wasRefetchRunningRef.current && !fs.running) router.refresh();
      wasRefetchRunningRef.current = fs.running;
      setRefetchStatus(fs);
    }
    if (!didInitialRefresh.current && (totalRetryable > 0 || totalRefetchable > 0)) {
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
    if (isRunning) {
      pollRef.current = setInterval(poll, 3000);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const refresh = () => { poll(); router.refresh(); };
  const handleTriggered = () => { setError(null); poll(); };
  const handleError = (message: string) => setError(message);

  const columns: LocalColumn[] = [
    { key: "source", label: "Source" },
    {
      key: "errors", label: "Errors", render: (v) => (
        <span className="font-semibold text-rose-600">{String(v)}</span>
      ),
    },
    {
      key: "retryable", label: "Retryable", render: (v) => (
        <span className={cn("font-semibold", Number(v) > 0 ? "text-brand-600" : "text-gray-400")}>{String(v)}</span>
      ),
    },
    {
      key: "refetchable", label: "Refetchable", render: (v) => (
        <span className={cn("font-semibold", Number(v) > 0 ? "text-amber-600" : "text-gray-400")}>{String(v)}</span>
      ),
    },
    {
      key: "actions", label: "", width: "180px", render: (_v, row) => (
        <div className="flex items-center gap-1.5">
          <ActionButton
            label="Retry"
            command="retry-failed"
            source={String(row.source)}
            count={Number(row.retryable) || 0}
            disabled={isRunning}
            busy={isRunning && !!retryStatus?.running && (retryStatus?.current?.source === String(row.source) || retryStatus?.current?.source === null)}
            onTriggered={handleTriggered}
            onError={handleError}
          />
          <ActionButton
            label="Refetch"
            command="refetch-failed"
            source={String(row.source)}
            count={Number(row.refetchable) || 0}
            disabled={isRunning}
            busy={isRunning && !!refetchStatus?.running && (refetchStatus?.current?.source === String(row.source) || refetchStatus?.current?.source === null)}
            onTriggered={handleTriggered}
            onError={handleError}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-4 dark:border-rose-900/40 dark:bg-rose-900/10">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {totalErrors.toLocaleString()} errors · {totalRetryable.toLocaleString()} retryable · {totalRefetchable.toLocaleString()} refetchable
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Retry = re-run LLM extraction on cached text. Refetch = re-fetch the page first, then extract.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton
            label="Retry All"
            command="retry-failed"
            source={null}
            count={totalRetryable}
            disabled={isRunning}
            busy={isRunning && !!retryStatus?.running}
            onTriggered={handleTriggered}
            onError={handleError}
          />
          <ActionButton
            label="Refetch All"
            command="refetch-failed"
            source={null}
            count={totalRefetchable}
            disabled={isRunning}
            busy={isRunning && !!refetchStatus?.running}
            onTriggered={handleTriggered}
            onError={handleError}
          />
        </div>
      </div>

      {/* Running Progress */}
      {isRunning && currentJob && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>
            {retryStatus?.running ? "Retrying" : "Refetching"} {currentJob.source ?? "all sources"}:{" "}
            {currentJob.retried}/{currentJob.total}
            {" "}({currentJob.succeeded} succeeded, {currentJob.still_failed} still failed)
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">✕</button>
        </div>
      )}

      {/* Table */}
      <LocalDataTable
        title="Errors by Source"
        rows={rows.filter((r) => r.errors > 0 || r.retryable > 0 || r.refetchable > 0) as unknown as Record<string, unknown>[]}
        columns={columns}
        defaultPerPage={10}
        onRefresh={refresh}
      />
    </div>
  );
}
