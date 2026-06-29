"use client";

import type { AdminStatsCounts } from "@/types/admin";
import Link from "next/link";

interface KpiCard {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}

const ACCENTS = [
  "from-brand-600 to-brand-700",
  "from-success-600 to-emerald-600",
  "from-amber-500 to-warning-600",
  "from-accent-500 to-accent-600",
  "from-danger-600 to-rose-600",
  "from-navy-600 to-navy-700",
  "from-brand-400 to-brand-600",
];

interface AdminStatsGridProps {
  counts: AdminStatsCounts;
  costTotal: number;
  costCalls: number;
  successRate: number;
  ingestRunning: boolean;
  freshnessPct?: number;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

export function AdminStatsGrid({ counts, costTotal, costCalls, successRate, ingestRunning, freshnessPct }: AdminStatsGridProps) {
  const cards: (KpiCard & { href?: string })[] = [
    { label: "Companies", value: fmt(counts.companies), sub: `${fmt(counts.funding_rounds)} rounds`, accent: ACCENTS[0], href: "/admin/data/companies" },
    { label: "Investors", value: fmt(counts.investors), sub: `${fmt(counts.founders)} founders`, accent: ACCENTS[1], href: "/admin/data/investors" },
    { label: "News Events", value: fmt(counts.news_events), sub: `${fmt(costCalls)} agent calls`, accent: ACCENTS[2] },
    { label: "Ingestion", value: `${successRate}%`, sub: ingestRunning ? "● Running" : "○ Idle", accent: ACCENTS[3], href: "/admin/ingestion" },
    { label: "Submissions", value: fmt(counts.submissions), sub: `${counts.lists} curated lists`, accent: ACCENTS[4], href: "/admin/data/submissions" },
    { label: "Agent Cost", value: `$${costTotal.toFixed(2)}`, sub: `${costCalls} calls`, accent: ACCENTS[5] },
    { label: "Data Freshness", value: freshnessPct != null ? `${freshnessPct}%` : "—", sub: "updated ≤90d", accent: ACCENTS[6] },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map((card) => {
        const content = (
          <>
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${card.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="relative">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                {card.label}
              </div>
              <div className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-gray-900">
                {card.value}
              </div>
              {card.sub && (
                <div className="mt-1.5 text-xs text-gray-400">{card.sub}</div>
              )}
            </div>
          </>
        );

        const classes = "group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg block";

        return card.href ? (
          <Link key={card.label} href={card.href} className={classes}>
            {content}
          </Link>
        ) : (
          <div key={card.label} className={classes}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
