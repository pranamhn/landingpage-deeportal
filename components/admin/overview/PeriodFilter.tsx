"use client";

import { useState } from "react";

type Period = "7d" | "30d" | "90d" | "6m" | "1y" | "all";

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
];

interface Props {
  value: Period;
  onChange: (p: Period) => void;
}

export function PeriodFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            value === p.value
              ? "bg-brand-600 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
