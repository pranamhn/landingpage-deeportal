import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { AdminAutoRefresh } from "@/components/admin/ui/AdminAutoRefresh";
import { EnrichmentRunButton } from "@/components/admin/enrichment/EnrichmentRunButton";
import { EnrichmentRunsTable } from "@/components/admin/enrichment/EnrichmentRunsTable";
import { adminCardClass } from "@/components/admin/ui/adminTheme";
import { fetchAdminJson, getBackendAdminJson } from "@/lib/adminBackend";
import { cn } from "@/lib/cn";

type EnrichTarget = "companies" | "investors" | "founders";
type EnrichStatusKey = "companies" | "investors" | "people";

interface EnrichServiceStatus {
  loaded: boolean;
  running: boolean;
  pid: number | null;
}

interface EnrichStatus {
  companies: EnrichServiceStatus;
  investors: EnrichServiceStatus;
  people: EnrichServiceStatus;
}

function getStatusKey(target: EnrichTarget): EnrichStatusKey {
  return target === "founders" ? "people" : target;
}

const PANELS: { target: EnrichTarget; title: string; description: string; icon: React.ReactNode }[] = [
  {
    target: "companies",
    title: "Companies",
    description: "Enrich company profiles — industry, funding, employees, social links.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M6 21V7l6-4 6 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />,
  },
  {
    target: "investors",
    title: "Investors",
    description: "Enrich investor profiles — type, portfolio, AUM, social links.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  },
  {
    target: "founders",
    title: "Founders",
    description: "Enrich founder/people profiles — role, social links, bio.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M20 8a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM13.5 3.5a4 4 0 0 1 5 5" />,
  },
];

export default async function AdminEnrichmentPage() {
  let enrich: EnrichStatus = {
    companies: { loaded: false, running: false, pid: null },
    investors: { loaded: false, running: false, pid: null },
    people: { loaded: false, running: false, pid: null },
  };
  let cost = { total: 0, total_calls: 0 };

  try {
    const { ok, payload } = await fetchAdminJson("/api/v1/admin/enrichment/status");
    if (ok && payload?.data) enrich = payload.data as EnrichStatus;
  } catch { /* use defaults */ }

  // Fetch cost summary too
  try {
    const result = await getBackendAdminJson<{ total: number; total_calls: number }>("/api/v1/admin/stats");
    if (result.ok && result.data) {
      const stats = result.data as any;
      cost = stats.cost || { total: 0, total_calls: 0 };
    }
  } catch { /* use defaults */ }

  const runningCount = PANELS.filter((p) => enrich[getStatusKey(p.target)]?.running).length;

  return (
    <>
      <AdminAutoRefresh intervalMs={30_000} />
      <div>
        <AdminPageHeader
          eyebrow="Enrichment"
          title="Companies · Investors · Founders"
          description="Perkaya profil entitas dengan data dari sumber eksternal."
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Status badge */}
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
              runningCount > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
            )}>
              <span className={cn(
                "h-2 w-2 rounded-full",
                runningCount > 0 ? "bg-emerald-500 animate-live-dot" : "bg-gray-400",
              )} />
              {runningCount > 0 ? `${runningCount} running` : "All idle"}
            </span>

            {/* Cost badge */}
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

        {/* Action cards */}
        <section className="mb-6 grid gap-6 lg:grid-cols-3">
          {PANELS.map((panel) => {
            const status = enrich[getStatusKey(panel.target)] ?? { loaded: false, running: false, pid: null };
            return (
              <div key={panel.target} className={cn(adminCardClass, "flex flex-col")}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
                    status.running
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
                  )}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {panel.icon}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{panel.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        status.running ? "bg-emerald-500 animate-live-dot" : status.loaded ? "bg-gray-400" : "bg-rose-500",
                      )} />
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {status.running ? `Running · PID ${status.pid ?? "?"}` : status.loaded ? "Idle" : "Not loaded"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                  {panel.description}
                </p>

                <EnrichmentRunButton
                  target={panel.target}
                  label={panel.title}
                  running={status.running}
                />
              </div>
            );
          })}
        </section>

        {/* Enrichment history */}
        <section>
          <EnrichmentRunsTable />
        </section>
      </div>
    </>
  );
}
