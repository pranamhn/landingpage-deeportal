"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { id: "charts", label: "Charts" },
  { id: "timeline", label: "Timeline" },
  { id: "funding", label: "Funding" },
  { id: "activity", label: "Activity" },
];

const PERIODS = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "all", label: "All" },
];

export function AdminQuickJumpNav() {
  const [active, setActive] = useState("charts");
  const router = useRouter();
  const params = useSearchParams();
  const activePeriod = params.get("period") ?? "30d";

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const setPeriod = (period: string) => {
    const sp = new URLSearchParams(params.toString());
    if (period === "30d") sp.delete("period");
    else sp.set("period", period);
    router.replace(`/admin?${sp.toString()}`, { scroll: false });
  };

  return (
    <nav className="sticky top-16 z-40 border-b border-gray-200/60 bg-white/70 backdrop-blur-xl px-4 py-2 dark:border-gray-700 dark:bg-gray-900/70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {LINKS.map(({ id, label }) => (
            <a
              key={id}
              href={`#section-${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                active === id
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300",
              )}
            >
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                activePeriod === p.value
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
