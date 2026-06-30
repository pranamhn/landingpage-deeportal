import { getRecentFunding, getFundingThisWeek, getFundingStats } from "@/services/funding";
import { formatRoundType, formatCurrencyAbbrev, formatFullAmount } from "@/lib/formatters/format";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Funding — Deeportal", description: "Latest funding rounds in the Asian startup ecosystem." };

const PAGE_SIZE = 20;

function FundingRow({ r }: { r: any }) {
  const hasValuation = Boolean(r.valuation_usd && r.valuation_usd > 0);
  return (
    <div className="card flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/companies/${r.company_slug || r.company_id}`} className="font-semibold text-brand-600 hover:underline">{r.company_name}</Link>
          {r.company_sector && <Badge variant="sector">{r.company_sector}</Badge>}
        </div>
        <p className="text-sm text-muted">
          {formatRoundType(r.round_type)}{r.announced_date ? ` · ${r.announced_date}` : ""}
          {r.lead_investor_name && (
            <>
              {" · from "}
              <span className="font-medium text-gray-700">{r.lead_investor_name}</span>
              {Boolean(r.investor_count && r.investor_count > 1) && ` +${r.investor_count - 1} more`}
            </>
          )}
        </p>
        {r.source_url && (
          <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-muted hover:text-brand-600">
            Source ↗
          </a>
        )}
      </div>
      <div className="shrink-0 text-right">
        <span className="font-display text-sm font-extrabold text-success-600" title={formatFullAmount(r.amount_usd)}>
          {formatCurrencyAbbrev(r.amount_usd)}
        </span>
        {hasValuation && (
          <p className="text-xs text-muted" title={formatFullAmount(r.valuation_usd)}>
            Valuation {formatCurrencyAbbrev(r.valuation_usd)}
          </p>
        )}
      </div>
    </div>
  );
}

export default async function FundingPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const [recentResult, weeklyResult, statsResult] = await Promise.all([
    getRecentFunding(PAGE_SIZE, page),
    getFundingThisWeek(),
    page === 1 ? getFundingStats() : Promise.resolve({ success: false, data: null }),
  ]);
  const rounds = recentResult.success ? recentResult.data : [];
  const weekly = weeklyResult.success ? weeklyResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;
  const hasNext = rounds.length === PAGE_SIZE;
  const weeklyTotal = weekly.reduce((sum: number, r: any) => sum + (r.amount_usd || 0), 0);

  return (
    <div>
      <section className="mb-8">
        <h1 className="font-display text-display-page font-bold">Funding</h1>
        <p className="mt-2 text-muted">Latest funding rounds recorded in the Deeportal directory.</p>
      </section>

      {stats && (
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <span className="text-xs uppercase tracking-wide text-muted">Total Rounds</span>
            <strong className="mt-1 block font-display text-heading-section text-gray-900">{stats.total_rounds}</strong>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <span className="text-xs uppercase tracking-wide text-muted">Total Companies</span>
            <strong className="mt-1 block font-display text-heading-section text-gray-900">{stats.total_companies}</strong>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <span className="text-xs uppercase tracking-wide text-muted">Total Funding</span>
            <strong className="mt-1 block font-display text-heading-section text-gray-900" title={formatFullAmount(stats.total_amount)}>
              {formatCurrencyAbbrev(stats.total_amount)}
            </strong>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <span className="text-xs uppercase tracking-wide text-muted">Average per Round</span>
            <strong className="mt-1 block font-display text-heading-section text-gray-900" title={formatFullAmount(stats.avg_amount)}>
              {formatCurrencyAbbrev(stats.avg_amount)}
            </strong>
          </div>
        </section>
      )}

      {stats && page === 1 && (() => {
        const allItems = [
          ...(stats.by_stage || []).map((s: any) => ({ label: formatRoundType(s.stage), count: s.count, total: s.total })),
          ...(stats.by_sector || []).map((s: any) => ({ label: s.sector, count: s.count, total: s.total })),
        ];
        return (
          <section className="mb-6">
            <h2 className="font-display text-heading-card font-bold">Funding Summary</h2>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2 snap-x">
              {allItems.map((item, i) => (
                <div key={`${item.label}-${i}`} className="shrink-0 snap-start rounded-lg border bg-white px-4 py-2.5 text-sm shadow-sm">
                  <span className="font-semibold">{item.label}</span>
                  <span className="ml-2 text-muted">{item.count}×</span>
                  {item.total > 0 && (
                    <span className="ml-1.5 font-display text-xs font-bold text-success-600">{formatCurrencyAbbrev(item.total)}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {page === 1 && weekly.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-warning-50 px-3 py-1 text-xs font-bold text-warning-600">This week</span>
            <span className="text-sm text-muted">{weekly.length} rounds</span>
            {weeklyTotal > 0 && (
              <span className="font-display text-sm font-extrabold text-success-600" title={formatFullAmount(weeklyTotal)}>
                · {formatCurrencyAbbrev(weeklyTotal)}
              </span>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {weekly.map((r: any) => <FundingRow key={r.id} r={r} />)}
          </div>
        </section>
      )}

      <section className="mb-6">
        <h2 className="font-display text-heading-section font-bold">All rounds</h2>
        {rounds.length === 0 ? (
          <p className="mt-4 text-center text-muted">No funding data yet.</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {rounds.map((r: any) => <FundingRow key={r.id} r={r} />)}
          </div>
        )}
        <Pagination page={page} hasNext={hasNext} basePath="/funding" searchParams={params} />
      </section>
    </div>
  );
}
