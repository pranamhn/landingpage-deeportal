import Link from "next/link";
import SaveSearchButton from "@/components/SaveSearchButton";

export default function ResultsSummary({
  count,
  hasActiveFilters,
  basePath,
  params,
  page,
  hasNext,
}: {
  count: number;
  hasActiveFilters: boolean;
  basePath: string;
  params: Record<string, string>;
  page: number;
  hasNext: boolean;
}) {
  const buildHref = (targetPage: number) => {
    const sp = new URLSearchParams(params);
    if (targetPage <= 1) sp.delete("page");
    else sp.set("page", String(targetPage));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const navClass = "rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50";
  const disabledClass = "rounded-lg border border-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-300";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/60 px-4 py-2 text-sm shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span><strong>{count}</strong> companies on this page</span>
        {hasActiveFilters && <SaveSearchButton params={params} />}
        {hasActiveFilters && (
          <Link href={basePath} className="text-brand-600 hover:underline">Clear all filters</Link>
        )}
      </div>

      {(page > 1 || hasNext) && (
        <div className="flex items-center gap-2" aria-label="Pagination">
          {page > 1 ? (
            <Link href={buildHref(page - 1)} className={navClass}>← Previous</Link>
          ) : (
            <span className={disabledClass}>← Previous</span>
          )}
          <span className="text-xs font-medium text-muted">Page {page}</span>
          {hasNext ? (
            <Link href={buildHref(page + 1)} className={navClass}>Next →</Link>
          ) : (
            <span className={disabledClass}>Next →</span>
          )}
        </div>
      )}
    </div>
  );
}
