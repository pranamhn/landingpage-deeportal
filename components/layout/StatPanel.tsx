export interface StatItem {
  label: string;
  value: number | string | null | undefined;
  accent: "brand" | "accent";
}

export default function StatPanel({ items }: { items: StatItem[]; lastUpdatedAt?: number | null }) {
  return (
    <div className="card flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {items.map((stat) => (
          <div key={stat.label} className={`border-l-2 pl-3 ${stat.accent === "brand" ? "border-brand-500" : "border-accent-500"}`}>
            <span
              className={`block font-display text-2xl font-extrabold tabular-nums ${stat.accent === "brand" ? "text-brand-600" : "text-accent-500"
                }`}
            >
              {stat.value ?? "—"}
            </span>
            <span className="text-xs font-semibold text-muted">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
