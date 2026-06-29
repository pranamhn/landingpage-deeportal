import { getInvestors } from "@/lib/api/companiesService";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";
import { formatCurrencyAbbrev, formatFullAmount } from "@/lib/formatters/format";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Investors — Deeportal", description: "List of investors involved in funding Asian startups." };

const PAGE_SIZE = 30;

export default async function InvestorsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const query = params.q || "";
  const typeFilter = params.type || "";
  const sectorFilter = params.sector || "";

  const result = await getInvestors(PAGE_SIZE * 3, 1); // fetch more for in-memory filtering
  const allInvestors = result.success ? result.data : [];

  const types = [...new Set(allInvestors.map((inv: any) => inv.type).filter(Boolean))].sort();
  const sectors = [...new Set(
    allInvestors.flatMap((inv: any) => (inv.sector_focus ? inv.sector_focus.split(",").map((s: string) => s.trim()) : []))
      .filter(Boolean)
  )].sort();

  let filtered = allInvestors;
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((inv: any) => (inv.name || "").toLowerCase().includes(q));
  }
  if (typeFilter) {
    filtered = filtered.filter((inv: any) => inv.type === typeFilter);
  }
  if (sectorFilter) {
    filtered = filtered.filter((inv: any) =>
      (inv.sector_focus || "").split(",").map((s: string) => s.trim()).includes(sectorFilter)
    );
  }

  const totalFiltered = filtered.length;
  const investors = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasNext = page * PAGE_SIZE < totalFiltered;

  return (
    <div>
      <section className="mb-8">
        <h1 className="font-display text-display-page font-bold">Investors</h1>
        <p className="mt-2 text-muted">Investors active in the Asian startup ecosystem.</p>
      </section>

      <div className="mb-6">
        <form action="/investors" method="GET" className="flex w-full items-stretch gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          <label htmlFor="investor-search" className="sr-only">Search investors</label>
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              id="investor-search"
              name="q"
              type="search"
              placeholder="Search by investor name..."
              defaultValue={query}
              className="h-full w-full rounded-xl border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
          <div className="hidden h-8 w-px self-center bg-gray-200 sm:block" />
          {types.length > 0 && (
            <AutoSubmitSelect name="type" defaultValue={typeFilter} className="w-48 cursor-pointer rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 capitalize focus:outline-none focus:ring-2 focus:ring-brand-100">
              <option value="">All Types</option>
              {types.map((t: string) => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </AutoSubmitSelect>
          )}
          {sectors.length > 0 && (
            <AutoSubmitSelect name="sector" defaultValue={sectorFilter} className="w-56 cursor-pointer rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-100">
              <option value="">All Sector Focus</option>
              {sectors.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </AutoSubmitSelect>
          )}
          <button type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Search
          </button>
          {(query || typeFilter || sectorFilter) && (
            <a href="/investors" className="inline-flex items-center px-2 text-sm text-muted hover:text-brand-600">Clear</a>
          )}
        </form>
      </div>

      {investors.length === 0 ? (
        <div className="card py-10 text-center">
          <p className="text-sm font-medium text-gray-400">{query ? `No results for "${query}"` : "No investor data yet."}</p>
          {query && <a href="/investors" className="mt-2 inline-block text-sm text-brand-600 hover:underline">Clear search</a>}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {investors.map((inv: any) => {
            const hasFund = Boolean(inv.fund_size_usd && inv.fund_size_usd > 0);
            const roundCount = inv.funding_round_count ?? 0;
            const desc = inv.description?.trim();
            const stages = inv.stage_focus ? inv.stage_focus.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
            const sectors = inv.sector_focus ? inv.sector_focus.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
            return (
              <Link key={inv.id} href={`/investors/${inv.slug}`} className="card block transition hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-heading-card font-bold">{inv.name}</h2>
                  {hasFund && (
                    <span
                      className="shrink-0 font-display text-sm font-extrabold text-success-600"
                      title={formatFullAmount(inv.fund_size_usd)}
                    >
                      {formatCurrencyAbbrev(inv.fund_size_usd)}
                    </span>
                  )}
                </div>
                {inv.type && <p className="mt-1 text-sm font-medium text-muted capitalize">{inv.type}</p>}
                {desc && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{desc}</p>}
                {(inv.location || inv.founded_year) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {inv.location && <Badge variant="neutral">{inv.location}</Badge>}
                    {inv.founded_year && <Badge variant="neutral">Founded {inv.founded_year}</Badge>}
                    {stages.slice(0, 2).map((s: string) => <Badge key={s} variant="info">{s}</Badge>)}
                    {sectors.slice(0, 2).map((s: string) => <Badge key={s} variant="success">{s}</Badge>)}
                  </div>
                )}
                {inv.website && (
                  <p className="mt-1.5 truncate text-xs text-brand-600">{inv.website.replace(/^https?:\/\//, "")}</p>
                )}
                <p className="mt-2 text-sm font-medium text-brand-600">
                  {inv.portfolio_count ?? inv.portfolio?.length ?? 0} portfolio
                  {roundCount > 0 && ` · ${roundCount} funding round`}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        hasNext={hasNext}
        total={Math.ceil(totalFiltered / PAGE_SIZE)}
        basePath="/investors"
        searchParams={{ ...params, q: query, type: typeFilter, sector: sectorFilter }}
      />
    </div>
  );
}
