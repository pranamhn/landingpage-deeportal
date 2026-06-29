import type { ChartDataPoint } from "@/types/admin";
import { colorForLabel, CATEGORICAL } from "./chartColors";

interface AdminLineChartProps {
  /** Single series: array of {label, value} */
  data?: ChartDataPoint[];
  /** Multi-series: array of {name, color, data: [{label, value}]} */
  series?: { name: string; color?: string; data: ChartDataPoint[] }[];
  width?: number;
  height?: number;
  className?: string;
}

/** Pure SVG line/area chart — SSR-compatible. */
export function AdminLineChart({
  data,
  series: multiSeries,
  width = 600,
  height = 220,
  className,
}: AdminLineChartProps) {
  const seriesList = multiSeries
    ? multiSeries.map((s) => ({
      ...s,
      data: s.data.filter((d) => d.label != null && d.value != null),
    })).filter((s) => s.data.length > 0)
    : data
      ? [{ name: "", color: CATEGORICAL[0], data: data.filter((d) => d.label != null && d.value != null) }]
      : [];
  if (seriesList.length === 0) {
    return <div className="flex h-40 items-center justify-center text-sm text-gray-400">No data</div>;
  }

  const pad = { top: 20, right: 24, bottom: 28, left: 48 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  // Find all unique labels across all series (x-axis)
  const allLabels = [...new Set(seriesList.flatMap((s) => s.data.map((d) => d.label)))];
  const maxVal = Math.max(...seriesList.flatMap((s) => s.data.map((d) => d.value)), 1);

  const xScale = (i: number) => pad.left + (allLabels.length > 1 ? (i / (allLabels.length - 1)) * chartW : chartW / 2);
  const yScale = (v: number) => pad.top + chartH - (v / maxVal) * chartH;

  // Build per-series polyline points
  const seriesPolylines = seriesList.map((series) => {
    const color = series.color ?? colorForLabel(series.name);
    const points = series.data
      .map((d) => {
        const idx = allLabels.indexOf(d.label);
        return idx >= 0 ? `${xScale(idx)},${yScale(d.value)}` : null;
      })
      .filter(Boolean)
      .join(" ");
    return { name: series.name, color, points };
  });

  // Y-axis grid lines
  const gridLines = 4;
  const gridYs = Array.from({ length: gridLines }, (_, i) => {
    const val = Math.round((maxVal / gridLines) * (i + 1));
    return { y: yScale(val), label: val.toLocaleString() };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width: "100%", height: "auto", maxWidth: width }}
      role="img"
      aria-label="Line chart"
    >
      {/* Grid lines */}
      {gridYs.map((g) => (
        <g key={g.label}>
          <line
            x1={pad.left}
            y1={g.y}
            x2={width - pad.right}
            y2={g.y}
            stroke="#e5e7eb"
            strokeDasharray="4 3"
          />
          <text
            x={pad.left - 6}
            y={g.y + 4}
            textAnchor="end"
            className="fill-gray-400 text-[10px]"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {g.label}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {allLabels.map((label, i) => (
        <text
          key={label}
          x={xScale(i)}
          y={height - 4}
          textAnchor="middle"
          className="fill-gray-400 text-[10px]"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {label.length > 8 ? label.slice(0, 7) + "…" : label}
        </text>
      ))}

      {/* Polylines */}
      {seriesPolylines.map((s) =>
        s.points ? (
          <polyline
            key={s.name}
            points={s.points}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null,
      )}

      {/* Dots */}
      {seriesList.map((series) => {
        const color = series.color ?? colorForLabel(series.name);
        return series.data.map((d) => {
          const idx = allLabels.indexOf(d.label);
          if (idx < 0) return null;
          return (
            <circle
              key={`${series.name}-${d.label}`}
              cx={xScale(idx)}
              cy={yScale(d.value)}
              r={3}
              fill={color}
            />
          );
        });
      })}
    </svg>
  );
}
