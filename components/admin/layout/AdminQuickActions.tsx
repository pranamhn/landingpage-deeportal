"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const ACTIONS = [
  { key: "ingest", label: "Run Ingestion", endpoint: "/api/v1/admin/ingestion/start" },
  { key: "enrich-co", label: "Enrich Companies", endpoint: "/api/v1/admin/enrichment/start", body: { which: "companies" } },
  { key: "enrich-inv", label: "Enrich Investors", endpoint: "/api/v1/admin/enrichment/start", body: { which: "investors" } },
  { key: "enrich-ppl", label: "Enrich Founders", endpoint: "/api/v1/admin/enrichment/start", body: { which: "people" } },
];

/** rules/plan_dashboard.md §14 Phase 9.4 — quick action button di header.
 * Start ingest/enrich dengan satu klik, toast success/error. */
export function AdminQuickActions() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const run = async (key: string, endpoint: string, body?: Record<string, string>) => {
    setPending(key);
    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
      });
      const json = await resp.json();
      if (json.success) {
        // toast handled by parent
      }
    } catch { /* ignore */ }
    setPending(null);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Run
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-xl z-50 py-1 dark:border-gray-600 dark:bg-gray-800">
            {ACTIONS.map((a) => (
              <button
                key={a.key}
                type="button"
                disabled={pending === a.key}
                onClick={() => run(a.key, a.endpoint, a.body)}
                className={cn(
                  "block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700",
                  pending === a.key && "opacity-50",
                )}
              >
                {pending === a.key ? "Starting..." : a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
