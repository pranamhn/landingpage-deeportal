"use client";

import { useState, useEffect } from "react";
import { LocalDataTable, type LocalColumn } from "@/components/admin/data-quality/LocalDataTable";

interface EnrichmentRun {
  id: string;
  pipeline: string;
  entity_type: string;
  status: string;
  started_at: number;
  finished_at: number | null;
  candidates: number;
  enriched: number;
  events_found: number;
  errors: number;
}

const COLUMNS: LocalColumn[] = [
  {
    key: "started_at", label: "Started", width: "140px",
    render: (v) => v ? new Date(Number(v) * 1000).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—",
  },
  {
    key: "status", label: "Status", width: "90px", render: (v) => {
      const s = (v as string) || "done";
      const dot = s === "running" ? "bg-blue-500 animate-pulse" : s === "stopped" ? "bg-amber-500" : s === "crashed" ? "bg-rose-500" : s === "failed" ? "bg-amber-500" : "bg-emerald-500";
      const bg = s === "running" ? "bg-blue-50 text-blue-700 border-blue-200" : s === "stopped" ? "bg-amber-50 text-amber-700 border-amber-200" : s === "crashed" ? "bg-rose-50 text-rose-700 border-rose-200" : s === "failed" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
      return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${bg} dark:bg-opacity-20`}><span className={`h-2 w-2 rounded-full ${dot}`} />{s}</span>;
    }
  },
  { key: "pipeline", label: "Pipeline" },
  { key: "candidates", label: "Candidates" },
  { key: "enriched", label: "Enriched" },
  { key: "events_found", label: "Events" },
  { key: "errors", label: "Errors" },
  {
    key: "finished_at", label: "Finished", width: "140px",
    render: (v, row) => {
      if (row.status === "running") return "—";
      return v ? new Date(Number(v) * 1000).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—";
    }
  },
];

export function EnrichmentRunsTable() {
  const [rows, setRows] = useState<EnrichmentRun[]>([]);

  useEffect(() => {
    fetch("/api/v1/admin/enrichment/runs")
      .then((r) => r.json())
      .then((d) => { if (d.success) setRows(d.data || []); })
      .catch(() => { });

    const interval = setInterval(() => {
      fetch("/api/v1/admin/enrichment/runs")
        .then((r) => r.json())
        .then((d) => { if (d.success) setRows(d.data || []); })
        .catch(() => { });
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LocalDataTable
      title="Enrichment History"
      rows={rows as unknown as Record<string, unknown>[]}
      columns={COLUMNS}
      defaultPerPage={10}
    />
  );
}
