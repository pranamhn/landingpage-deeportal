import Link from "next/link";

const FILTER_LABELS: Record<string, string> = {
  q: "Search",
  sector: "Sector",
  location: "Location",
  status: "Status",
};

export default function ActiveFilterChips({
  basePath,
  searchParams,
}: {
  basePath: string;
  searchParams: Record<string, string>;
}) {
  const entries = Object.entries(searchParams).filter(([key, value]) => Boolean(value) && key !== "page");
  if (entries.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {entries.map(([key, value]) => {
        const sp = new URLSearchParams(searchParams);
        sp.delete(key);
        sp.delete("page");
        const qs = sp.toString();
        const href = qs ? `${basePath}?${qs}` : basePath;
        return (
          <Link
            key={key}
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
          >
            {FILTER_LABELS[key] ?? key}: {value}
            <span aria-hidden="true">×</span>
          </Link>
        );
      })}
    </div>
  );
}
