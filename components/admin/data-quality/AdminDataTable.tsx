"use client";

import { useState, useCallback } from "react";
import type { AdminTableName, AdminTableData } from "@/types/admin";
import { AdminTableToolbar } from "@/components/admin/data-quality/AdminTableToolbar";
import { AdminTablePagination } from "@/components/admin/data-quality/AdminTablePagination";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { exportRowsToCsv } from "@/lib/exportCsv";
import { adminTableHeaderDark, adminTableRowDark, adminTableRowAltDark, adminTableHoverDark } from "@/components/admin/ui/adminTheme";
import { cn } from "@/lib/cn";

export interface ColumnDef<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  /** Custom render — return React node or string */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** If true, this column can be edited inline */
  editable?: boolean;
}

interface AdminDataTableProps<T = Record<string, unknown>> {
  title: string;
  table: AdminTableName;
  data: AdminTableData<T>;
  columns: ColumnDef<T>[];
  /** Called when sort/page/search changes — parent re-fetches */
  onParamsChange: (params: { page?: number; search?: string; sort_by?: string; order?: string }) => void;
  /** Called when user saves an inline edit */
  onEdit?: (rowId: string, field: string, value: string) => Promise<boolean>;
  /** rules/plan_database.md Step 3 — kalau diisi, checkbox + toolbar merge
   * muncul. Tidak diisi (lists/submissions) = tidak ada checkbox sama sekali. */
  onMerge?: (primaryId: string, duplicateIds: string[]) => Promise<{ success: boolean; message?: string }>;
  /** Bulk delete — beda dari merge: berlaku mulai dari 1 row terpilih. */
  onBulkDelete?: (ids: string[]) => Promise<{ success: boolean; message?: string }>;
  loading?: boolean;
  rowKey?: string;
  /** Column visibility (6.3) */
  columnKeys?: string[];
  visibleColumns?: Set<string>;
  onToggleColumn?: (key: string) => void;
  lastUpdated?: string;
  /** Row density (7.1) */
  dense?: boolean;
  onToggleDense?: () => void;
}

