"use client";

import { useState, useCallback, useEffect } from "react";
import type { AdminSeverity, AdminTableName, AdminTableData } from "@/types/admin";
import type { ColumnDef } from "@/components/admin/data-quality/AdminDataTable";
import { AdminDataTable } from "@/components/admin/data-quality/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";

type CompletenessSummary = { total: number; avg_completeness: number; below_50_count: number };

/** rules/plan_dashboard.md §10 Phase 3 — extracted dari DataQualityTabsClient.tsx:
 * fetch/edit/merge/bulk-delete + completeness summary generik per table,
 * dipakai oleh kelima halaman entity baru (/admin/data/*) supaya logic-nya
 * tidak diduplikasi 5x. */
export function AdminEntityTablePage({
  table,
  eyebrow,
  title,
  description,
  columns,
  initialData,
  mergeable = false,
  hasCompleteness = false,
}: {
  table: AdminTableName;
  eyebrow: string;
  title: string;
  description: string;
  columns: ColumnDef[];
  initialData: AdminTableData;
  mergeable?: boolean;
  hasCompleteness?: boolean;
}) {
  const [data, setData] = useState<AdminTableData>(initialData);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<CompletenessSummary | null>(null);

  // rules/plan_database.md Step 2 — satu query agregat, bukan dihitung dari
  // rows yang sedang tampil (cuma 1 halaman).
  useEffect(() => {
    if (!hasCompleteness) return;
    fetch(`/api/v1/admin/tables/${table}/completeness-summary`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSummary(json.data);
      })
      .catch(() => { });
  }, [table, hasCompleteness]);

  const fetchTable = useCallback(async (params: Record<string, string | number | undefined> = {}) => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) sp.set(k, String(v));
      });
      const resp = await fetch(`/api/v1/admin/tables/${table}?${sp.toString()}`);
      const json = await resp.json();
      if (json.success) setData(json.data);
    } catch {
      // keep stale data
    }
    setLoading(false);
  }, [table]);

  const handleParamsChange = useCallback(
    (params: Record<string, string | number | undefined>) => {
      fetchTable({
        page: params.page ?? data.page ?? 1,
        per_page: params.per_page ?? data.per_page ?? 10,
        search: params.search ?? "",
        sort_by: params.sort_by ?? data.sort_by ?? "name",
        order: params.order ?? data.order ?? "asc",
      });
    },
    [data, fetchTable],
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
          setData((prev) => ({
            ...prev,
            rows: prev.rows.map((row: Record<string, unknown>) =>
              String(row.id) === rowId ? { ...row, [field]: value } : row,
            ),
          }));
          return true;
        }
      } catch {
        // fail silently
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
          fetchTable({ per_page: data.per_page ?? 10 });
          return { success: true };
        }
        return { success: false, message: json.message };
      } catch {
        return { success: false, message: "Gagal terhubung ke server." };
      }
    },
    [table, fetchTable, data.per_page],
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
          if (deleted.length) fetchTable({ per_page: data.per_page ?? 25 });
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
    [table, fetchTable, data.per_page],
  );

  const summarySeverity: AdminSeverity | null = summary
    ? summary.avg_completeness >= 80
      ? "good"
      : summary.avg_completeness >= 40
        ? "warning"
        : "danger"
    : null;
  const pills: { label: string; severity?: AdminSeverity }[] = [
    { label: `${data.total.toLocaleString()} ${title.toLowerCase()}` },
    ...(summary ? [{
      label: `${summary.avg_completeness}% avg completeness`,
      severity: summarySeverity ?? undefined,
    }] : []),
  ];

  return (
    <div>
      <AdminPageHeader eyebrow={eyebrow} title={title} description={description} pills={pills} />
      <AdminDataTable
        title={title}
        table={table}
        data={data}
        columns={columns}
        onParamsChange={handleParamsChange}
        onEdit={handleEdit}
        onMerge={mergeable ? handleMerge : undefined}
        onBulkDelete={mergeable ? handleBulkDelete : undefined}
        loading={loading}
      />
    </div>
  );
}
