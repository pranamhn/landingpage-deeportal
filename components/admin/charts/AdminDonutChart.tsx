import type { ChartDataPoint } from "@/types/admin";
import { colorForLabel, CHART } from "./chartColors";

interface AdminDonutChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

/** Pure SVG donut/pie chart — SSR-compatible. */
export function AdminDonutChart({
  data,
  width = 200,
  height = 200,
  centerLabel,
  centerValue,
  className,
}: AdminDonutChartProps) {
  const sorted = [...data]
    .filter((d) => d.label != null && d.value != null && d.value > 0)
    .sort((a, b) => b.value - a.value);
  if (sorted.length === 0) {
    return <div className="flex h-40 items-center justify-center text-sm text-gray-400">No data</div>;
  }

  const total = sorted.reduce((sum, d) => sum + d.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(cx, cy) - 4;
  const innerR = outerR - CHART.donutThickness;
  const donutR = (outerR + innerR) / 2;

  // Build arc paths
  let cumulativeAngle = -Math.PI / 2; // start at top
  const arcs = sorted.map((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const color = item.color ?? colorForLabel(item.label);
    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;

    return {
      label: item.label,
      value: item.value,
      pct,
      color,
      path: `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`,
    };
  });

  return (
    <div className={className} style={{ position: "relative", width: "100%", maxWidth: width }}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Donut chart">
        {arcs.map((arc, i) => (
          <path key={`${arc.label}-${i}`} d={arc.path} fill={arc.color} opacity={0.9}>
            <title>{`${arc.label}: ${arc.value} (${arc.pct}%)`}</title>
          </path>
        ))}
      </svg>

      {/* Center label overlay */}
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue && (
            <span className="text-xl font-bold text-gray-800">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-[11px] text-gray-500">{centerLabel}</span>
          )}
        </div>
      )}

      {/* Legend below */}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {arcs.slice(0, 6).map((arc, i) => (
          <span key={`${arc.label}-${i}`} className="inline-flex items-center gap-1.5 text-[11px] text-gray-600">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: arc.color }} />
            {arc.label} <span className="font-semibold text-gray-800">{arc.pct}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
