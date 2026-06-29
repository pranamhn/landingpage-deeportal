import type { AdminStatsActivity } from "@/types/admin";

interface AdminActivityFeedProps {
  activity: AdminStatsActivity[];
  maxItems?: number;
}

function relativeTime(isoTime: string): string {
  try {
    const then = new Date(isoTime).getTime();
    const diffSec = Math.floor((Date.now() - then) / 1000);
    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return "";
  }
}

export function AdminActivityFeed({ activity, maxItems = 12 }: AdminActivityFeedProps) {
  if (activity.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute bottom-0 left-[11px] top-2 w-px bg-gray-200" />
      <ul className="space-y-0.5">
        {activity.slice(0, maxItems).map((entry, i) => (
          <li key={`${entry.time}-${i}`} className="relative flex gap-3 py-1.5 pl-7">
            {/* Dot */}
            <span className="absolute left-[7px] top-[10px] h-2.5 w-2.5 rounded-full border-2 border-white bg-gray-300" />
            <div className="min-w-0 flex-1">
              <span className="text-[13px] font-medium text-gray-800">{entry.action}</span>
              {entry.detail ? (
                <span className="ml-1.5 text-[12px] text-gray-500">{entry.detail}</span>
              ) : null}
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-gray-400">
              {relativeTime(entry.time)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
