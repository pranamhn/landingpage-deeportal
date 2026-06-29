"use client";

import { useMemo } from "react";
import { LocalDataTable, type LocalColumn } from "@/components/admin/data-quality/LocalDataTable";

interface SourceHealthRow {
  name: string;
  kind: string;
  last_fetched_at: number | null;
  last_success_at: number | null;
  consecutive_failures: number;
}

function since(timestamp: number | null): string {
  if (!timestamp) return "never";
  const diffSec = Math.floor(Date.now() / 1000 - timestamp);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

const COLUMNS: LocalColumn[] = [
  { key: "name", label: "Source" },
  {
    key: "status", label: "Status", width: "100px", render: (v, row) => {
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
  {
    key: "last_success_at", label: "Last Success", width: "120px",
    render: (v) => since(v as number | null),
  },
  {
    key: "last_fetched_at", label: "Last Fetch", width: "110px",
    render: (v) => since(v as number | null),
  },
  {
    key: "consecutive_failures", label: "Failures", width: "80px",
    render: (v) => {
      const n = Number(v) || 0;
      return n > 0 ? <span className="font-bold text-rose-600">{n}</span> : <span className="text-gray-400">—</span>;
    }
  },
];

export function SourceHealthTable({ rows }: { rows: SourceHealthRow[] }) {
  const mapped = useMemo(() => rows.map((r) => ({
    ...r,
    status: "", // placeholder, computed in render
  })), [rows]);

  return (
    <LocalDataTable
      title="Source Health"
      rows={mapped}
      columns={COLUMNS}
      defaultPerPage={10}
    />
  );
}
