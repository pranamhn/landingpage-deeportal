"use client";

import { useState, useEffect } from "react";

const SHORTCUTS = [
  { keys: "Ctrl+\\", desc: "Toggle sidebar collapse", section: "Global" },
  { keys: "Ctrl+K", desc: "Open command palette", section: "Global" },
  { keys: "?", desc: "Show this cheatsheet", section: "Global" },
  { keys: "g o", desc: "Go to Overview", section: "Navigation" },
  { keys: "g i", desc: "Go to Ingestion", section: "Navigation" },
  { keys: "g m", desc: "Go to Moderation", section: "Navigation" },
  { keys: "g c", desc: "Go to Companies", section: "Navigation" },
  { keys: "g d", desc: "Go to Data Quality", section: "Navigation" },
  { keys: "g e", desc: "Go to Engine Status", section: "Navigation" },
  { keys: "j / k", desc: "Navigate moderation cards", section: "Moderation" },
  { keys: "a", desc: "Accept submission", section: "Moderation" },
  { keys: "r", desc: "Reject submission", section: "Moderation" },
  { keys: "Enter", desc: "Save inline edit", section: "Table" },
  { keys: "Escape", desc: "Cancel inline edit / close modal", section: "Table" },
];

/** rules/plan_dashboard.md §12 Phase 7.2 — tekan ? untuk lihat semua shortcut. */
export function AdminShortcutCheatsheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  const sections = [...new Set(SHORTCUTS.map((s) => s.section))];

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center pt-[10vh]">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h2>
          <button
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {sections.map((section) => (
            <div key={section} className="mb-2">
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{section}</p>
              {SHORTCUTS.filter((s) => s.section === section).map((s) => (
                <div key={s.keys + s.desc} className="flex items-center justify-between rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{s.desc}</span>
                  <kbd className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-mono text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">{s.keys}</kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
