import type { AdminIngestionSourceHealth } from "@/types/admin";

interface SourceHealthCardProps {
  source: AdminIngestionSourceHealth;
}

function since(timestamp: number | null): string {
  if (!timestamp) return "never";
  const diffSec = Math.floor(Date.now() / 1000 - timestamp);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function SourceHealthCard({ source }: SourceHealthCardProps) {
  const hasFailures = source.consecutive_failures > 0;
  const isHealthy = source.last_success_at && !hasFailures;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">{source.name}</h4>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isHealthy
              ? "bg-emerald-50 text-emerald-700"
              : hasFailures
                ? "bg-rose-50 text-rose-700"
                : "bg-gray-50 text-gray-500"
            }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${isHealthy ? "bg-emerald-500 animate-live-dot" : hasFailures ? "bg-rose-500" : "bg-gray-400"
              }`}
          />
          {isHealthy ? "Healthy" : hasFailures ? "Failing" : "Unknown"}
        </span>
      </div>
      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Kind</span>
          <span className="font-medium text-gray-700">{source.kind}</span>
        </div>
        <div className="flex justify-between">
          <span>Last success</span>
          <span className="font-medium text-gray-700">{since(source.last_success_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>Last fetch</span>
          <span className="font-medium text-gray-700">{since(source.last_fetched_at)}</span>
        </div>
        {hasFailures && (
          <div className="flex justify-between">
            <span>Consecutive failures</span>
            <span className="font-bold text-rose-600">{source.consecutive_failures}</span>
          </div>
        )}
      </div>
    </div>
  );
}
