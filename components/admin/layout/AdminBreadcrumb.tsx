"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { findNavItemByHref } from "@/lib/adminNavConfig";

/** rules/plan_dashboard.md §10 Phase 2.1 — breadcrumb otomatis dari
 * adminNavConfig (satu sumber kebenaran dengan sidebar, bukan hardcode
 * label terpisah). Hidden di /admin (Overview, depth 1) — tidak ada
 * konteks berguna ditampilkan di halaman paling atas. */
export function AdminBreadcrumb() {
  const pathname = usePathname();
  if (!pathname || pathname === "/admin") return null;

  const match = findNavItemByHref(pathname);
  if (!match) return null;

  const { item, group } = match;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm">
      <Link href="/admin" className="flex items-center text-gray-400 transition-colors hover:text-gray-600" aria-label="Home">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
        </svg>
      </Link>
      <span className="text-gray-300">/</span>
      <span className="text-gray-500">{group.label}</span>
      <span className="text-gray-300">/</span>
      <span className="font-semibold text-gray-900">{item.label}</span>
    </nav>
  );
}
