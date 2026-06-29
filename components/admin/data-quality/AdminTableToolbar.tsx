"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { adminTableToolbarDark, adminSearchInputDark, adminToolbarBgDark } from "@/components/admin/ui/adminTheme";

/** rules/plan_database.md — header tabel reusable (title + search + ikon
 * filter/refresh/export), dipisah dari AdminDataTable supaya bisa dipakai
 * standalone di tabel lain juga, bukan cuma di /admin/data-quality. */
export function AdminTableToolbar({
  title,
  total,
  search,
  onSearchChange,
  onRefresh,
  onExport,
  lastUpdated,
  columnKeys,
  visibleColumns,
  onToggleColumn,
  dense,
  onToggleDense,
}: {
  title: string;
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  lastUpdated?: string;
  columnKeys?: string[];
  visibleColumns?: Set<string>;
  onToggleColumn?: (key: string) => void;
  dense?: boolean;
  onToggleDense?: () => void;
}) {
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  return (
    <div className={cn("flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between", adminTableToolbarDark)}>
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Total {total.toLocaleString()} records
          {lastUpdated && <span className="ml-2 text-gray-400">· Updated {lastUpdated}</span>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative group w-full sm:w-64">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-brand-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10A7 7 0 1 1 3 10a7 7 0 0 1 14 0Z" />
          </svg>
          <input
            type="text"
            placeholder="Search here..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            data-admin-search
            className={cn("w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-brand-500", adminSearchInputDark)}
          />
        </div>
        <div className={cn("flex items-center gap-1 rounded-xl bg-gray-50 p-1", adminToolbarBgDark)}>
          {/* Row density toggle (7.1) */}
          {onToggleDense && (
            <ToolbarIconButton label={dense ? "Default density" : "Compact density"} onClick={onToggleDense}>
              {/* lucide: shrink (compact) / stretch-horizontal (normal) */}
              {dense ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16M4 12h16" />
              )}
            </ToolbarIconButton>
          )}
          {/* Column visibility toggle */}
          {columnKeys && visibleColumns && onToggleColumn && (
            <div className="relative">
              <ToolbarIconButton
                label="Columns"
                onClick={() => setColMenuOpen((p) => !p)}
              >
                {/* lucide: columns-3 */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4m6-18h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M9 3v18M15 3v18" />
              </ToolbarIconButton>
              {colMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 bg-white shadow-xl z-50 py-1 dark:border-gray-600 dark:bg-gray-800">
                  {columnKeys.map((key) => (
                    <label key={key} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(key)}
                        onChange={() => onToggleColumn(key)}
                        className="rounded"
                      />
                      {key}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          <ToolbarIconButton label="Refresh" onClick={onRefresh}>
            {/* lucide: refresh-cw */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8m18 4h-4M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M3 12h4" />
          </ToolbarIconButton>
          {/* Download dropdown (7.6) */}
          {onExport && (
            <div className="relative">
              <ToolbarIconButton label="Download" onClick={() => setExportOpen((p) => !p)}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </ToolbarIconButton>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-200 bg-white shadow-xl z-50 py-1 dark:border-gray-600 dark:bg-gray-800">
                  <button onClick={() => { onExport(); setExportOpen(false); }} className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                    Export current page
                  </button>
                  <button onClick={() => { onExport(); setExportOpen(false); }} className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                    Export all {total.toLocaleString()} results
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-600 my-1" />
                  <button onClick={() => { onExport(); setExportOpen(false); }} className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolbarIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        "rounded-lg p-2.5 text-gray-600 transition-all duration-200",
        "hover:bg-white hover:text-brand-600 hover:shadow-sm",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none",
      )}
    >
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {children}
      </svg>
    </button>
  );
}
