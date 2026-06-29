"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import type { Period } from "@/components/admin/ingestion/SourceOverviewTable";

const PERIODS: { key: Period; label: string }[] = [
  { key: "1h", label: "1h" },
  { key: "24h", label: "24h" },
  { key: "30d", label: "30d" },
  { key: "365d", label: "1y" },
  { key: "all", label: "All" },
];

export function PeriodFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = (searchParams.get("period") as Period) || "all";

  function setPeriod(p: Period) {
    const params = new URLSearchParams(searchParams.toString());
    if (p === "all") params.delete("period");
    else params.set("period", p);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-1 rounded-xl bg-gray-100/80 p-1 dark:bg-gray-800/80">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => setPeriod(p.key)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
            period === p.key
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
