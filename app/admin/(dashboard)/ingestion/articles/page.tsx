import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { AdminAutoRefresh } from "@/components/admin/ui/AdminAutoRefresh";
import { IngestionRunButton } from "@/components/admin/ingestion/IngestionRunButton";
import { EntityTableClient } from "@/components/admin/data-quality/EntityTableClient";
import { getAdminTableData, getAdminStats } from "@/lib/adminJsonAdapter";
import { cn } from "@/lib/cn";

export default async function AdminNewsArticlesPage() {
  const [data, { ingest, cost }] = await Promise.all([
    getAdminTableData("news_articles", { per_page: 10, sort_by: "published_at", order: "desc" }),
    getAdminStats().then((s) => ({ ingest: s.ingest, cost: s.cost })),
  ]);

  return (
    <>
      <AdminAutoRefresh intervalMs={30_000} />
      <div>
        <AdminPageHeader
          eyebrow="Ingest"
          title="News Articles"
          description="Browse processed news articles — see which companies were extracted from each article."
        >
          <div className="flex flex-wrap items-center gap-3">
            <IngestionRunButton running={ingest.running} />

            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
              ingest.running
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
            )}>
              <span className={cn(
                "h-2 w-2 rounded-full",
                ingest.running ? "bg-emerald-500 animate-live-dot" : "bg-gray-400",
              )} />
              {ingest.running ? "Running" : "Idle"}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/80 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800/80">
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                ${(cost?.total ?? 0).toFixed(4)}
              </span>
              <span className="text-[11px] text-gray-400">·</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {cost?.total_calls ?? 0} calls
              </span>
            </span>
          </div>
        </AdminPageHeader>

        <EntityTableClient
          table="news_articles"
          title="News Articles"
          eyebrow="Ingest"
          description="Browse processed news articles, extraction status, source, errors, and event counts."
          initialData={data}
        />
      </div>
    </>
  );
}
