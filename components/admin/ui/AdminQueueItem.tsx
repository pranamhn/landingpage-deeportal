import Link from "next/link";
import { DuplicateDecisionCard } from "@/components/admin/data-quality/DuplicateDecisionCard";
import { AdminActionRow } from "@/components/admin/layout/AdminActionRow";
import { cn } from "@/lib/cn";
import type { AdminQueueItem } from "@/types/admin";
import { AdminPill } from "./AdminPill";
import { adminSeveritySurfaceMap, adminGhostControlClass } from "./adminTheme";

export function AdminQueueItemCard({ item }: { item: AdminQueueItem }) {
  const severity = item.severity ?? "muted";
  const isCompareCard =
    item.actions?.length === 2 &&
    item.actions[0]?.label === "A" &&
    item.actions[1]?.label === "B" &&
    (item.meta?.length ?? 0) >= 2 &&
    item.title.includes("↔");
  const compareNames = isCompareCard ? item.title.split("↔").map((value) => value.trim()) : [];
  const leftName = compareNames[0];
  const rightName = compareNames[1];

  if (isCompareCard) {
    return (
      <DuplicateDecisionCard
        leftProfile={{
          id: item.compare?.left.id ?? item.meta?.[0] ?? "",
          name: item.compare?.left.name ?? leftName,
          sector: item.compare?.left.sector,
          location: item.compare?.left.location,
          foundedYear: item.compare?.left.foundedYear,
          status: item.compare?.left.status,
          website: item.compare?.left.website,
        }}
        rightProfile={{
          id: item.compare?.right.id ?? item.meta?.[1] ?? "",
          name: item.compare?.right.name ?? rightName,
          sector: item.compare?.right.sector,
          location: item.compare?.right.location,
          foundedYear: item.compare?.right.foundedYear,
          status: item.compare?.right.status,
          website: item.compare?.right.website,
        }}
        similarityLabel={item.description}
        severity={severity}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600",
        adminSeveritySurfaceMap[severity],
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-400">{item.description}</p>
          {item.meta && item.meta.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.meta.map((value) => (
                <AdminPill key={value} severity={severity === "danger" ? "danger" : "muted"}>
                  {value}
                </AdminPill>
              ))}
            </div>
          ) : null}
        </div>
        {item.actions?.length ? (
          <AdminActionRow>
            {item.actions.map((action) => (
              <Link key={action.href + action.label} href={action.href} className={adminGhostControlClass}>
                {action.label}
              </Link>
            ))}
          </AdminActionRow>
        ) : null}
      </div>
    </div>
  );
}
