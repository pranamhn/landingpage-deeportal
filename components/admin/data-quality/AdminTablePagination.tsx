"use client";

import { cn } from "@/lib/cn";

/** rules/plan_database.md — footer "Showing X to Y of Z results" + pill
 * pagination (first/prev/numbered/next/last), dipisah dari AdminDataTable
 * supaya bisa dipakai standalone di tabel lain. */
export function AdminTablePagination({
  page,
  perPage,
  total,
  onPageChange,
}: {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const pageNumbers = (): number[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <strong className="font-semibold text-gray-900 dark:text-gray-200">{from}</strong> to{" "}
        <strong className="font-semibold text-gray-900 dark:text-gray-200">{to}</strong> of{" "}
        <strong className="font-semibold text-gray-900 dark:text-gray-200">{total.toLocaleString()}</strong> results
      </p>
      <div className="flex items-center gap-1.5">
        <PageButton onClick={() => onPageChange(1)} disabled={page <= 1} title="First page">
          «
        </PageButton>
        <PageButton onClick={() => onPageChange(page - 1)} disabled={page <= 1} title="Previous page">
          ‹
        </PageButton>
        {pageNumbers().map((n) => (
          <PageButton key={n} onClick={() => onPageChange(n)} active={n === page}>
            {n}
          </PageButton>
        ))}
        <PageButton onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} title="Next page">
          ›
        </PageButton>
        <PageButton onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} title="Last page">
          »
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-brand-600 text-white"
          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
      )}
    >
      {children}
    </button>
  );
}