export function AdminDataTable<T extends Record<string, unknown>>({
  title,
  table,
  data,
  columns,
  onParamsChange,
  onEdit,
  onMerge,
  onBulkDelete,
  loading = false,
  rowKey = "id",
  columnKeys,
  visibleColumns,
  onToggleColumn,
  lastUpdated,
  dense = false,
  onToggleDense,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [activeModal, setActiveModal] = useState<"merge" | "delete" | "bulkEdit" | null>(null);
  const [bulkEditField, setBulkEditField] = useState("");
  const [bulkEditValue, setBulkEditValue] = useState("");

  const rowLabel = (row: Record<string, unknown>) => String(row.name ?? row.id ?? "");
  const canSelect = Boolean(onMerge || onBulkDelete);

  const clearSelection = () => {
    setSelected(new Set());
    setPrimaryId(null);
    setActionMessage("");
    setActiveModal(null);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setPrimaryId((p) => (p === id ? (next.size ? Array.from(next)[0] : null) : p));
      } else {
        next.add(id);
        setPrimaryId((p) => p ?? id);
      }
      return next;
    });
    setActionMessage("");
  };

  const toggleSelectAll = () => {
    const ids = data.rows.map((r) => String((r as Record<string, unknown>)[rowKey] ?? ""));
    if (selected.size === ids.length && ids.length > 0) {
      clearSelection();
    } else {
      setSelected(new Set(ids));
      setPrimaryId(ids[0] ?? null);
      setActionMessage("");
    }
  };

  const handleMerge = async () => {
    if (!onMerge || !primaryId || selected.size < 2) return;
    setBusy(true);
    setActionMessage("");
    const duplicateIds = Array.from(selected).filter((id) => id !== primaryId);
    const result = await onMerge(primaryId, duplicateIds);
    setBusy(false);
    if (result.success) {
      clearSelection();
      onParamsChange({});
    } else {
      setActionMessage(result.message || "Gagal menggabungkan row.");
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selected.size === 0) return;
    setBusy(true);
    setActionMessage("");
    const result = await onBulkDelete(Array.from(selected));
    setBusy(false);
    if (result.success) {
      clearSelection();
      onParamsChange({});
    } else {
      setActionMessage(result.message || "Gagal menghapus row.");
    }
  };

  const handleExportSelection = () => {
    const rowsToExport = selected.size
      ? data.rows.filter((r) => selected.has(String((r as Record<string, unknown>)[rowKey] ?? "")))
      : data.rows;
    exportRowsToCsv(rowsToExport, columns, `export.csv`);
  };

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      onParamsChange({ search: value, page: 1 });
    },
    [onParamsChange],
  );

  const handleSort = useCallback(
    (col: string) => {
      const order = data.sort_by === col && data.order === "asc" ? "desc" : "asc";
      onParamsChange({ sort_by: col, order });
    },
    [data.sort_by, data.order, onParamsChange],
  );

  const handlePage = useCallback(
    (page: number) => {
      onParamsChange({ page });
    },
    [onParamsChange],
  );

  const handleRefresh = useCallback(() => {
    onParamsChange({});
  }, [onParamsChange]);

  const startEdit = (rowId: string, field: string, currentValue: unknown) => {
    setEditingCell({ rowId, field });
    setEditValue(String(currentValue ?? ""));
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingCell || !onEdit) return;
    setSaving(true);
    const ok = await onEdit(editingCell.rowId, editingCell.field, editValue);
    setSaving(false);
    if (ok) {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const extraColSpan = canSelect ? 1 : 0;

  return (
    <div>
      {/* Bulk action bar — slim, buka popup card buat detail tiap aksi
       * (rules/plan_database.md "bulk action buat popup card supaya lebih
       * mudah" — sebelumnya panel inline mendorong tabel ke bawah). */}
      {canSelect && selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800 dark:bg-brand-900/30">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">{selected.size} row dipilih</span>
          <div className="flex flex-wrap items-center gap-2">
            {onMerge && (
              <button
                onClick={() => setActiveModal("merge")}
                disabled={selected.size < 2}
                title={selected.size < 2 ? "Pilih minimal 2 row untuk merge" : undefined}
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Merge…
              </button>
            )}
            {onEdit && selected.size > 1 && (
              <button
                onClick={() => { setBulkEditField(""); setBulkEditValue(""); setActiveModal("bulkEdit"); }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Edit {selected.size} rows…
              </button>
            )}
            <button
              onClick={handleExportSelection}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Export {selected.size} rows
            </button>
            {onBulkDelete && (
              <button
                onClick={() => setActiveModal("delete")}
                className="rounded-lg border border-danger-300 bg-white px-4 py-2 text-xs font-semibold text-danger-600 hover:bg-danger-50"
              >
                Delete…
              </button>
            )}
            <button
              onClick={clearSelection}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {activeModal === "merge" && onMerge && (
        <AdminModal title={`Merge ${selected.size} rows`} onClose={() => (busy ? null : setActiveModal(null))}>
          <p className="mb-3 text-sm text-gray-600">Pilih row yang dipertahankan (primary) — sisanya digabung ke dalamnya:</p>
          <div className="mb-4 space-y-2">
            {data.rows
              .filter((r) => selected.has(String((r as Record<string, unknown>)[rowKey] ?? "")))
              .map((r) => {
                const id = String((r as Record<string, unknown>)[rowKey] ?? "");
                return (
                  <label key={id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="merge-primary"
                      checked={primaryId === id}
                      onChange={() => setPrimaryId(id)}
                    />
                    {rowLabel(r as Record<string, unknown>)}
                  </label>
                );
              })}
          </div>
          {actionMessage && <p className="mb-3 text-sm text-danger-600">{actionMessage}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setActiveModal(null)}
              disabled={busy}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              onClick={handleMerge}
              disabled={busy || !primaryId}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? "Menggabungkan..." : "Merge"}
            </button>
          </div>
        </AdminModal>
      )}

      {activeModal === "delete" && onBulkDelete && (
        <AdminModal title={`Delete ${selected.size} rows`} onClose={() => (busy ? null : setActiveModal(null))}>
          <p className="mb-4 text-sm text-gray-600">
            Yakin hapus {selected.size} row ini? Row yang masih punya relasi (funding round, news, dll) akan
            ditolak otomatis dan tidak ikut terhapus.
          </p>
          {actionMessage && <p className="mb-3 text-sm text-danger-600">{actionMessage}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setActiveModal(null)}
              disabled={busy}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={busy}
              className="rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50"
            >
              {busy ? "Menghapus..." : "Ya, hapus"}
            </button>
          </div>
        </AdminModal>
      )}

      {activeModal === "bulkEdit" && onEdit && (
        <AdminModal title={`Edit ${selected.size} rows`} onClose={() => (busy ? null : setActiveModal(null))}>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Pilih field dan value yang akan diterapkan ke semua row terpilih:</p>
          <div className="mb-4 space-y-3">
            <select
              value={bulkEditField}
              onChange={(e) => setBulkEditField(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="">Pilih field...</option>
              {columns.filter((c) => c.editable).map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            {bulkEditField && (
              <input
                type="text"
                placeholder="Nilai baru..."
                value={bulkEditValue}
                onChange={(e) => setBulkEditValue(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            )}
          </div>
          {actionMessage && <p className="mb-3 text-sm text-danger-600">{actionMessage}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setActiveModal(null)}
              disabled={busy}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                if (!bulkEditField || !bulkEditValue.trim()) return;
                setBusy(true);
                setActionMessage("");
                const ids = Array.from(selected);
                let ok = 0;
                for (const id of ids) {
                  const result = await onEdit(id, bulkEditField, bulkEditValue);
                  if (result) ok++;
                }
                setBusy(false);
                setActionMessage(`${ok} dari ${ids.length} row berhasil diupdate.`);
                if (ok > 0) clearSelection();
              }}
              disabled={busy || !bulkEditField || !bulkEditValue.trim()}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </AdminModal>
      )}

      {/* Card: toolbar (header) + table, satu kesatuan rounded-xl shadow-lg */}
      <div className="overflow-hidden rounded-xl border border-gray-100 shadow-lg dark:border-gray-700 dark:shadow-gray-900/50 dark:bg-gray-800">
        <AdminTableToolbar
          title={title}
          total={data.total}
          search={search}
          onSearchChange={handleSearch}
          onRefresh={handleRefresh}
          onExport={handleExportSelection}
          lastUpdated={lastUpdated}
          columnKeys={columnKeys}
          visibleColumns={visibleColumns}
          onToggleColumn={onToggleColumn}
          dense={dense}
          onToggleDense={onToggleDense}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className={cn("bg-gradient-to-r from-gray-50 to-gray-100", adminTableHeaderDark)}>
                {canSelect && (
                  <th className={cn("w-10 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-2.5 first:rounded-tl-lg", "dark:from-gray-700 dark:to-gray-600")}>
                    <input
                      type="checkbox"
                      checked={selected.size > 0 && selected.size === data.rows.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300",
                      col.sortable && "cursor-pointer select-none",
                    )}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        <svg
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            data.sort_by === col.key ? "text-brand-600" : "text-gray-400",
                          )}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          {data.sort_by === col.key && data.order === "asc" ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 9 5-5 5 5" />
                          ) : data.sort_by === col.key ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 15 5 5 5-5" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 15 5 5 5-5M7 9l5-5 5 5" />
                          )}
                        </svg>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + extraColSpan} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : data.rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + extraColSpan} className="px-4 py-16 text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No data found</p>
                    {search ? (
                      <p className="mt-1 text-xs text-gray-400">Try adjusting your search or filters.</p>
                    ) : table === "companies" ? (
                      <p className="mt-1 text-xs text-gray-400">Companies are auto-detected from news articles. Run ingestion to populate.</p>
                    ) : table === "lists" ? (
                      <p className="mt-1 text-xs text-gray-400">Create your first curated list to group companies together.</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400">Data will appear here once records are created.</p>
                    )}
                  </td>
                </tr>
              ) : (
                data.rows.map((row, idx) => {
                  const id = String(row[rowKey] ?? "");
                  return (
                    <tr
                      key={id}
                      className={cn(
                        "transition-all duration-200 hover:bg-gradient-to-r hover:from-brand-50/30 hover:to-white dark:hover:from-brand-900/20 dark:hover:to-gray-800",
                        idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50",
                        adminTableRowDark,
                        adminTableHoverDark,
                      )}
                    >
                      {canSelect && (
                        <td className={dense ? "px-3 py-1" : "px-4 py-2"}>
                          <input type="checkbox" checked={selected.has(id)} onChange={() => toggleSelect(id)} />
                        </td>
                      )}
                      {columns.map((col) => {
                        const isEditing =
                          editingCell?.rowId === id && editingCell?.field === col.key;

                        if (isEditing && col.editable && onEdit) {
                          return (
                            <td key={col.key} className={dense ? "px-3 py-1" : "px-4 py-2"}>
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full rounded border border-brand-300 bg-brand-50 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-200"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEdit();
                                    if (e.key === "Escape") cancelEdit();
                                  }}
                                  disabled={saving}
                                />
                                <button
                                  onClick={saveEdit}
                                  disabled={saving}
                                  className="shrink-0 rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  disabled={saving}
                                  className="shrink-0 rounded bg-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-300"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          );
                        }

                        const value = row[col.key];
                        const display = col.render
                          ? col.render(value, row)
                          : value != null
                            ? String(value)
                            : "—";

                        return (
                          <td
                            key={col.key}
                            className={cn(
                              "truncate text-gray-800 dark:text-gray-200",
                              dense ? "max-w-[250px] px-3 py-1 text-xs" : "max-w-[300px] px-4 py-2 text-sm",
                              col.editable &&
                              onEdit &&
                              "cursor-pointer hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-300",
                            )}
                            title={col.editable ? "Click to edit" : undefined}
                            onClick={() => {
                              if (col.editable && onEdit) {
                                startEdit(id, col.key, value);
                              }
                            }}
                          >
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminTablePagination page={data.page} perPage={data.per_page} total={data.total} onPageChange={handlePage} />
    </div>
  );
}
