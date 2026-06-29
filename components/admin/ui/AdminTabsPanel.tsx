"use client";

import { cn } from "@/lib/cn";
import type { AdminSeverity } from "@/types/admin";
import {
  adminSeverityPillMap,
  adminSeverityDotMap,
  adminSurfaceClass,
  adminEyebrowClass,
} from "./adminTheme";

export interface AdminTabMeta {
  id: string;
  label: string;
  shortLabel?: string;
  eyebrow: string;
  title: string;
  description?: string;
  count?: number;
  severity?: AdminSeverity;
}

export function AdminTabsPanel({
  tabs,
  activeTabId,
  onTabChange,
  children,
}: {
  tabs: AdminTabMeta[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}) {
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) return null;

  return (
    <div className={cn(adminSurfaceClass, "relative overflow-hidden")}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(77,85,236,0.05),transparent_24%)]" />
      <div className="border-b border-gray-200 px-4 py-4 sm:px-5 dark:border-gray-700">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {tabs.map((tab) => {
            const active = tab.id === activeTab.id;
            const severity = tab.severity ?? "muted";
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-brand-400/30 sm:px-3",
                  active
                    ? "border-brand-400/30 bg-brand-100 text-brand-700 shadow-sm dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200",
                )}
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition-transform duration-200",
                    adminSeverityDotMap[severity],
                    active ? "scale-110" : "scale-100",
                  )}
                />
                <span className="sm:hidden">{tab.shortLabel ?? tab.label}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {(tab.count ?? 0) > 0 ? (
                  <span
                    className={cn(
                      "inline-flex min-w-7 items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-bold transition-transform duration-200",
                      adminSeverityPillMap[severity],
                      active ? "scale-100" : "scale-[0.98]",
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative p-5">
        <div key={activeTab.id} className="animate-admin-tab-content">
          <div className="mb-4">
            <p className={cn("mb-2", adminEyebrowClass)}>{activeTab.eyebrow}</p>
            <h2 className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{activeTab.title}</h2>
            {activeTab.description ? (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">{activeTab.description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
