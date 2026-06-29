"use client";

import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminCommandPalette } from "@/components/admin/layout/AdminCommandPalette";
import { AdminShortcutCheatsheet } from "@/components/admin/layout/AdminShortcutCheatsheet";
import { AdminToastProvider } from "@/components/admin/ui/AdminToast";
import { useAdminBadgeCounts } from "@/lib/useAdminBadgeCounts";
import { useAdminKeyboardShortcuts } from "@/lib/useAdminKeyboardShortcuts";
import { adminMaxWidth, adminShellDark } from "@/components/admin/ui/adminTheme";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const badgeCounts = useAdminBadgeCounts();
  useAdminKeyboardShortcuts();

  return (
    <AdminToastProvider>
      <div className={`min-h-screen bg-gray-50 text-gray-900 ${adminShellDark}`}>
        <a
          href="#admin-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-brand-600 focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to content
        </a>
        <AdminHeader badgeCounts={badgeCounts} />
        {/* Sidebar mepet kiri (x=0) — di luar wrapper max-width, beda dari main
       * content yang tetap dibatasi adminMaxWidth di dalam <main>. */}
        <div className="flex">
          <AdminSidebar badgeCounts={badgeCounts} />
          <main id="admin-content" className="min-w-0 flex-1" role="main">
            <div className={`mx-auto ${adminMaxWidth} py-8 animate-admin-page-in`}>
              {children}
            </div>
          </main>
        </div>
        <AdminCommandPalette />
        <AdminShortcutCheatsheet />
      </div>
    </AdminToastProvider>
  );
}
