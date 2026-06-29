import { globalSearch } from "@/lib/api/companiesService";
import CompanyCard from "@/components/company/CompanyCard";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search — Deeportal", description: "Search companies, investors, and founders across the Asia startup directory." };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const result = q ? await globalSearch(q, 12) : null;
  const companies = result?.success ? result.data.companies : [];
  const investors = result?.success ? result.data.investors : [];
  const people = result?.success ? result.data.people : [];
  const totalResults = companies.length + investors.length + people.length;

  return (
    <div>
      <section className="mb-8">
        <p className="eyebrow">Search</p>
        <h1 className="font-display text-display-page font-bold">Search Deeportal</h1>
        <p className="mt-2 text-muted">Find companies, investors, and founders across the directory.</p>
      </section>

      <form action="/search" method="GET" className="mb-8 flex gap-2">
        <label htmlFor="search-q" className="sr-only">Search</label>
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search companies, investors, people..."
          className="w-full max-w-xl rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button type="submit" className="shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Search
        </button>
      </form>

      {!q ? (
        <EmptyState title="Start typing to search." description="Search across companies, investors, and founders by name." />
      ) : totalResults === 0 ? (
        <EmptyState title={`No results for "${q}"`} description="Try a different keyword or check the spelling." />
      ) : (
        <div className="space-y-10">
          {companies.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-heading-section font-bold">Companies ({companies.length})</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {companies.map((c: any) => (
                  <CompanyCard key={c.id} company={c} />
                ))}
              </div>
            </section>
          )}

          {investors.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-heading-section font-bold">Investors ({investors.length})</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {investors.map((inv: any) => (
                  <Link key={inv.id} href={`/investors/${inv.slug || inv.id}`} className="card block transition hover:shadow-md">
                    <h3 className="font-display font-bold">{inv.name}</h3>
                    <p className="mt-1 text-sm text-muted capitalize">
                      {inv.type || "—"}{inv.location ? ` · ${inv.location}` : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {people.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-heading-section font-bold">People ({people.length})</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {people.map((p: any) => (
                  <Link key={p.id} href={`/founders/${p.slug || p.id}`} className="card flex items-center gap-3 transition hover:shadow-md">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {(p.name || "?")[0]}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{p.name}</div>
                      {p.role && <div className="truncate text-xs text-muted">{p.role}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
