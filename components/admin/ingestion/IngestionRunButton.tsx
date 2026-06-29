"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export function IngestionRunButton({ running }: { running: boolean }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setPending(true);
    try {
      await fetch(`/api/v1/admin/ingestion/${running ? "stop" : "start"}`, { method: "POST" });
      router.refresh();
    } catch { /* ignore */ }
    setPending(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "group relative inline-flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-60",
        "shadow-lg hover:shadow-xl active:scale-[0.97]",
        running
          ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-rose-200/40 dark:shadow-rose-900/30"
          : "bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-brand-200/40 dark:shadow-brand-900/30",
      )}
    >
      {/* glow ring on hover */}
      <span className={cn(
        "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        running
          ? "ring-2 ring-rose-400/40"
          : "ring-2 ring-brand-400/40",
      )} />

      {pending ? (
        <svg className="relative h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : running ? (
        <svg className="relative h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg className="relative h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.5 4.5v15l13-7.5z" />
        </svg>
      )}
      <span className="relative">{pending ? "Processing..." : running ? "Stop Ingestion" : "Run Ingestion"}</span>
    </button>
  );
}
