"use client";

import { useState, useCallback, useMemo } from "react";
import type { AdminTableName, AdminTableData } from "@/types/admin";
import type { ColumnDef } from "@/components/admin/data-quality/AdminDataTable";
import { AdminDataTable } from "@/components/admin/data-quality/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { useAdminToast } from "@/components/admin/ui/AdminToast";
import {
  COMPANY_COLUMNS,
  FOUNDER_COLUMNS,
  INVESTOR_COLUMNS,
  LIST_COLUMNS,
  SUBMISSION_COLUMNS,
  FUNDING_ROUND_COLUMNS,
  NEWS_ARTICLE_COLUMNS,
} from "@/lib/adminTableColumns";

const TABLE_COLUMNS: Record<AdminTableName, ColumnDef[]> = {
  companies: COMPANY_COLUMNS,
  founders: FOUNDER_COLUMNS,
  investors: INVESTOR_COLUMNS,
  lists: LIST_COLUMNS,
  submissions: SUBMISSION_COLUMNS,
  funding_rounds: FUNDING_ROUND_COLUMNS,
  news_articles: NEWS_ARTICLE_COLUMNS,
};

type CompletenessSummary = { total: number; avg_completeness: number; below_50_count: number };

interface Props {
  table: AdminTableName;
  title: string;
  eyebrow?: string;
  description?: string;
  supportsMerge?: boolean;
  supportsCompleteness?: boolean;
  initialData: AdminTableData;
}

export function EntityTableClient({
  table,
  title,
  eyebrow,
  description,
  supportsMerge = false,
  supportsCompleteness = false,
  initialData,
}: Props) {
  const columns = useMemo(() => TABLE_COLUMNS[table] || [], [table]);
  const toast = useAdminToast();
  const [tableData, setTableData] = useState<AdminTableData>(initialData);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<CompletenessSummary | null>(null);

  // Column visibility (6.3)
  const colKeys = useMemo(() => columns.map((c) => c.key), [columns]);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`admin-cols-${table}`);
      if (stored) return new Set(JSON.parse(stored));
    } catch { /* ignore */ }
    return new Set(colKeys);
  });

  // Row density (7.1)
  const [dense, setDense] = useState(() => {
    try { return localStorage.getItem(`admin-dense-${table}`) === "true"; } catch { return false; }
  });
  const toggleDense = () => {
    setDense((prev) => {
      const next = !prev;
      try { localStorage.setItem(`admin-dense-${table}`, String(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try { localStorage.setItem(`admin-cols-${table}`, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  };

  const filteredColumns = useMemo(
    () => columns.filter((c) => visibleColumns.has(c.key)),
    [columns, visibleColumns],
  );

  // Last updated (6.5)
  const lastUpdated = useMemo(() => {
    const dates = tableData.rows
      .map((r) => (r as Record<string, unknown>).last_updated_at ?? (r as Record<string, unknown>).updated_at)
      .filter(Boolean)
      .map((d) => Number(d) * 1000);
    if (!dates.length) return null;
    const max = Math.max(...dates);
    const mins = Math.round((Date.now() - max) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
  }, [tableData.rows]);

  const fetchTable = useCallback(
    async (params: Record<string, string | number | undefined> = {}) => {
      setLoading(true);
      try {
        const sp = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined) sp.set(k, String(v));
        });
        const resp = await fetch(`/api/v1/admin/tables/${table}?${sp.toString()}`);
        const json = await resp.json();
        if (json.success) {
          setTableData(json.data);
          // Read summary from embedded response (9.5) — no separate request
          if (json.data.summary) setSummary(json.data.summary);
        }
      } catch {
        // keep stale data
      }
      setLoading(false);
    },
    [table],
  );

  const handleParamsChange = useCallback(
    (params: Record<string, string | number | undefined>) => {
      fetchTable({
        page: params.page ?? tableData.page ?? 1,
        per_page: params.per_page ?? tableData.per_page ?? 10,
        search: params.search ?? "",
        sort_by: params.sort_by ?? tableData.sort_by ?? "name",
        order: params.order ?? tableData.order ?? "asc",
      });
    },
    [fetchTable, tableData],
  );

  const handleEdit = useCallback(
    async (rowId: string, field: string, value: string): Promise<boolean> => {
      try {
        const resp = await fetch(`/api/v1/admin/tables/${table}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rowId, [field]: value }),
        });
        const json = await resp.json();
        if (json.success) {
          setTableData((prev) => ({
            ...prev,
            rows: prev.rows.map((row: Record<string, unknown>) =>
              String(row.id) === rowId ? { ...row, [field]: value } : row,
            ),
          }));
          toast.success("Saved");
          return true;
        }
      } catch {
        toast.error("Failed to save");
      }
      return false;
    },
    [table],
  );

  const handleMerge = useCallback(
    async (primaryId: string, duplicateIds: string[]): Promise<{ success: boolean; message?: string }> => {
      try {
        const resp = await fetch(`/api/v1/admin/tables/${table}/merge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ primary_id: primaryId, duplicate_ids: duplicateIds }),
        });
        const json = await resp.json();
        if (json.success) {
          fetchTable({ per_page: tableData.per_page ?? 10 });
          toast.success("Merged");
          return { success: true };
        }
        return { success: false, message: json.message };
      } catch {
        return { success: false, message: "Gagal terhubung ke server." };
      }
    },
    [fetchTable, table, tableData.per_page],
  );

  const handleBulkDelete = useCallback(
    async (ids: string[]): Promise<{ success: boolean; message?: string }> => {
      try {
        const resp = await fetch(`/api/v1/admin/tables/${table}/bulk-delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        const json = await resp.json();
        if (json.success) {
          const deleted = (json.data?.deleted ?? []) as string[];
          const blocked = (json.data?.errors ?? []) as { id: string; message: string }[];
          if (deleted.length) {
            fetchTable({ per_page: tableData.per_page ?? 10 });
            toast.success(`Deleted ${deleted.length} row${deleted.length > 1 ? "s" : ""}`);
          }
          if (blocked.length && !deleted.length) {
            return { success: false, message: blocked[0].message };
          }
          if (blocked.length) {
            window.alert(`${deleted.length} row terhapus, ${blocked.length} diblokir: ${blocked[0].message}`);
          }
          return { success: true };
        }
        return { success: false, message: json.message };
      } catch {
        return { success: false, message: "Gagal terhubung ke server." };
      }
    },
    [fetchTable, table, tableData.per_page],
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow={eyebrow || "Data Management"}
        title={title}
        description={description || ""}
      >
        {summary && (
          <div>
            <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-gray-600 dark:bg-gray-800">
              <div className="text-center">
                <div className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
                  {summary.avg_completeness}%
                </div>
                <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Avg Completeness
                </div>
              </div>
              <div className="h-10 w-px bg-gray-200 dark:bg-gray-600" />
              <div>
                <div className="text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
                  {summary.total.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total records</div>
              </div>
              <div>
                <div className="text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {summary.below_50_count.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Below 50% completeness</div>
              </div>
            </div>
          </div>
        )}
      </AdminPageHeader>
      <AdminDataTable
        title={title}
        table={table}
        data={tableData}
        columns={filteredColumns}
        onParamsChange={handleParamsChange}
        onEdit={handleEdit}
        onMerge={supportsMerge ? handleMerge : undefined}
        onBulkDelete={supportsMerge ? handleBulkDelete : undefined}
        loading={loading}
        columnKeys={colKeys}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        lastUpdated={lastUpdated ?? undefined}
        dense={dense}
        onToggleDense={toggleDense}
      />
    </div>
  );
}
