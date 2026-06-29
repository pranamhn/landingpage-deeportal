"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "acquired", label: "Acquired" },
  { value: "ipo", label: "IPO" },
  { value: "closed", label: "Closed" },
];

/** rules/plan_dashboard.md §11 Phase 6.4 — quick filter chips di Companies page.
 * Set ?status= URL param, re-fetch via parent callback. */
export function CompanyFilterChips({
  onStatusChange,
}: {
  onStatusChange?: (status: string) => void;
}) {
  const params = useSearchParams();
  const active = params.get("status") ?? "";

  return (
    <div className="mb-4 flex items-center gap-1">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onStatusChange?.(opt.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            active === opt.value
              ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
