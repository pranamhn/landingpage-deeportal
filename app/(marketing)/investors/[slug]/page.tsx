import { getInvestor, getInvestors } from "@/services/investors";
import CompanyCard from "@/components/company/CompanyCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatCurrencyAbbrev, formatRoundType } from "@/lib/formatters/format";
import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const result = await getInvestors(200);
  if (!result.success) return [];
  return result.data.map((inv: any) => ({ slug: inv.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getInvestor(slug);
  if (!result.success || !result.data) return { title: "Investor not found" };
  return { title: `${result.data.name} — Investor Profile | Deeportal`, description: result.data.description || "" };
}

function fmtUsd(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtDate(raw: string | null): string {
  if (!raw) return "—";
  // "2026-06-21" → "21 Juni 2026"
  // "2026-06" → "Juni 2026"
  // "2026" → "2026"
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${parseInt(match[3])} ${months[parseInt(match[2]) - 1]} ${match[1]}`;
  const ym = raw.match(/^(\d{4})-(\d{2})$/);
  if (ym) return `${months[parseInt(ym[2]) - 1]} ${ym[1]}`;
  return raw;
}

export default async function InvestorPage({ params }: Props) {
  const { slug } = await params;
  const result = await getInvestor(slug);

  if (!result.success || !result.data) {
    return <Card className="py-16 text-center"><h1 className="font-display text-heading-card font-bold">Investor not found</h1><Link href="/companies" className="mt-4 inline-block text-brand-600 hover:underline">← Back</Link></Card>;
  }

  const inv = result.data;
  const stats = inv.investment_stats || { total_rounds: 0, avg_amount: 0, total_amount: 0, unique_companies: 0, last_investment_date: null as string | null };
  const roundTypes = inv.round_types || [];
  const recentNews = inv.recent_news || [];

  // Group funding rounds by company, then merge same series
  const companyRounds: Record<string, { company_name: string; company_slug: string; rounds: any[] }> = {};
  (inv.funding_rounds || []).forEach((fr: any) => {
    const key = fr.company_id || fr.company_name;
    if (!companyRounds[key]) {
      companyRounds[key] = { company_name: fr.company_name, company_slug: fr.company_slug, rounds: [] };
    }
    // Merge with existing round if same company + same round_type
    const existing = companyRounds[key].rounds.find(
      (r: any) => r.round_type === fr.round_type
    );
    if (existing) {
      existing.amount_usd = (existing.amount_usd || 0) + (fr.amount_usd || 0);
      existing.count = (existing.count || 1) + 1;
      if (fr.announced_date && (!existing.announced_date || fr.announced_date > existing.announced_date)) {
        existing.announced_date = fr.announced_date;
      }
    } else {
      companyRounds[key].rounds.push({ ...fr, count: 1 });
    }
  });

  return (
    <div>
      <Link href="/investors" className="mb-4 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted hover:text-brand-600 transition-colors">← Investors</Link>

      {/* Header */}
      <section className="card mb-6">
        <h1 className="font-display text-display-page font-bold">{inv.name}</h1>
        <p className="mt-1 text-muted">{inv.type || "unknown type"} · {inv.portfolio?.length || 0} portfolio companies</p>
        {inv.description && <p className="mt-3 leading-relaxed">{inv.description}</p>}

        {/* Info Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          {inv.location && <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Location</span><strong className="block">{inv.location}</strong></div>}
          {inv.website && <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Website</span><strong className="block truncate"><a href={inv.website} target="_blank" rel="noopener noreferrer" className="text-brand-600">{inv.website.replace(/^https?:\/\//, '')}</a></strong></div>}
          {inv.contact_email && <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Contact</span><strong className="block truncate"><a href={`mailto:${inv.contact_email}`} className="text-brand-600">{inv.contact_email}</a></strong></div>}
          {inv.founded_year && <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Founded</span><strong className="block">{inv.founded_year}</strong></div>}
          {inv.stage_focus && <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Stage Focus</span><strong className="block">{inv.stage_focus}</strong></div>}
          {inv.sector_focus && <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Sector Focus</span><strong className="block">{inv.sector_focus}</strong></div>}
          {inv.fund_size_usd ? <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Fund Size</span><strong className="block">{fmtUsd(inv.fund_size_usd)}</strong></div> : null}
          {inv.total_investments_usd ? <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Total Deployed</span><strong className="block">{fmtUsd(inv.total_investments_usd)}</strong></div> : null}
          {inv.linkedin_url && <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">LinkedIn</span><strong className="block truncate"><a href={inv.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand-600">Profile</a></strong></div>}
        </div>
      </section>

      {/* Investment Stats */}
      {stats.total_rounds > 0 && (
        <section className="card mb-6">
          <h2 className="font-display text-heading-section font-bold mb-4">Investment Stats</h2>
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
            <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Total Rounds</span><strong className="block text-lg">{stats.total_rounds}</strong></div>
            <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Avg Amount</span><strong className="block text-lg">{stats.avg_amount ? fmtUsd(stats.avg_amount) : "—"}</strong></div>
            <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Total Amount</span><strong className="block text-lg">{stats.total_amount ? fmtUsd(stats.total_amount) : "—"}</strong></div>
            <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Companies</span><strong className="block text-lg">{stats.unique_companies}</strong></div>
            {stats.last_investment_date && <div className="rounded-lg bg-gray-50 p-3"><span className="text-xs text-muted">Last Investment</span><strong className="block text-lg">{fmtDate(stats.last_investment_date)}</strong></div>}
          </div>

          {/* Round type breakdown */}
          {roundTypes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {roundTypes.map((rt: any) => (
                <span key={rt.type} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm">
                  <Badge variant="brand">{formatRoundType(rt.type)}</Badge>
                  <span className="font-semibold text-gray-700">{rt.c}</span>
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Funding Rounds */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-display text-lg font-bold tracking-tight text-gray-900">
            Funding Rounds
            <span className="ml-2 text-sm font-medium text-muted">{inv.funding_rounds?.length || 0}</span>
          </h2>
        </div>
        {Object.keys(companyRounds).length > 0 ? (
          <div className="overflow-x-auto px-2 pb-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <th className="py-3 pl-6 pr-4">Company</th>
                  <th className="px-4 py-3">Series</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Lead / Co-investors</th>
                  <th className="px-4 py-3 text-right">Valuation</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="py-3 pl-4 pr-6"></th>
                </tr>
              </thead>
              <tbody>
                {Object.values(companyRounds).flatMap((group) =>
                  group.rounds.map((fr: any, i: number) => (
                    <tr key={fr.id} className="border-b border-gray-50 transition-colors hover:bg-brand-50/30">
                      {i === 0 ? (
                        <td className="py-3 pl-6 pr-4" rowSpan={group.rounds.length}>
                          <Link href={`/companies/${group.company_slug}`} className="font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline">
                            {group.company_name}
                          </Link>
                        </td>
                      ) : null}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Badge variant="brand">{formatRoundType(fr.round_type)}</Badge>
                          {fr.funding_class && fr.funding_class !== fr.round_type && (
                            <Badge variant="brand">{formatRoundType(fr.funding_class)}</Badge>
                          )}
                          {fr.count > 1 && (
                            <span className="text-[11px] font-medium text-muted">×{fr.count}</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted">{fmtDate(fr.announced_date)}</td>
                      <td className="px-4 py-3 text-xs text-muted max-w-[220px] truncate">
                        {fr.lead_investor_name ? (
                          <span><span className="font-medium text-gray-700">{fr.lead_investor_name}</span>{fr.co_investors?.length > 0 ? <span className="text-muted"> +{fr.co_investors.length}</span> : ""}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-muted">
                        {fr.valuation_usd ? fmtUsd(fr.valuation_usd) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {fr.amount_usd ? (
                          <span className="text-sm font-bold tracking-tight text-success-600">{formatCurrencyAbbrev(fr.amount_usd)}</span>
                        ) : (
                          <span className="text-sm text-muted">—</span>
                        )}
                        {fr.original_currency && fr.original_currency !== "USD" && fr.original_amount && (
                          <div className="mt-0.5 text-[11px] text-muted/70">{fr.original_amount} {fr.original_currency}</div>
                        )}
                      </td>
                      <td className="py-3 pl-4 pr-6 whitespace-nowrap">
                        {fr.source_url && (
                          <a href={fr.source_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-brand-500 transition-colors hover:text-brand-700">
                            Source ↗
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-6 py-12 text-center text-sm text-muted">No funding round data yet.</p>
        )}
      </section>

      {/* Portfolio */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-display text-lg font-bold tracking-tight text-gray-900">
            Portfolio
            <span className="ml-2 text-sm font-medium text-muted">{inv.portfolio?.length || 0}</span>
          </h2>
        </div>
        <div className="grid gap-1 p-4 md:grid-cols-2">
          {inv.portfolio?.map((c: any) => (
            <CompanyCard key={c.id} company={c} compact />
          ))}
        </div>
        {!inv.portfolio?.length && <p className="px-6 py-12 text-center text-sm text-muted">No portfolio yet.</p>}
      </section>

      {/* Recent News */}
      {recentNews.length > 0 && (
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-display text-lg font-bold tracking-tight text-gray-900">Recent News</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentNews.map((n: any, i: number) => (
              <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-brand-50/30">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-relaxed">{n.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {n.company_name} · {fmtDate(n.published_at)}
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
