"use client";

import { AdminDataQualityTabs } from "@/components/admin/data-quality/AdminDataQualityTabs";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { adminCardClass } from "@/components/admin/ui/adminTheme";
import { cn } from "@/lib/cn";
import type { AdminDataQualityData } from "@/types/admin";

interface Props {
  dqData: AdminDataQualityData;
}

/** Simplified DQ Issues viewer — entity tabs (Companies, Founders, etc.)
 * have been promoted to their own pages under /admin/data/*.
 * rules/plan_dashboard.md §10 Phase 3.11 */
export function AdminDataQualityTabsClient({ dqData }: Props) {
  const totalIssues = dqData.sections.reduce((sum, section) => sum + (section.items?.length ?? 0), 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Data Quality"
        title="DQ Issues Dashboard"
        description="Duplicates, missing fields, conflicts, stale profiles, source issues, and extraction failures."
        pills={[
          { label: `${totalIssues} open issues`, severity: totalIssues > 0 ? "warning" : "good" },
        ]}
      />
      <div className={cn(adminCardClass)}>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
          Data Quality Issues
        </h3>
        <AdminDataQualityTabs sections={dqData.sections} />
      </div>
    </div>
  );
}
