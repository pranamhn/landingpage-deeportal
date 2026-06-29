import type { ChartDataPoint } from "@/types/admin";
import { CHART, colorForLabel } from "./chartColors";

interface AdminBarChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  maxBars?: number;
  /** Orientation: "horizontal" (default) or "vertical" */
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/** Pure SVG horizontal/vertical bar chart — SSR-compatible, zero JS dependency. */
export function AdminBarChart({
  data,
  width = 600,
  height,
  maxBars = 12,
  orientation = "horizontal",
  className,
}: AdminBarChartProps) {
  const sorted = [...data]
    .filter((d) => d.label != null && d.value != null)
    .sort((a, b) => b.value - a.value)
    .slice(0, maxBars);

  if (sorted.length === 0) {
    return <div className="flex h-40 items-center justify-center text-sm text-gray-400">No data</div>;
  }

  const maxVal = sorted[0]?.value ?? 1;

  if (orientation === "horizontal") {
    const barH = CHART.barHeight;
    const gap = CHART.barGap;
    const pad = CHART.padding;
    const chartH = height ?? sorted.length * (barH + gap) + pad.top + pad.bottom;
    const barAreaW = width - pad.left - pad.right;

    return (
      <svg
        viewBox={`0 0 ${width} ${chartH}`}
        className={className}
        style={{ width: "100%", height: "auto", maxWidth: width }}
        role="img"
        aria-label="Horizontal bar chart"
      >
        {sorted.map((item, i) => {
          const y = pad.top + i * (barH + gap);
          const barW = Math.max((item.value / maxVal) * barAreaW, 3);
          const color = item.color ?? colorForLabel(item.label);
          return (
            <g key={`${item.label}-${i}`}>
              <text
                x={pad.left - 8}
                y={y + barH / 2 + 1}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-gray-600 text-[11px]"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {item.label.length > 18 ? item.label.slice(0, 17) + "…" : item.label}
              </text>
              <rect
                x={pad.left}
                y={y}
                width={barW}
                height={barH}
                rx={CHART.barRadius}
                fill={color}
                opacity={0.85}
              />
              <text
                x={pad.left + barW + 6}
                y={y + barH / 2 + 1}
                dominantBaseline="middle"
                className="fill-gray-700 text-[11px] font-semibold"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {item.value.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // Vertical bars
  const barW = Math.max(24, (width - CHART.padding.left - CHART.padding.right) / sorted.length - 8);
  const chartH = height ?? 220;
  const barAreaH = chartH - CHART.padding.top - CHART.padding.bottom - 20;

  return (
    <svg
      viewBox={`0 0 ${width} ${chartH}`}
      className={className}
      style={{ width: "100%", height: "auto", maxWidth: width }}
      role="img"
      aria-label="Vertical bar chart"
    >
      {sorted.map((item, i) => {
        const x = CHART.padding.left + i * (barW + 8) + 4;
        const barH = Math.max((item.value / maxVal) * barAreaH, 2);
        const y = chartH - CHART.padding.bottom - barH;
        const color = item.color ?? colorForLabel(item.label);
        return (
          <g key={item.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={CHART.barRadius}
              fill={color}
              opacity={0.85}
            />
            <text
              x={x + barW / 2}
              y={chartH - 4}
              textAnchor="middle"
              className="fill-gray-500 text-[10px]"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {item.label.length > 10 ? item.label.slice(0, 9) + "…" : item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
