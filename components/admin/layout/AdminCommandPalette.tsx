"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_NAV_GROUPS, type NavItem } from "@/lib/adminNavConfig";

interface PaletteResult {
  label: string;
  href: string;
  group: string;
  icon: React.ReactNode;
}

function buildResults(query: string): PaletteResult[] {
  const q = query.toLowerCase().trim();
  const results: PaletteResult[] = [];
  for (const group of ADMIN_NAV_GROUPS) {
    for (const item of group.items) {
      if (!q || item.label.toLowerCase().includes(q) || group.label.toLowerCase().includes(q)) {
        results.push({ label: item.label, href: item.href, group: group.label, icon: item.icon });
      }
    }
  }
  return results;
}

/** rules/plan_dashboard.md §10 Phase 5.7 — command palette popup.
 * Ctrl+K buka, Escape tutup, Enter navigasi, ↑/↓ pilih result. */
export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = buildResults(query);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  // Ctrl+K handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = (href: string) => {
    router.push(href);
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); return; }
    if (e.key === "Enter" && results[selected]) {
      navigate(results[selected].href);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/40" onClick={close} aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-800">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm outline-none placeholder:text-gray-400 dark:bg-transparent dark:text-gray-200 dark:placeholder:text-gray-500"
          />
          <kbd className="text-[11px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 font-sans">esc</kbd>
        </div>
        {results.length > 0 ? (
          <ul className="max-h-72 overflow-y-auto py-2">
            {results.map((r, i) => (
              <li key={r.href}>
                <button
                  type="button"
                  onClick={() => navigate(r.href)}
                  onMouseEnter={() => setSelected(i)}
                  className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors ${i === selected ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {r.icon}
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium">{r.label}</span>
                    <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{r.group}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
            No pages match &ldquo;{query}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
