import type { ReactNode } from "react";

/** rules/plan_dashboard.md §2/§10 Phase 1.1 — satu sumber kebenaran utk
 * sidebar (AdminSidebar.tsx) DAN breadcrumb (AdminBreadcrumb.tsx), supaya
 * label/route tidak didefinisikan dua kali di tempat berbeda. File ini
 * `.tsx` (bukan `.ts` seperti disebut di plan) karena ikon disimpan sebagai
 * JSX langsung, pola yang sama dipakai di AdminShell.tsx/DataQualityTabsClient.tsx
 * sebelumnya — bukan deviasi besar, cuma penyesuaian praktis. */

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  /** Kalau diisi, AdminSidebar nampilkan badge count live utk item ini
   * (rules/plan_dashboard.md §5.1/§10 Phase 5.1) — key dicocokkan ke hasil
   * fetch badge counts, bukan langsung angka statis. */
  badgeKey?: "moderation" | "submissions" | "dataQuality";
}

export interface NavGroup {
  id: string;
  label: string;
  icon: ReactNode;
  defaultExpanded: boolean;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    defaultExpanded: true,
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z" />,
    items: [
      {
        href: "/admin", label: "Overview",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z" />,
      },
    ],
  },
  {
    id: "ingest",
    label: "Ingest & Enrich",
    defaultExpanded: true,
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
    items: [
      {
        href: "/admin/ingestion", label: "Ingestion",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
      },
      {
        href: "/admin/enrichment", label: "Enrichment",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
      },
      {
        href: "/admin/ingestion/bps", label: "BPS Ingestion",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
      },
      {
        href: "/admin/ingestion/kpu", label: "KPU Ingestion",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />,
      },
      {
        href: "/admin/ingestion/data-go-id", label: "data.go.id",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M9 3v18" />,
      },
    ],
  },
  {
    id: "data",
    label: "Data Management",
    defaultExpanded: true,
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    items: [
      {
        href: "/admin/data/companies", label: "Companies",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M6 21V7l6-4 6 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />,
      },
      {
        href: "/admin/data/founders", label: "Founders",
        icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" strokeWidth={2} /></>,
      },
      {
        href: "/admin/data/investors", label: "Investors",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 7-7M21 8h-5v5" />,
      },
      {
        href: "/admin/data/lists", label: "Lists",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
      },
      {
        href: "/admin/data/submissions", label: "Submissions", badgeKey: "submissions",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />,
      },
      {
        href: "/admin/moderation", label: "Moderation", badgeKey: "moderation",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 22V4a1 1 0 0 1 1-1h12l-1.5 5L21 13H5" />,
      },
      {
        href: "/admin/ingestion/articles", label: "Articles",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l4 4v10a2 2 0 0 1-2 2ZM14 4v5h5" />,
      },
      {
        href: "/admin/data/bps", label: "BPS Data",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 1 2 2v2.945M8 3.935V5.5A2.5 2.5 0 0 0 10.5 8h.5a2 2 0 0 1 2 2 2 2 0 1 0 4 0 2 2 0 0 1 2-2h1.064M15 20.488V18a2 2 0 0 1 2-2h3.064M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
      },
      {
        href: "/admin/data-quality", label: "Data Quality", badgeKey: "dataQuality",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Zm-3 10 2.5 2.5L16 8" />,
      },
      {
        href: "/admin/data/funding-rounds", label: "Funding Rounds",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
      },
    ],
  },
  {
    id: "system",
    label: "System",
    defaultExpanded: true,
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    items: [
      {
        href: "/admin/system/backups", label: "Backups",
        icon: <><ellipse cx="12" cy="5" rx="9" ry="3" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5V19A9 3 0 0 0 21 19V5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12A9 3 0 0 0 21 12" /></>,
      },
      {
        href: "/admin/system/logs", label: "Logs",
        icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8" /></>,
      },
      {
        href: "/admin/system/api-keys", label: "API Keys",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 1 1 21 9Z" />,
      },
      {
        href: "/admin/engine/commands", label: "Commands",
        icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17l6-6-6-6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19h8" /></>,
      },
    ],
  },
];

/** Lookup cepat href -> { item, group } — dipakai AdminBreadcrumb supaya
 * tidak perlu nested-loop tiap render. */
export function findNavItemByHref(href: string): { item: NavItem; group: NavGroup } | null {
  for (const group of ADMIN_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.href === href) return { item, group };
    }
  }
  return null;
}
