import Link from "next/link";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { isNotStated, extractDomain } from "@/lib/formatters/format";
import type { NewsEvent } from "@/types/company";

const NEWS_CATEGORY: Record<string, { label: string; variant: BadgeVariant }> = {
  launch: { label: "Launch", variant: "success" },
  acquisition: { label: "Acquisition", variant: "brand" },
  shutdown: { label: "Shutdown", variant: "danger" },
};

export default function SourceList({ events, companySlug, companyName }: { events: NewsEvent[]; companySlug: string; companyName: string }) {
  if (!events?.length) {
    return (
      <div className="py-8 text-center text-sm text-muted">
        <p>No related news yet.</p>
        <Link href={`/submit?kind=correction&entity_id=${companySlug}`} className="mt-1 inline-block text-brand-600 hover:underline">
          Have a news link about this? Help fill it in →
        </Link>
      </div>
    );
  }

  // Pipeline ingestion kadang isi title cuma dengan nama company itu sendiri
  // (bukan judul artikel asli) — kalau ketahuan begitu, tampilkan domain
  // sumbernya supaya tiap entri tidak terlihat duplikat semua.
  const isGenericTitle = (title: string | null | undefined) =>
    isNotStated(title) || title?.trim().toLowerCase() === companyName.trim().toLowerCase();

  return (
    <div className="space-y-2">
      {events.map((n: any) => {
        const domain = extractDomain(n.url);
        const generic = isGenericTitle(n.title);
        const label = generic ? domain || "Source" : n.title;
        const category = NEWS_CATEGORY[n.source];
        return (
          <div key={n.id} className="border-l-3 border-gray-200 rounded-r-lg bg-white/70 p-3 pl-4">
            <div className="flex items-center gap-2">
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:text-brand-600">
                {label} ↗
              </a>
              {category && <Badge variant={category.variant}>{category.label}</Badge>}
            </div>
            {!generic && domain && (
              <p className="mt-0.5 text-xs text-muted">
                Channel: <span className="font-medium text-gray-700">{domain}</span>
              </p>
            )}
            {!isNotStated(n.published_at) && (
              <p className="text-xs text-muted">
                Date Publish: <span className="font-medium text-gray-700">{n.published_at}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
