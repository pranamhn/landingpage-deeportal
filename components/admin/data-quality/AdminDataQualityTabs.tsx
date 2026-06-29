"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { DuplicateScanForm, ManualMergeForm } from "@/components/admin/actions/DataQualityActions";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminQueueItemCard } from "@/components/admin/ui/AdminQueueItem";
import { AdminTabsPanel, type AdminTabMeta } from "@/components/admin/ui/AdminTabsPanel";
import { adminDividerClass } from "@/components/admin/ui/adminTheme";
import type { AdminSection, AdminSeverity } from "@/types/admin";

type DataQualityTabId =
  | "actions"
  | "duplicates"
  | "missing"
  | "conflicts"
  | "stale"
  | "source-issues"
  | "failures";

const TAB_IDS: DataQualityTabId[] = [
  "actions",
  "duplicates",
  "missing",
  "conflicts",
  "stale",
  "source-issues",
  "failures",
];

function isValidTab(value: string | null): value is DataQualityTabId {
  return !!value && TAB_IDS.includes(value as DataQualityTabId);
}

function getSectionSeverity(section?: AdminSection): AdminSeverity {
  const severities = (section?.items ?? []).map((item) => item.severity ?? "muted");
  if (severities.includes("danger")) return "danger";
  if (severities.includes("warning")) return "warning";
  if (severities.includes("info")) return "info";
  if (severities.includes("good")) return "good";
  return "muted";
}

function QueueTabContent({
  section,
  emptyTitle,
  emptyDescription,
}: {
  section?: AdminSection;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <div className="space-y-3">
      {(section?.items ?? []).length ? (
        section!.items.slice(0, 8).map((item) => (
          <AdminQueueItemCard key={item.title + item.description} item={item} />
        ))
      ) : (
        <AdminEmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  );
}

export function AdminDataQualityTabs({
  sections,
  initialTabId = "actions",
}: {
  sections: AdminSection[];
  initialTabId?: DataQualityTabId;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTabId = isValidTab(requestedTab) ? requestedTab : initialTabId;

  const duplicateSection = sections.find((section) => section.eyebrow === "Duplicate candidates");
  const missingSection = sections.find((section) => section.eyebrow === "Missing fields");
  const conflictsSection = sections.find((section) => section.eyebrow === "Funding conflicts");
  const staleSection = sections.find((section) => section.eyebrow === "Stale profiles");
  const sourceSection = sections.find((section) => section.eyebrow === "Source URL issues");
  const failuresSection = sections.find((section) => section.eyebrow === "Extraction failures");

  const tabs: AdminTabMeta[] = useMemo(
    () => [
      {
        id: "actions",
        label: "Admin actions",
        shortLabel: "Actions",
        eyebrow: "Admin actions",
        title: "Duplicate scan & merge",
        description: "Jalankan scan duplicate otomatis atau merge manual tanpa perlu turun ke banyak card berbeda.",
        count: 2,
        severity: "info",
      },
      {
        id: "duplicates",
        label: "Duplicate candidates",
        shortLabel: "Dupes",
        eyebrow: duplicateSection?.eyebrow ?? "Duplicate candidates",
        title: duplicateSection?.title ?? "Kandidat duplicate",
        description: duplicateSection?.description,
        count: duplicateSection?.items.length ?? 0,
        severity: getSectionSeverity(duplicateSection),
      },
      {
        id: "missing",
        label: "Missing fields",
        shortLabel: "Missing",
        eyebrow: missingSection?.eyebrow ?? "Missing fields",
        title: missingSection?.title ?? "Missing fields",
        description: missingSection?.description,
        count: missingSection?.items.length ?? 0,
        severity: getSectionSeverity(missingSection),
      },
      {
        id: "conflicts",
        label: "Funding conflicts",
        shortLabel: "Funding",
        eyebrow: conflictsSection?.eyebrow ?? "Funding conflicts",
        title: conflictsSection?.title ?? "Funding conflicts",
        description: conflictsSection?.description,
        count: conflictsSection?.items.length ?? 0,
        severity: getSectionSeverity(conflictsSection),
      },
      {
        id: "stale",
        label: "Stale profiles",
        shortLabel: "Stale",
        eyebrow: staleSection?.eyebrow ?? "Stale profiles",
        title: staleSection?.title ?? "Stale profiles",
        description: staleSection?.description,
        count: staleSection?.items.length ?? 0,
        severity: getSectionSeverity(staleSection),
      },
      {
        id: "source-issues",
        label: "Source URL issues",
        shortLabel: "Sources",
        eyebrow: sourceSection?.eyebrow ?? "Source URL issues",
        title: sourceSection?.title ?? "Source URL issues",
        description: sourceSection?.description,
        count: sourceSection?.items.length ?? 0,
        severity: getSectionSeverity(sourceSection),
      },
      {
        id: "failures",
        label: "Extraction failures",
        shortLabel: "Fails",
        eyebrow: failuresSection?.eyebrow ?? "Extraction failures",
        title: failuresSection?.title ?? "Extraction failures",
        description: failuresSection?.description,
        count: failuresSection?.items.length ?? 0,
        severity: getSectionSeverity(failuresSection),
      },
    ],
    [conflictsSection, duplicateSection, failuresSection, missingSection, sourceSection, staleSection],
  );

  function handleTabChange(nextTabId: string) {
    if (!isValidTab(nextTabId)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <AdminTabsPanel tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabChange}>
      {activeTabId === "actions" ? (
        <div className="space-y-4">
          <DuplicateScanForm />
          <div className={adminDividerClass} />
          <ManualMergeForm />
        </div>
      ) : null}

      {activeTabId === "duplicates" ? (
        <QueueTabContent
          section={duplicateSection}
          emptyTitle="Queue duplicate kosong"
          emptyDescription="Klik scan untuk mencari duplicate candidates."
        />
      ) : null}

      {activeTabId === "missing" ? (
        <QueueTabContent
          section={missingSection}
          emptyTitle="Missing fields kosong"
          emptyDescription="Belum ada profil dengan missing field yang masuk queue."
        />
      ) : null}

      {activeTabId === "conflicts" ? (
        <QueueTabContent
          section={conflictsSection}
          emptyTitle="Funding conflicts kosong"
          emptyDescription="Belum ada konflik data funding yang perlu direview."
        />
      ) : null}

      {activeTabId === "stale" ? (
        <QueueTabContent
          section={staleSection}
          emptyTitle="Stale profiles kosong"
          emptyDescription="Belum ada profil stale yang perlu diperbarui."
        />
      ) : null}

      {activeTabId === "source-issues" ? (
        <QueueTabContent
          section={sourceSection}
          emptyTitle="Source URL issues kosong"
          emptyDescription="Belum ada masalah source URL yang terdeteksi."
        />
      ) : null}

      {activeTabId === "failures" ? (
        <QueueTabContent
          section={failuresSection}
          emptyTitle="Extraction failures kosong"
          emptyDescription="Tidak ada extraction failure yang perlu ditindak."
        />
      ) : null}
    </AdminTabsPanel>
  );
}
