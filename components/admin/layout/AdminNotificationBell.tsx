"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface ActivityItem {
  text: string;
  timestamp: string;
}

/** rules/plan_dashboard.md §10 Phase 5.8 — notification bell di header.
 * Poll activity dari backend tiap 60s, tampilkan dropdown. */
export function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const resp = await fetch("/api/v1/admin/engine/status?range=24h");
        const json = await resp.json();
        if (!cancelled && json.success && json.data?.activity_log) {
          const log: ActivityItem[] = json.data.activity_log.slice(0, 10);
          setItems(log);
          const stored = localStorage.getItem("admin-notif-last-seen");
          if (stored) {
            const lastSeen = new Date(stored).getTime();
            setUnread(log.filter((a) => new Date(a.timestamp).getTime() > lastSeen).length);
          } else {
            setUnread(log.length);
          }
        }
      } catch { /* ignore */ }
    }
    load();
    const interval = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markRead = () => {
    setUnread(0);
    localStorage.setItem("admin-notif-last-seen", new Date().toISOString());
  };

  const toggle = () => {
    if (!open) markRead();
    setOpen((prev) => !prev);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:text-gray-400"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl z-50 dark:border-gray-600 dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">Notifications</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{items.length} recent</span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length > 0 ? (
              items.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "border-b border-gray-50 px-4 py-2.5 text-sm text-gray-700 last:border-b-0 dark:border-gray-700 dark:text-gray-300",
                    i < unread && "bg-brand-50/50 dark:bg-brand-900/20",
                  )}
                >
                  <p className="text-xs">{item.text}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{item.timestamp}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">No recent activity</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
