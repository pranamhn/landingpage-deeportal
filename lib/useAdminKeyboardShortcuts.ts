"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** rules/plan_dashboard.md §10 Phase 5.2 — keyboard shortcuts global.
 * Ctrl+\ → toggle sidebar, Ctrl+K → fokus search, g+key → navigasi. */
export function useAdminKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    let lastG = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Ctrl+\ → toggle sidebar collapse
      if (mod && e.key === "\\") {
        e.preventDefault();
        try {
          const stored = window.localStorage.getItem("admin_sidebar_collapsed");
          const next = stored !== "true";
          window.localStorage.setItem("admin_sidebar_collapsed", String(next));
          window.dispatchEvent(new CustomEvent("admin-sidebar-collapse", { detail: next }));
        } catch { /* ignore */ }
        return;
      }

      // g + key → navigate (Vim-style)
      if (!mod && e.key === "g" && !lastG) {
        lastG = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => { lastG = false; }, 1500);
        return;
      }

      if (lastG) {
        lastG = false;
        if (gTimer) clearTimeout(gTimer);
        const map: Record<string, string> = {
          o: "/admin",
          i: "/admin/ingestion",
          m: "/admin/moderation",
          c: "/admin/data/companies",
          d: "/admin/data-quality",
          e: "/admin/engine",
        };
        const target = map[e.key];
        if (target) {
          e.preventDefault();
          router.push(target);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);
}
