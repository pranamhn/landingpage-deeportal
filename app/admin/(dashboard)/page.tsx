import { AdminBarChart } from "@/components/admin/charts/AdminBarChart";
import { AdminDonutChart } from "@/components/admin/charts/AdminDonutChart";
import { TimelineSection } from "@/components/admin/overview/TimelineSection";
import { adminCardClass } from "@/components/admin/ui/adminTheme";
import { getAdminStats } from "@/lib/adminJsonAdapter";
import { fetchAdminJson } from "@/lib/adminBackend";
import { cn } from "@/lib/cn";
import type { ChartDataPoint } from "@/types/admin";
import { STATUS_COLORS } from "@/components/admin/charts/chartColors";
import Link from "next/link";

function fmtUsd(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();
  const { counts, sectors, statuses, funding_timeline, news_timeline, top_funded, funding_by_stage, freshness, recent_acquisitions, top_investors, top_news_companies, recent_funding } = stats;

  // Fetch DB stats (9.5)
  let dbStats: { db_size_mb?: number; table_count?: number; row_count?: number; schema_version?: number } = {};
  try {
    const { ok, payload } = await fetchAdminJson("/api/v1/admin/system");
    if (ok && payload?.data) dbStats = payload.data;
  } catch { /* ignore */ }

  const sectorChartData: ChartDataPoint[] = sectors
    .filter((s) => s.sector.toLowerCase() !== "uncategorized")
    .map((s) => ({ label: s.sector, value: s.c }));
  const statusChartData: ChartDataPoint[] = statuses.map((s) => ({ label: s.status, value: s.c, color: STATUS_COLORS[s.status] ?? undefined }));

  const stageChartData: ChartDataPoint[] = (funding_by_stage ?? []).map((s) => ({ label: s.stage, value: s.c }));

  return (
    <div className="-mt-8">

      {/* Quick link: Kredit Ringkasan (credo-risk) */}
      <section className="mt-4 mb-6">
        <a
          href="http://127.0.0.1:3528/memo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-all border-violet-300 bg-violet-50 text-violet-800 shadow-sm hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 bg-violet-50 text-violet-700 ring-violet-200 ring-current/20 dark:bg-violet-900/40 dark:text-violet-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check h-3.5 w-3.5" aria-hidden="true">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">Kredit Ringkasan</p>
            <p className="truncate text-[10px] text-violet-600 dark:text-violet-400">Rating risiko, faktor risiko, dan catatan analis</p>
          </div>
        </a>
      </section>

      {/* Data quality snapshot (7.5) */}
      <section className="mt-4 mb-6">
        <div className={cn(adminCardClass, "flex flex-wrap items-center gap-6 px-5 py-4")}>
          <div>
            <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{freshness?.pct_updated ?? "—"}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Profiles updated ≤90d</div>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-600" />
          <div>
            <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{freshness?.updated_90d ?? "—"}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">out of {freshness?.total ?? "—"} total</div>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-600" />
          <div>
            <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{counts.news_events.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">News events tracked</div>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-600" />
          <div>
            <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{counts.funding_rounds.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Funding rounds</div>
          </div>
          <Link href="/admin/data-quality" className="ml-auto text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
            View DQ Issues →
          </Link>
        </div>
      </section>

      {/* DB Stats (9.5) */}
      {dbStats.db_size_mb != null && (
        <section className="mb-6">
          <div className={cn(adminCardClass, "flex flex-wrap items-center gap-4 px-5 py-3")}>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Database</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{dbStats.db_size_mb} MB</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{dbStats.table_count} tables</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{dbStats.row_count?.toLocaleString()} rows</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Schema v{dbStats.schema_version ?? "—"}</span>
          </div>
        </section>
      )}

      {/* Charts Row 1: Sector bar + Status donut + Stage donut */}
      <section id="section-charts" className="mb-6 grid gap-6 lg:grid-cols-[1.1fr_0.65fr_0.65fr] scroll-mt-20">
        <div className={cn(adminCardClass)}>
          <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Companies by Sector</h3>
          <AdminBarChart data={sectorChartData} maxBars={10} />
        </div>

        <div className={cn(adminCardClass)}>
          <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Company Status</h3>
          <div className="flex justify-center">
            <AdminDonutChart data={statusChartData} centerValue={String(counts.companies)} centerLabel="Total" width={200} height={200} />
          </div>
        </div>

        <div className={cn(adminCardClass)}>
          <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Funding by Stage</h3>
          <div className="flex justify-center">
            {stageChartData.length > 0 ? (
              <AdminDonutChart data={stageChartData} centerValue={String(counts.funding_rounds)} centerLabel="Rounds" width={200} height={200} />
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-gray-400">No data</div>
            )}
          </div>
        </div>
      </section>

      {/* Charts Row 2: Timeline with filter */}
      <section id="section-timeline" className="mb-6 scroll-mt-20">
        <div className={cn(adminCardClass)}>
          <TimelineSection fundingTimeline={funding_timeline} newsTimeline={news_timeline} />
        </div>
      </section>

      {/* Recent Funding + Top Funded side by side */}
      <section id="section-funding" className="mb-6 grid gap-6 lg:grid-cols-2 scroll-mt-20">
        {/* Top Funded Companies (left) */}
        {(top_funded ?? []).length > 0 && (
          <div className={cn(adminCardClass)}>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Top Funded Companies</h3>
            <AdminBarChart
              data={(top_funded!).map((c) => ({
                label: c.name.length > 18 ? c.name.slice(0, 16) + "…" : c.name,
                value: c.total_funding_usd,
              }))}
              maxBars={10}
            />
          </div>
        )}

        {/* Recent Funding Rounds (right) */}
        {(recent_funding ?? []).length > 0 && (
          <div className={cn(adminCardClass)}>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Recent Funding Rounds</h3>
            <AdminBarChart
              data={(recent_funding!).slice(0, 12).reverse().map((r) => ({
                label: r.company_name.length > 12 ? r.company_name.slice(0, 10) + "…" : r.company_name,
                value: r.amount_usd || 0,
              }))}
              maxBars={12}
            />
          </div>
        )}
      </section>

      {/* Row: Acquisitions + Top Investors + Top News */}
      <section className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Acquisitions */}
        <div className={cn(adminCardClass)}>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Recent Acquisitions</h3>
          {(recent_acquisitions ?? []).length > 0 ? (
            <ul className="space-y-3">
              {recent_acquisitions!.map((a) => (
                <li key={a.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <Link href={`/companies/${a.acquiree_id}`} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">{a.acquiree_name}</Link>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    by {a.acquirer_name}
                    {a.amount_usd ? <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">{fmtUsd(a.amount_usd)}</span> : null}
                  </div>
                  {a.announced_date && <div className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{a.announced_date}</div>}
                </li>
              ))}
            </ul>
          ) : <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No acquisitions recorded.</div>}
        </div>

        {/* Top Investors */}
        <div className={cn(adminCardClass)}>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Most Active Investors</h3>
          {(top_investors ?? []).length > 0 ? (
            <ul className="space-y-2">
              {top_investors!.map((inv, i) => (
                <li key={inv.name} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-700">
                  <div>
                    <span className="text-xs text-gray-400 mr-2 dark:text-gray-500">{i + 1}.</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{inv.name}</span>
                    <span className="ml-2 text-[11px] text-gray-400 dark:text-gray-500">{inv.type}</span>
                  </div>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{inv.rounds_participated} rounds</span>
                </li>
              ))}
            </ul>
          ) : <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No investor data.</div>}
        </div>

        {/* Top News Companies */}
        <div className={cn(adminCardClass)}>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Most Covered Companies</h3>
          {(top_news_companies ?? []).length > 0 ? (
            <ul className="space-y-2">
              {top_news_companies!.map((n, i) => (
                <li key={n.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-700">
                  <div>
                    <span className="text-xs text-gray-400 mr-2 dark:text-gray-500">{i + 1}.</span>
                    <Link href={`/companies/${n.id}`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">{n.name}</Link>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{n.news_count} articles</span>
                </li>
              ))}
            </ul>
          ) : <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No news data.</div>}
        </div>
      </section>
    </div>
  );
}
