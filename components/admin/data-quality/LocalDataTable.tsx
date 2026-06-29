"use client";

import { useState, useMemo, useCallback } from "react";
import { AdminTableToolbar } from "@/components/admin/data-quality/AdminTableToolbar";
import { AdminTablePagination } from "@/components/admin/data-quality/AdminTablePagination";
import { exportRowsToCsv } from "@/lib/exportCsv";
import { adminTableHeaderDark, adminTableRowDark, adminTableRowAltDark, adminTableHoverDark } from "@/components/admin/ui/adminTheme";
import { cn } from "@/lib/cn";

export interface LocalColumn {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  width?: string;
}

interface LocalDataTableProps {
  title: string;
  rows: Record<string, unknown>[];
  columns: LocalColumn[];
  defaultPerPage?: number;
  /** Show checkbox column (default false) */
  showCheckbox?: boolean;
  /** Row density toggle */
  dense?: boolean;
  onToggleDense?: () => void;
  /** Column visibility */
  columnKeys?: string[];
  visibleColumns?: Set<string>;
  onToggleColumn?: (key: string) => void;
  /** Refresh callback */
  onRefresh?: () => void;
  /** Last updated text */
  lastUpdated?: string;
  /** Row key for checkbox selection */
  rowKey?: string;
}

/** Reusable local-data table with same visual style as AdminDataTable.
 * For data that's already fully loaded (no server pagination). */
export function LocalDataTable({
  title,
  rows,
  columns,
  defaultPerPage = 10,
  showCheckbox = false,
  dense: denseProp,
  onToggleDense,
  columnKeys,
  visibleColumns,
  onToggleColumn,
  onRefresh,
  lastUpdated,
  rowKey = "id",
}: LocalDataTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [denseLocal, setDenseLocal] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const dense = denseProp ?? denseLocal;
  const handleToggleDense = onToggleDense ?? (() => setDenseLocal((p) => !p));

  const filtered = useMemo(() => {
    let result = rows;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q))
      );
    }
    if (sortBy) {
      result = [...result].sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortOrder === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [rows, search, columns, sortBy, sortOrder]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * defaultPerPage, page * defaultPerPage);

  const toggleSelectAll = () => {
    const ids = paged.map((r) => String(r[rowKey] ?? ""));
    if (ids.length > 0 && ids.every((id) => selected.has(id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ids));
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (colKey: string) => {
    if (sortBy === colKey) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(colKey);
      setSortOrder("asc");
    }
  };

  const handleExport = useCallback(() => {
    const rowsToExport = selected.size
      ? rows.filter((r) => selected.has(String(r[rowKey] ?? "")))
      : rows;
    exportRowsToCsv(rowsToExport, columns, `${title.toLowerCase().replace(/\s+/g, "-")}.csv`);
  }, [rows, selected, columns, title, rowKey]);

  const canSelect = showCheckbox;

  return (
    <div>
      {/* Bulk action bar */}
      {canSelect && selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800 dark:bg-brand-900/30">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">{selected.size} row dipilih</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              Export {selected.size} rows
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 shadow-lg dark:border-gray-700 dark:shadow-gray-900/50 dark:bg-gray-800">
        <AdminTableToolbar
          title={title}
          total={total}
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          onRefresh={onRefresh}
          onExport={handleExport}
          lastUpdated={lastUpdated}
          columnKeys={columnKeys}
          visibleColumns={visibleColumns}
          onToggleColumn={onToggleColumn}
          dense={dense}
          onToggleDense={handleToggleDense}
        />
        <div className="overflow-x-auto">
          {paged.length ? (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className={cn("bg-gradient-to-r from-gray-50 to-gray-100", adminTableHeaderDark)}>
                  {canSelect && (
                    <th className={cn("w-10 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-2.5 first:rounded-tl-lg", "dark:from-gray-700 dark:to-gray-600")}>
                      <input
                        type="checkbox"
                        checked={paged.length > 0 && paged.every((r) => selected.has(String(r[rowKey] ?? "")))}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 cursor-pointer select-none",
                      )}
                      style={col.width ? { width: col.width } : undefined}
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {col.label}
                        <svg
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            sortBy === col.key ? "text-brand-600" : "text-gray-400",
                          )}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          {sortBy === col.key && sortOrder === "asc" ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 9 5-5 5 5" />
                          ) : sortBy === col.key ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 15 5 5 5-5" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 15 5 5 5-5M7 9l5-5 5 5" />
                          )}
                        </svg>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paged.map((row, idx) => {
                  const id = String(row[rowKey] ?? idx);
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
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            "truncate text-gray-800 dark:text-gray-200",
                            dense ? "max-w-[250px] px-3 py-1 text-xs" : "max-w-[300px] px-4 py-2 text-sm",
                          )}
                        >
                          {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              {search ? "No matching results." : "No data."}
            </div>
          )}
        </div>
      </div>

      <AdminTablePagination page={page} perPage={defaultPerPage} total={total} onPageChange={setPage} />
    </div>
  );
}
