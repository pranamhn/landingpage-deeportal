import Link from "next/link";

export default function Pagination({
  page,
  hasNext,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  hasNext: boolean;
  total?: number;
  basePath: string;
  searchParams: Record<string, string>;
}) {
  if (page <= 1 && !hasNext && (total ?? 0) <= 1) return null;

  const buildHref = (targetPage: number) => {
    const sp = new URLSearchParams(searchParams);
    if (targetPage <= 1) sp.delete("page");
    else sp.set("page", String(targetPage));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const navClass = "rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50";
  const disabledClass = "rounded-lg border border-gray-100 px-4 py-2 text-sm font-semibold text-gray-300";

  return (
    <nav className="mt-8 flex items-center justify-between" aria-label="Pagination">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={navClass}>← Previous</Link>
      ) : (
        <span className={disabledClass}>← Previous</span>
      )}
      <span className="text-sm font-medium text-muted">Page {page}{total ? ` of ${total}` : ""}</span>
      {hasNext ? (
        <Link href={buildHref(page + 1)} className={navClass}>Next →</Link>
      ) : (
        <span className={disabledClass}>Next →</span>
      )}
    </nav>
  );
}
