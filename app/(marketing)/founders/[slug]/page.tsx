import { getPerson } from "@/lib/api/companiesService";
import { formatRole } from "@/lib/formatters/format";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

async function fetchWikipediaSummary(name: string): Promise<{ title: string; extract: string; url: string } | null> {
  try {
    // Try direct page summary first
    let resp = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      { next: { revalidate: 86400 } },
    );
    if (resp.ok) {
      const data = await resp.json();
      return {
        title: data.title,
        extract: data.extract,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(name)}`,
      };
    }
    // Fallback: search Wikipedia
    const searchResp = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(name)}&limit=1&format=json`,
      { next: { revalidate: 86400 } },
    );
    if (!searchResp.ok) return null;
    const searchData = await searchResp.json();
    const firstTitle = searchData[1]?.[0];
    if (!firstTitle) return null;
    // Fetch summary for the first search result
    const summaryResp = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstTitle)}`,
      { next: { revalidate: 86400 } },
    );
    if (!summaryResp.ok) return null;
    const data = await summaryResp.json();
    return {
      title: data.title,
      extract: data.extract,
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(firstTitle)}`,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPerson(slug);
  const person = result.success ? result.data : null;
  return { title: `${person?.name || "Person"} — DeePortal.ai`, description: person?.role || "Founder or executive profile on DeePortal.ai" };
}

export default async function PersonPage({ params }: Props) {
  const { slug } = await params;
  const result = await getPerson(slug);

  if (!result.success || !result.data) {
    return <div className="card py-16 text-center"><h1 className="font-display text-heading-card font-bold">Person not found</h1><Link href="/founders" className="mt-4 inline-block text-brand-600 hover:underline">← Back</Link></div>;
  }

  const person = result.data;
  const companies = person.companies || [];
  const investors = person.investors || [];
  const primaryCompany = companies[0];

  // Fetch Wikipedia summary + news from companies in parallel
  const [wiki] = await Promise.all([
    fetchWikipediaSummary(person.name),
  ]);

  // Collect news from associated companies
  const companyNews: any[] = [];
  for (const c of companies) {
    if (c.news_events) {
      for (const n of c.news_events) {
        companyNews.push({ ...n, company_name: c.name, company_slug: c.slug });
      }
    }
  }
  companyNews.sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""));
  const recentNews = companyNews.slice(0, 6);

  return (
    <div>
      <Link href="/founders" className="mb-4 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted hover:text-brand-600 transition-colors">← Founders</Link>

      {/* Header */}
      <section className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-2xl font-bold text-white shadow-sm">
              {(person.name || "?")[0].toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-display-page font-bold">{person.name}</h1>
              {person.role && <p className="mt-1 text-lg text-muted">{formatRole(person.role)}</p>}
              {primaryCompany && (
                <p className="mt-1.5">
                  <Link href={`/companies/${primaryCompany.slug || primaryCompany.id}`} className="text-brand-600 hover:underline font-medium">
                    {primaryCompany.name}
                  </Link>
                  {primaryCompany.person_role && (
                    <span className="ml-2 text-sm text-muted">as {formatRole(primaryCompany.person_role)}</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Stats — right side */}
          <div className="flex gap-3">
            <div className="rounded-xl bg-gray-50 px-5 py-3.5 text-center">
              <strong className="block text-xl">{companies.length}</strong>
              <span className="text-xs text-muted">Companies</span>
            </div>
            <div className="rounded-xl bg-gray-50 px-5 py-3.5 text-center">
              <strong className="block text-xl">{investors.length}</strong>
              <span className="text-xs text-muted">Investor</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {person.location && <div className="rounded-xl bg-gray-50 px-4 py-2"><span className="text-xs text-muted">{person.location}</span></div>}
          {person.linkedin_url && <div className="rounded-xl bg-gray-50 px-4 py-2"><a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600">LinkedIn ↗</a></div>}
        </div>

        {(wiki?.extract || person.bio) && (
          <p className="mt-5 text-sm leading-relaxed text-gray-700">
            {wiki?.extract || person.bio}
            {wiki?.url && (
              <>{" "}<a href={wiki.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Wikipedia ↗</a></>
            )}
          </p>
        )}
      </section>

      {/* Companies */}
      {companies.length > 0 && (
        <section className="card mb-6 p-0">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-display text-lg font-bold tracking-tight text-gray-900">
              Companies
              <span className="ml-2 text-sm font-medium text-muted">{companies.length}</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {companies.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-gray-50/50">
                <div className="min-w-0">
                  <Link href={`/companies/${c.slug || c.id}`} className="font-semibold text-brand-600 hover:underline">{c.name}</Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                    {c.person_role && <span>{formatRole(c.person_role)}</span>}
                    {c.sector && <Badge variant="brand">{c.sector}</Badge>}
                    {c.location && <span>{c.location}</span>}
                    {c.started_date && (
                      <span>
                        {c.started_date}
                        {c.ended_date ? ` → ${c.ended_date}` : " → Present"}
                      </span>
                    )}
                  </div>
                </div>
                {c.person_source_url && (
                  <a href={c.person_source_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[11px] text-brand-500 hover:text-brand-700">Source ↗</a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Investor Roles */}
      {investors.length > 0 && (
        <section className="card mb-6 p-0">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-display text-lg font-bold tracking-tight text-gray-900">
              Investor Roles
              <span className="ml-2 text-sm font-medium text-muted">{investors.length}</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {investors.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-gray-50/50">
                <div className="min-w-0">
                  <Link href={`/investors/${inv.slug || inv.id}`} className="font-semibold text-brand-600 hover:underline">{inv.name}</Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                    {inv.person_role && <span>{formatRole(inv.person_role)}</span>}
                    {inv.type && <Badge variant="brand">{inv.type}</Badge>}
                    {inv.location && <span>{inv.location}</span>}
                  </div>
                </div>
                {inv.person_source_url && (
                  <a href={inv.person_source_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[11px] text-brand-500 hover:text-brand-700">Source ↗</a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent News */}
      {recentNews.length > 0 && (
        <section className="card mb-6 p-0">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-display text-lg font-bold tracking-tight text-gray-900">
              Recent News
              <span className="ml-2 text-sm font-medium text-muted">{recentNews.length}</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentNews.map((n: any, i: number) => (
              <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-brand-50/30">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-relaxed">{n.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {n.company_name} · {n.published_at || n.fetched_at}
                  </p>
                </div>
                <span className="mt-0.5 shrink-0 text-xs text-brand-500">↗</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
