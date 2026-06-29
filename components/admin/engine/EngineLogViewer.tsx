"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/cn";

const SERVICES: { value: string; label: string }[] = [
  { value: "ingest", label: "Ingest News" },
  { value: "enrich", label: "Enrich Companies" },
  { value: "enrich_investors", label: "Enrich Investors" },
  { value: "enrich_people", label: "Enrich Founders" },
];

const LINE_OPTIONS = [100, 200, 500, 1000];

interface LogResponse {
  service: string;
  log: string[];
  err: string[];
}

/** rules/plan_dashboard.md §11 Phase 6.7 — log level color coding,
 * lines selector, download button. */
function colorizeLine(line: string): { className: string; text: string } {
  if (/^ERROR[:\[ ]/i.test(line)) return { className: "text-rose-400", text: line };
  if (/^WARN(?:ING)?[:\[ ]/i.test(line)) return { className: "text-amber-400", text: line };
  if (/^INFO[:\[ ]/i.test(line)) return { className: "text-gray-400", text: line };
  if (/^DEBUG[:\[ ]/i.test(line)) return { className: "text-blue-400", text: line };
  return { className: "text-gray-300", text: line };
}

export function EngineLogViewer() {
  const [service, setService] = useState("ingest");
  const [data, setData] = useState<LogResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lines, setLines] = useState(200);
  const preRef = useRef<HTMLPreElement>(null);

  const load = useCallback(async (currentService: string, currentLines: number) => {
    try {
      const resp = await fetch(`/api/v1/admin/engine/logs?service=${currentService}&lines=${currentLines}`);
      const json = await resp.json();
      if (json.success) {
        setData(json.data);
        setError(null);
      } else {
        setError(json.message || "Failed to load log.");
      }
    } catch {
      setError("Could not reach server.");
    }
  }, []);

  useEffect(() => {
    load(service, lines);
    if (!autoRefresh) return;
    const interval = setInterval(() => load(service, lines), 5_000);
    return () => clearInterval(interval);
  }, [service, autoRefresh, lines, load]);

  useEffect(() => {
    if (preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
  }, [data]);

  const handleDownload = () => {
    const text = data?.log?.join("\n") ?? "";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `log-${service}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Recent process log</h4>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refresh
          </label>
          <select
            value={lines}
            onChange={(e) => setLines(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {LINE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} lines</option>
            ))}
          </select>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!data?.log?.length}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Download
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
          {error}
          {error.toLowerCase().includes("unauthorized") && (
            <> — <a href="/admin/login" className="underline">session may have expired, log in again</a></>
          )}
        </p>
      )}
      <pre
        ref={preRef}
        className="h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-gray-900 p-3 text-[11px] leading-relaxed"
      >
        {data?.log.length
          ? data.log.map((line, i) => {
            const { className, text } = colorizeLine(line);
            return <div key={i} className={className}>{text}</div>;
          })
          : error
            ? <span className="text-gray-400">(unavailable)</span>
            : <span className="text-gray-400">No log output yet.</span>}
      </pre>

      {data?.err && data.err.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-500">Recent stderr</p>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-rose-950 p-3 text-[11px] leading-relaxed text-rose-100">
            {data.err.map((line, i) => <div key={i}>{line}</div>)}
          </pre>
        </div>
      )}
    </div>
  );
}
