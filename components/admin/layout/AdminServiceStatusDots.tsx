"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface ServiceDot {
  key: string;
  label: string;
  running: boolean;
  pid: number | null;
}

/** rules/plan_dashboard.md §14 Phase 9.1 — live status dots di header.
 * Poll /api/v1/admin/engine/status tiap 30s, tampilkan dot + tooltip. */
export function AdminServiceStatusDots() {
  const [services, setServices] = useState<ServiceDot[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const resp = await fetch("/api/v1/admin/engine/status?range=1h");
        const json = await resp.json();
        if (!cancelled && json.success) {
          const d = json.data;
          setServices([
            { key: "ingest", label: "Ingestion", running: d.ingest?.running, pid: d.ingest?.pid ?? null },
            { key: "enrich-co", label: "Enrich Companies", running: d.enrich?.companies?.running, pid: d.enrich?.companies?.pid ?? null },
            { key: "enrich-inv", label: "Enrich Investors", running: d.enrich?.investors?.running, pid: d.enrich?.investors?.pid ?? null },
            { key: "enrich-ppl", label: "Enrich Founders", running: d.enrich?.people?.running, pid: d.enrich?.people?.pid ?? null },
          ]);
        }
      } catch { /* ignore */ }
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (!services.length) return null;

  const anyRunning = services.some((s) => s.running);

  return (
    <Link href="/admin/enrichment" className="flex items-center gap-1.5 mr-3 shrink-0 h-9 rounded-lg bg-white border border-gray-200 px-3 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500" title={services.map((s) => `${s.label}: ${s.running ? `Running (PID ${s.pid})` : "Idle"}`).join("\n")}>
      {services.map((s) => (
        <span
          key={s.key}
          className={cn(
            "block h-2 w-2 rounded-full",
            s.running ? "bg-emerald-500 animate-live-dot" : "bg-gray-300 dark:bg-gray-600",
          )}
        />
      ))}
    </Link>
  );
}
