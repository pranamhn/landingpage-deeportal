import { getAcquisitions } from "@/services/index";
import { extractDomain, formatCurrencyAbbrev, formatFullAmount } from "@/lib/formatters/format";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Acquisitions — DeePortal.ai", description: "Acquisition activity in the Asian startup ecosystem." };

const PAGE_SIZE = 20;

interface AcquisitionRecord {
  id: string;
  acquiree_name: string;
  acquiree_slug: string;
  acquirer_company_id?: string | null;
  acquirer_name: string;
  amount_usd?: number | null;
  announced_date?: string | null;
  source_published_at?: string | null;
  source_url?: string | null;
}

function formatAcquisitionDate(value?: string | null) {
  if (!value) return null;
  const normalized = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
    return new Date(`${normalized.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  if (/^\d{4}-\d{2}$/.test(normalized)) {
    return new Date(`${normalized}-01T00:00:00Z`).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  if (/^\d{4}$/.test(normalized)) return normalized;
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  return normalized;
}

function acquisitionYear(value?: string | null) {
  const match = value?.match(/^\d{4}/);
  if (match?.[0]) return match[0];
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return String(parsed.getUTCFullYear());
  }
  return "Date not available";
}

function effectiveAcquisitionDate(acquisition: AcquisitionRecord) {
  return acquisition.announced_date?.trim() || acquisition.source_published_at?.trim() || null;
}

export default async function AcquisitionsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const result = await getAcquisitions(PAGE_SIZE, page);
  const acquisitions = (result.success ? result.data : []) as AcquisitionRecord[];
  const hasNext = acquisitions.length === PAGE_SIZE;
  const disclosed = acquisitions.filter((acquisition) => Boolean(acquisition.amount_usd));
  const disclosedTotal = disclosed.reduce((sum, acquisition) => sum + (acquisition.amount_usd || 0), 0);
  const grouped = acquisitions.reduce<Map<string, AcquisitionRecord[]>>((groups, acquisition) => {
    const year = acquisitionYear(effectiveAcquisitionDate(acquisition));
    groups.set(year, [...(groups.get(year) || []), acquisition]);
    return groups;
  }, new Map());

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div>
          <p className="eyebrow">Corporate transactions</p>
          <h1 className="mt-2 font-display text-display-page font-bold">Startup acquisitions</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Track acquired companies, the buyers, announced deal value, and the source of the information.
          </p>
        </div>
        <div className="card grid grid-cols-3 gap-3 p-5">
          <div className="border-l-2 border-brand-500 pl-3">
            <strong className="block font-display text-xl font-extrabold text-brand-600">{acquisitions.length}</strong>
            <span className="text-xs font-semibold text-muted">Transactions on this page</span>
          </div>
          <div className="border-l-2 border-accent-500 pl-3">
            <strong className="block font-display text-xl font-extrabold text-accent-500">{disclosed.length}</strong>
            <span className="text-xs font-semibold text-muted">Amount disclosed</span>
          </div>
          <div className="border-l-2 border-brand-500 pl-3">
            <strong className="block font-display text-xl font-extrabold text-brand-600">{disclosedTotal ? formatCurrencyAbbrev(disclosedTotal) : "—"}</strong>
            <span className="text-xs font-semibold text-muted">Total disclosed</span>
          </div>
        </div>
      </section>

      {acquisitions.length === 0 ? (
        <EmptyState
          title="No acquisition data yet"
          description="New transaction data will appear once the source has been verified."
          action={<Link href="/submit" className="font-semibold text-brand-600 hover:underline">Submit acquisition info →</Link>}
        />
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries())
            .sort(([a], [b]) => {
              if (a === "Date not available") return 1;
              if (b === "Date not available") return -1;
              return b.localeCompare(a);
            })
            .map(([year, yearAcquisitions]) => (
              <section key={year} aria-labelledby={`acquisitions-${year.replaceAll(" ", "-")}`}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 id={`acquisitions-${year.replaceAll(" ", "-")}`} className="font-display text-heading-section font-bold">{year}</h2>
                  <span className="h-px flex-1 bg-black/10" />
                  <span className="text-xs font-semibold text-muted">{yearAcquisitions.length} transactions</span>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {yearAcquisitions.map((acquisition) => {
                    const effectiveDate = effectiveAcquisitionDate(acquisition);
                    const usesSourceDate = !acquisition.announced_date?.trim() && Boolean(acquisition.source_published_at?.trim());
                    const formattedDate = formatAcquisitionDate(effectiveDate);
                    const sourceDomain = extractDomain(acquisition.source_url);
                    return (
                      <article key={acquisition.id} className="card flex flex-col gap-5 p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          {formattedDate ? (
                            <div>
                              <time dateTime={effectiveDate || undefined} className="text-sm font-semibold text-muted">{formattedDate}</time>
                              {usesSourceDate && <span className="ml-2 text-xs text-muted">News date</span>}
                            </div>
                          ) : (
                            <span className="text-sm text-muted">Date not announced</span>
                          )}
                          <Badge variant={acquisition.amount_usd ? "success" : "neutral"} className="shrink-0 font-bold tabular-nums" >
                            {acquisition.amount_usd ? formatCurrencyAbbrev(acquisition.amount_usd) : "Amount not announced"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-muted">Acquirer</span>
                            {acquisition.acquirer_company_id ? (
                              <Link href={`/companies/${acquisition.acquirer_company_id}`} className="mt-1 block truncate font-display text-lg font-bold hover:text-brand-600">
                                {acquisition.acquirer_name || "Unknown"}
                              </Link>
                            ) : (
                              <strong className="mt-1 block truncate font-display text-lg">{acquisition.acquirer_name || "Unknown"}</strong>
                            )}
                          </div>
                          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-600">→</span>
                          <div className="min-w-0 text-right">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-muted">Target</span>
                            <Link href={`/companies/${acquisition.acquiree_slug}`} className="mt-1 block truncate font-display text-lg font-bold hover:text-brand-600">
                              {acquisition.acquiree_name || "Unknown"}
                            </Link>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/10 pt-3 text-xs text-muted">
                          <span>{acquisition.amount_usd ? `Full amount: ${formatFullAmount(acquisition.amount_usd)}` : "Amount not available yet"}</span>
                          {acquisition.source_url && (
                            <a href={acquisition.source_url} target="_blank" rel="noopener noreferrer" className="shrink-0 font-semibold text-brand-600 hover:underline">
                              {sourceDomain || "View source"} ↗
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}

      {acquisitions.length > 0 && <Pagination page={page} hasNext={hasNext} basePath="/acquisitions" searchParams={params} />}
    </div>
  );
}
