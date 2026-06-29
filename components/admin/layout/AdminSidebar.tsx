"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ADMIN_NAV_GROUPS, type NavItem } from "@/lib/adminNavConfig";
import {
  sidebarAccentBar, sidebarBadge, sidebarBg, sidebarBorder, sidebarCollapseButton,
  sidebarCollapsedWidth, sidebarGroupHeader, sidebarItem, sidebarItemActive,
  sidebarItemInactive, sidebarWidth,
  adminSidebarDark, adminSidebarItemDarkInactive, adminSidebarItemDarkActive,
  adminSidebarGroupHeaderDark, adminSidebarBorderDark,
} from "@/components/admin/ui/adminTheme";
import { cn } from "@/lib/cn";

const COLLAPSE_STORAGE_KEY = "admin_sidebar_collapsed";

export type BadgeCounts = Partial<Record<NonNullable<NavItem["badgeKey"]>, number>>;

export function isNavItemActive(item: NavItem, pathname: string | null): boolean {
  if (!pathname) return false;
  return item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
}

/** rules/plan_dashboard.md §10 Phase 1.2/1.3 — list grup+item, dipakai DUA
 * tempat (desktop AdminSidebar dan AdminSidebarMobile drawer) supaya logic
 * accordion/active-state/badge tidak diduplikasi. `collapsed` selalu false
 * dari drawer mobile (mini-mode cuma masuk akal di desktop yang punya
 * ruang horizontal lega). `onNavigate` dipanggil saat link diklik — drawer
 * mobile pakai ini utk auto-close. */
export function AdminSidebarNavList({
  collapsed,
  badgeCounts,
  onNavigate,
}: {
  collapsed: boolean;
  badgeCounts?: BadgeCounts;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(ADMIN_NAV_GROUPS.filter((g) => g.defaultExpanded).map((g) => g.id)),
  );

  // Auto-expand group yang punya active route (rules/plan_dashboard.md §5.3)
  useEffect(() => {
    const activeGroup = ADMIN_NAV_GROUPS.find((g) => g.items.some((item) => isNavItemActive(item, pathname)));
    if (activeGroup) {
      setExpandedGroups((prev) => (prev.has(activeGroup.id) ? prev : new Set(prev).add(activeGroup.id)));
    }
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Keyboard nav: Arrow Up/Down pindah fokus antar link yang KELIHATAN
  // (bukan semua item — group yang collapsed link-nya tidak di DOM).
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const container = navRef.current;
    if (!container) return;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>("a[href],button"));
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) return;
    e.preventDefault();
    const nextIndex = e.key === "ArrowDown"
      ? Math.min(currentIndex + 1, focusable.length - 1)
      : Math.max(currentIndex - 1, 0);
    focusable[nextIndex]?.focus();
  };

  return (
    <div ref={navRef} onKeyDown={handleKeyDown} className="flex-1 space-y-0.5">
      {ADMIN_NAV_GROUPS.map((group) => {
        const expanded = expandedGroups.has(group.id);
        const groupHasActive = group.items.some((item) => isNavItemActive(item, pathname));
        return (
          <div key={group.id} className="mb-0.5">
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={cn(sidebarGroupHeader, adminSidebarGroupHeaderDark, groupHasActive && "text-gray-600")}
                aria-expanded={expanded}
              >
                <span>{group.label}</span>
                <svg
                  className={cn("h-3.5 w-3.5 text-gray-400 transition-transform duration-200", expanded && "rotate-180")}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                </svg>
              </button>
            )}
            {(collapsed || expanded) && (
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavItemActive(item, pathname);
                  const badgeCount = item.badgeKey ? badgeCounts?.[item.badgeKey] : undefined;
                  return (
                    <li key={item.href} className="relative" title={collapsed ? item.label : undefined}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(sidebarItem, active ? cn(sidebarItemActive, adminSidebarItemDarkActive) : cn(sidebarItemInactive, adminSidebarItemDarkInactive), collapsed && "justify-center")}
                      >
                        {active && <span className={sidebarAccentBar} />}
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                          <svg
                            className={cn("h-4 w-4", active ? "text-brand-600" : "text-gray-500")}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            {item.icon}
                          </svg>
                        </div>
                        {!collapsed && (
                          <>
                            <span className="ml-2.5 whitespace-nowrap">{item.label}</span>
                            {badgeCount != null && badgeCount > 0 && (
                              <span className={sidebarBadge}>{badgeCount > 99 ? "99+" : badgeCount}</span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** rules/plan_dashboard.md §10 Phase 1.2 — sidebar desktop, collapse/expand
 * mini mode persisten ke localStorage. badgeCounts diisi AdminShell (Phase
 * 5.1) — kosong berarti badge tidak tampil sama sekali, bukan tampil "0"
 * (beda makna: "belum ada data" vs "memang nol"). */
export function AdminSidebar({ badgeCounts }: { badgeCounts?: BadgeCounts }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore collapse state dari localStorage SETELAH mount (bukan di
  // useState initializer) supaya SSR/first-paint konsisten, tidak ada
  // hydration mismatch warning.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {
      // localStorage tidak tersedia (mis. privacy mode) — biarkan default false.
    }
    setHydrated(true);

    // Sinkronisasi dengan AdminHeader collapse toggle via custom event
    // (rules/plan_dashboard.md — topbar redesign).
    const onCollapseEvent = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      setCollapsed(detail);
    };
    window.addEventListener("admin-sidebar-collapse", onCollapseEvent);
    return () => window.removeEventListener("admin-sidebar-collapse", onCollapseEvent);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
    } catch {
      // ignore — persist gagal bukan alasan blokir toggle UI
    }
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 lg:block",
        sidebarBg, sidebarBorder, adminSidebarDark,
        collapsed ? sidebarCollapsedWidth : sidebarWidth,
        hydrated && "transition-[width] duration-200",
      )}
    >
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col px-3 py-4">
        <div className="flex-1 overflow-y-auto">
          <AdminSidebarNavList collapsed={collapsed} badgeCounts={badgeCounts} />
        </div>
      </div>
    </aside>
  );
}
