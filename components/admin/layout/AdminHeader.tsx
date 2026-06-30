"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebarMobile } from "@/components/admin/layout/AdminSidebarMobile";
import { AdminBreadcrumbSegment } from "@/components/admin/layout/AdminBreadcrumbSegment";
import { AdminNotificationBell } from "@/components/admin/layout/AdminNotificationBell";
import { AdminDarkModeToggle } from "@/components/admin/layout/AdminDarkModeToggle";
import { AdminServiceStatusDots } from "@/components/admin/layout/AdminServiceStatusDots";
import type { BadgeCounts } from "@/components/admin/layout/AdminSidebar";
import { adminHeaderDark } from "@/components/admin/ui/adminTheme";
import { cn } from "@/lib/cn";

export function AdminHeader({ badgeCounts }: { badgeCounts?: BadgeCounts }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/v1/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-gray-200/60 bg-white/70 backdrop-blur-xl ${adminHeaderDark}`}
      role="banner"
    >
      <div className="h-16 w-full flex items-center px-6">
        {/* ── Left: logo + hamburger + breadcrumbs ── */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="bg-white p-2 rounded-lg hover:shadow-md transition-shadow mr-2 shrink-0">
            <img src="/logo.webp" alt="Deeportal" className="h-6 w-auto" width="24" height="24" />
          </div>

          <AdminSidebarMobile badgeCounts={badgeCounts} />

          {pathname && pathname !== "/admin" && (
            <div className="text-gray-700 ml-2 truncate">
              <AdminBreadcrumbSegment />
            </div>
          )}
        </div>

        {/* ── Center: global search → opens command palette ── */}
        <div
          className="hidden md:flex items-center w-80 h-9 bg-gray-50 rounded-md border border-gray-200 px-3 cursor-pointer hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: true, bubbles: true }))}
        >
          <svg className="h-4 w-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
          </svg>
          <span className="flex-1 text-sm text-gray-400">Search pages...</span>
          <kbd className="text-[11px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white font-sans dark:border-gray-600 dark:bg-gray-700">⌘K</kbd>
        </div>
        <button
          className="md:hidden flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: true, bubbles: true }))}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
          </svg>
        </button>

        {/* ── Right: actions + user ── */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <AdminServiceStatusDots />
          <AdminDarkModeToggle />
          <AdminNotificationBell />

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500"
            >
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-medium text-gray-700 leading-tight truncate max-w-[160px] dark:text-gray-200">Admin</p>
              </div>
              <svg className={cn("h-4 w-4 text-gray-400 shrink-0 transition-transform", menuOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50 dark:border-gray-700 dark:bg-gray-800">
                <button
                  onClick={() => { setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                  Settings
                </button>
                <hr className="my-1 border-gray-100 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
