"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BudgetCard({ budget_usd, spent_usd, exceeded }: { budget_usd: number; spent_usd: number; exceeded: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(budget_usd));
  const [saving, setSaving] = useState(false);
  const spentLabel = spent_usd > 0 && spent_usd < 0.01 ? spent_usd.toFixed(4) : spent_usd.toFixed(2);

  async function save() {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    setSaving(true);
    try {
      await fetch("/api/v1/admin/engine/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget_usd: num }),
      });
      router.refresh();
    } catch { /* ignore */ }
    setSaving(false);
    setEditing(false);
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Budget Spent</div>
        <div className={`mt-1.5 text-2xl font-bold tabular-nums ${exceeded ? "text-rose-600" : "text-gray-900 dark:text-gray-100"}`}>
          ${spentLabel}
        </div>
      </div>
      <div
        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 cursor-pointer hover:border-brand-300 transition-colors"
        onClick={() => !editing && setEditing(true)}
      >
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Daily Budget</div>
        {editing ? (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-400">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              className="w-24 text-2xl font-bold tabular-nums bg-transparent border-b-2 border-brand-400 outline-none text-gray-900 dark:text-gray-100"
              autoFocus
              disabled={saving}
            />
            <button onClick={save} disabled={saving} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              {saving ? "..." : "Save"}
            </button>
          </div>
        ) : (
          <div className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
            ${budget_usd.toFixed(2)}
          </div>
        )}
      </div>
    </>
  );
}
