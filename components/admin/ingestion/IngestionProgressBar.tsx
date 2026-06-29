import type { AdminIngestionCurrentRun } from "@/types/admin";

interface IngestionProgressBarProps {
  currentRun: AdminIngestionCurrentRun | null;
}

function segment(label: string, value: number, total: number, color: string) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return { label, value, pct, color };
}

export function IngestionProgressBar({ currentRun }: IngestionProgressBarProps) {
  if (!currentRun) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
        No active ingestion run. Start ingestion to see progress.
      </div>
    );
  }

  const total = currentRun.articles_seen || 1;
  const segments = [
    segment("Seen", currentRun.articles_seen, total, "#94a3b8"),
    segment("Processed", currentRun.articles_processed, total, "#3b82f6"),
    segment("Filtered", currentRun.articles_filtered, total, "#f59e0b"),
    segment("Events", currentRun.events_found, total, "#10b981"),
  ];

  const isRunning = !currentRun.finished_at;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Current Run {isRunning ? "(in progress)" : "(completed)"}
        </h4>
        {isRunning && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="inline-block h-2 w-2 animate-live-dot rounded-full bg-emerald-500" />
            Running
          </span>
        )}
      </div>

      {/* Segmented bar */}
      <div className="mb-3 flex h-4 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        {segments.map((seg) =>
          seg.pct > 0 ? (
            <div
              key={seg.label}
              style={{ width: `${Math.max(seg.pct, 2)}%`, backgroundColor: seg.color }}
              className="transition-all duration-500"
              title={`${seg.label}: ${seg.value}`}
            />
          ) : null,
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {segments.map((seg) => (
          <span key={seg.label} className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
            {seg.label} <span className="font-semibold text-gray-800 dark:text-gray-200">{seg.value.toLocaleString()}</span>
          </span>
        ))}
        <span className="ml-auto text-gray-400 dark:text-gray-500">
          {currentRun.companies_touched.toLocaleString()} companies touched
          {currentRun.errors > 0 && (
            <span className="ml-2 font-semibold text-rose-600 dark:text-rose-400">{currentRun.errors} errors</span>
          )}
        </span>
      </div>
    </div>
  );
}
