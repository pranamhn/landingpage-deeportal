import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { AdminAutoRefresh } from "@/components/admin/ui/AdminAutoRefresh";
import { AdminIngestionTabs } from "@/components/admin/ingestion/AdminIngestionTabs";
import { IngestionProgressBar } from "@/components/admin/ingestion/IngestionProgressBar";
import { IngestionRunButton } from "@/components/admin/ingestion/IngestionRunButton";
import { PeriodFilter } from "@/components/admin/ingestion/PeriodFilter";
import { BudgetCard } from "@/components/admin/ingestion/BudgetCard";
import { getIngestionFullData, getAdminStats } from "@/lib/adminJsonAdapter";
import { fetchAdminJson } from "@/lib/adminBackend";
import type { AdminIngestionSourceHealth } from "@/types/admin";
import type { IngestionTabId } from "@/components/admin/ingestion/AdminIngestionTabs";

export default async function AdminIngestionPage() {
  const [{ sections, details, totals }, { ingest }] = await Promise.all([
    getIngestionFullData(),
    getAdminStats().then((s) => ({ ingest: s.ingest })),
  ]);

  // Fetch budget
  let budget = { budget_usd: 0, spent_usd: 0, exceeded: false };
  try {
    const { ok, payload } = await fetchAdminJson("/api/v1/admin/engine/budget");
    if (ok && payload?.data) budget = payload.data;
  } catch { /* use defaults */ }

  const initialTabId: IngestionTabId = "runs";

  // Build source health from breakdown if health table is empty
  const sourceHealth: AdminIngestionSourceHealth[] = details?.source_health?.length
    ? details.source_health
    : (details?.source_breakdown ?? []).map((s) => ({
      name: s.source,
      kind: "rss",
      last_fetched_at: s.last_article_at,
      last_success_at: s.processed > 0 ? s.last_article_at : null,
      consecutive_failures: s.failed,
    }));

  // Article status summary
  const articleSummary = details?.source_breakdown?.length
    ? details.source_breakdown.reduce(
      (acc, s) => ({
        total: acc.total + (Number(s.total) || 0),
        processed: acc.processed + (Number(s.processed) || 0),
        failed: acc.failed + (Number(s.failed) || 0),
        pending: acc.pending + (Number(s.pending) || 0),
      }),
      { total: 0, processed: 0, failed: 0, pending: 0 },
    )
    : null;

  return (
    <>
      <AdminAutoRefresh intervalMs={30_000} />
      <div>
        <AdminPageHeader
          eyebrow="Ingestion Monitor"
          title="Runs, Fetch, and Extraction"
          description="Monitor pipeline runs, article stats, source health, budget, and error details in realtime."
        >
          <div className="flex flex-wrap items-center gap-3">
            <IngestionRunButton running={ingest.running} />
            <PeriodFilter />
          </div>
        </AdminPageHeader>

        {/* Progress Bar */}
        <section className="mb-6">
          <IngestionProgressBar currentRun={details?.current_run ?? null} />
        </section>

        {/* Article Status Summary Cards */}
        {articleSummary && (
          <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {[
              { label: "Total Articles", value: articleSummary.total.toLocaleString(), color: "text-gray-900 dark:text-gray-100" },
              { label: "Processed", value: articleSummary.processed.toLocaleString(), color: "text-emerald-600", pct: articleSummary.total > 0 ? Math.round((articleSummary.processed / articleSummary.total) * 100) : 0 },
              { label: "Failed", value: articleSummary.failed.toLocaleString(), color: articleSummary.failed > 0 ? "text-rose-600" : "text-gray-900 dark:text-gray-100" },
              { label: "Pending", value: articleSummary.pending.toLocaleString(), color: articleSummary.pending > 0 ? "text-amber-600" : "text-gray-900 dark:text-gray-100" },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{card.label}</div>
                <div className={`mt-1.5 text-2xl font-bold tabular-nums ${card.color}`}>{card.value}</div>
                {"pct" in card && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{card.pct}% success rate</div>}
              </div>
            ))}
            <BudgetCard budget_usd={budget.budget_usd ?? 0} spent_usd={budget.spent_usd ?? 0} exceeded={budget.exceeded} />
          </section>
        )}

        {/* Tabs: Runs / Errors / Sources */}
        <section>
          <AdminIngestionTabs
            sections={sections}
            initialTabId={initialTabId}
            sourceHealth={sourceHealth}
            sourceBreakdown={details?.source_breakdown}
            sourceYield={details?.source_yield}
            totals={totals}
          />
        </section>
      </div>
    </>
  );
}
