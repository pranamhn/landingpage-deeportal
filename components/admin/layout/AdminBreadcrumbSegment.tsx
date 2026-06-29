"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { findNavItemByHref } from "@/lib/adminNavConfig";

/** Breadcrumb segment rendered INLINE inside AdminHeader (bukan standalone
 * `nav` block). Menampilkan "Group / Item" saja — Home icon sudah diwakili
 * oleh logo. */
export function AdminBreadcrumbSegment() {
  const pathname = usePathname();
  if (!pathname || pathname === "/admin") return null;

  const match = findNavItemByHref(pathname);
  if (!match) return null;

  const { item, group } = match;

  return (
    <nav className="flex items-center" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        <li className="flex items-center gap-2">
          <span className="text-gray-500">{group.label}</span>
        </li>
        <li className="flex items-center gap-2">
          <svg
            className="h-3.5 w-3.5 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-gray-900 font-medium" aria-current="page">{item.label}</span>
        </li>
      </ol>
    </nav>
  );
}
