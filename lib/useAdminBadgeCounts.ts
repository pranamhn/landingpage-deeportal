"use client";

import { useEffect, useState } from "react";
import type { BadgeCounts } from "@/components/admin/layout/AdminSidebar";

const POLL_INTERVAL_MS = 60_000;

/** rules/plan_dashboard.md §10 Phase 5.1 — badge count sidebar (moderation/
 * submissions/DQ issues), polling 60s. Mulai dari {} (bukan 0) supaya
 * AdminSidebar tahu bedanya "belum sempat fetch" vs "memang nol". */
export function useAdminBadgeCounts(): BadgeCounts {
  const [counts, setCounts] = useState<BadgeCounts>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const resp = await fetch("/api/admin/badge-counts");
        const json = await resp.json();
        if (!cancelled && json.success) {
          setCounts(json.data);
        }
      } catch {
        // Gagal fetch — biarkan badge count yang sudah ada (stale lebih baik
        // daripada menghilang tiba-tiba karena satu request timeout).
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return counts;
}
