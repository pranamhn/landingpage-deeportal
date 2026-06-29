import { AdminBarChart } from "@/components/admin/charts/AdminBarChart";
import type { AdminIngestionTimelinePoint } from "@/types/admin";
import type { ChartDataPoint } from "@/types/admin";

interface IngestionTimelineProps {
  timeline: AdminIngestionTimelinePoint[];
}

export function IngestionTimeline({ timeline }: IngestionTimelineProps) {
  if (timeline.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">
        No timeline data yet.
      </div>
    );
  }

  // Show last 30 days, most recent first
  const recent = [...timeline]
    .filter((point) => point.day)
    .slice(0, 30)
    .reverse();
  const chartData: ChartDataPoint[] = recent.map((point) => ({
    label: point.day,
    value: point.total,
  }));

  return (
    <div>
      <AdminBarChart
        data={chartData}
        orientation="vertical"
        maxBars={30}
        height={200}
      />
    </div>
  );
}
