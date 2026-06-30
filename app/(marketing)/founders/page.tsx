import { getPeople } from "@/lib/api/companiesService";
import { getStats } from "@/lib/api/statsService";
import Pagination from "@/components/ui/Pagination";
import FormSearchableSelect from "@/components/form/FormSearchableSelect";
import { formatRole } from "@/lib/formatters/format";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Founders — DeePortal.ai", description: "Track founders and key executives behind Asia's fastest-growing startups." };

const PAGE_SIZE = 20;

export default async function PeoplePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const query = params.q || "";
  const sectorFilter = params.sector || "";
  const roleFilter = params.role || "";

  const [peopleResult, statsResult] = await Promise.all([
    getPeople(PAGE_SIZE * 3, 1), // Fetch more for client-side filtering
    getStats(),
  ]);
  const allPeople = peopleResult.success ? peopleResult.data : [];

  // Extract unique sectors and roles for dropdowns
  const sectors = [...new Set(allPeople.map((p: any) => p.sector).filter(Boolean))].sort();
  const roles = [...new Set(allPeople.map((p: any) => p.role).filter(Boolean))].sort();

  // Filter
  let filtered = allPeople;
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((p: any) =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.company_name || "").toLowerCase().includes(q)
    );
  }
  if (sectorFilter) {
    filtered = filtered.filter((p: any) => p.sector === sectorFilter);
  }
  if (roleFilter) {
    filtered = filtered.filter((p: any) => p.role === roleFilter);
  }

  // Paginate after filtering
  const totalFiltered = filtered.length;
  const people = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasNext = (page * PAGE_SIZE) < totalFiltered;
  const stats = statsResult.success ? statsResult.data : null;
  const hasStats = stats && (stats.people > 0 || stats.companies > 0);

  return (
    <div>
      <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">People Directory</p>
          <h1 className="font-display text-display-page font-bold">Founders & Executives</h1>
          <p className="mt-1.5 max-w-prose text-muted">
            Track key individuals behind Asia&apos;s fastest-growing startups — their roles, companies, and professional history.
          </p>
        </div>
        {hasStats && (
          <div className="card grid grid-cols-2 gap-3 p-4">
            <div className="border-l-2 border-brand-500 pl-3">
              <strong className="block font-display text-xl font-extrabold text-brand-600">{stats!.people}</strong>
              <span className="text-xs font-semibold text-muted">People tracked</span>
            </div>
            <div className="border-l-2 border-accent-500 pl-3">
              <strong className="block font-display text-xl font-extrabold text-accent-500">{stats!.companies}</strong>
              <span className="text-xs font-semibold text-muted">Companies represented</span>
            </div>
          </div>
        )}
      </section>

      <div className="mb-6">
        <form action="/founders" method="GET" className="flex w-full items-stretch gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          <label htmlFor="people-search" className="sr-only">Search people</label>
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              id="people-search"
              name="q"
              type="search"
              placeholder="Search by name or company..."
              defaultValue={query}
              className="h-full w-full rounded-xl border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
          <div className="hidden h-8 w-px self-center bg-gray-200 sm:block" />
          {sectors.length > 0 && (
            <FormSearchableSelect name="sector" defaultValue={sectorFilter} options={sectors.map((s: string) => ({ id: s, label: s }))} placeholder="All Sectors" />
          )}
          {roles.length > 0 && (
            <FormSearchableSelect name="role" defaultValue={roleFilter} options={roles.map((r: string) => ({ id: r, label: formatRole(r) }))} placeholder="All Roles" />
          )}
          <button type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Search
          </button>
          {(query || sectorFilter || roleFilter) && (
            <a href="/founders" className="inline-flex items-center px-2 text-sm text-muted hover:text-brand-600">Clear</a>
          )}
        </form>
      </div>

      {people.length === 0 ? (
        <div className="card py-10 text-center">
          <p className="text-sm font-medium text-gray-400">{query ? "No results for \"" + query + "\"" : "No people profiles yet"}</p>
          {query ? (
            <a href="/founders" className="mt-2 inline-block text-sm text-brand-600 hover:underline">Clear search</a>
          ) : (
            <p className="mt-1 text-xs text-muted">Profiles will appear once data ingestion runs.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((p: any) => (
            <Link
              key={p.id}
              href={`/founders/${p.slug || p.id}`}
              className="group card flex items-start gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-bold text-white shadow-sm">
                {(p.name || "?")[0].toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{p.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {p.role && <span className="text-sm font-medium text-gray-600">{formatRole(p.role)}</span>}
                  {p.company_name && (
                    <span className="text-sm text-muted">at <span className="font-semibold text-gray-700">{p.company_name}</span></span>
                  )}
                  {Boolean(p.company_count > 1) && (
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                      +{p.company_count - 1} more
                    </span>
                  )}
                </div>
                {p.location && (
                  <p className="mt-1.5 text-xs text-muted">{p.location}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} hasNext={hasNext} total={Math.ceil(totalFiltered / PAGE_SIZE)} basePath="/founders" searchParams={{ ...params, q: query, sector: sectorFilter, role: roleFilter }} />
    </div >
  );
}
