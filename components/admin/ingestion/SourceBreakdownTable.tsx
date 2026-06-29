"use client";

import { useMemo } from "react";
import { LocalDataTable, type LocalColumn } from "@/components/admin/data-quality/LocalDataTable";

interface SourceBreakdownRow {
  source: string;
  total: number;
  processed: number;
  failed: number;
  pending: number;
  last_article_at: number | null;
}

const COLUMNS: LocalColumn[] = [
  { key: "source", label: "Source" },
  { key: "total", label: "Total" },
  { key: "processed", label: "Processed" },
  { key: "failed", label: "Failed" },
  { key: "pending", label: "Pending" },
  {
    key: "rate", label: "Success", width: "90px", render: (v) => {
      const rate = Number(v) || 0;
      const color = rate >= 80 ? "text-emerald-600 font-semibold" : rate >= 50 ? "text-amber-600 font-semibold" : "text-rose-600 font-semibold";
      return <span className={color}>{rate}%</span>;
    }
  },
  {
    key: "last_article_at", label: "Last Article", width: "120px", render: (v) => {
      if (!v) return "—";
      return new Date(Number(v) * 1000).toLocaleDateString("id-ID");
    }
  },
];

export function SourceBreakdownTable({ rows }: { rows: SourceBreakdownRow[] }) {
  const mapped = useMemo(() => rows.map((r) => ({
    ...r,
    rate: r.total > 0 ? Math.round((r.processed / r.total) * 100) : 0,
  })), [rows]);

  return (
    <LocalDataTable
      title="Source Breakdown"
      rows={mapped}
      columns={COLUMNS}
      defaultPerPage={10}
    />
  );
}
