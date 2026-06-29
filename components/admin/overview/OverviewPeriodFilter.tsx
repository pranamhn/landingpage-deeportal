"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

const PERIODS = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "all", label: "All" },
];

/** rules/plan_dashboard.md §11 Phase 6.10 — period filter pills.
 * Set ?period= URL param, server component re-fetches. */
export function OverviewPeriodFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("period") ?? "30d";

  const setPeriod = (period: string) => {
    const sp = new URLSearchParams(params.toString());
    if (period === "30d") sp.delete("period");
    else sp.set("period", period);
    router.replace(`/admin?${sp.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-6 flex items-center gap-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => setPeriod(p.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            active === p.value
              ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
