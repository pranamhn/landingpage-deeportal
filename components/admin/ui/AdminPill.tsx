import { cn } from "@/lib/cn";
import type { AdminSeverity } from "@/types/admin";
import { adminSeverityPillMap, adminPillDark } from "./adminTheme";

export function AdminPill({
  children,
  severity = "info",
}: {
  children: React.ReactNode;
  severity?: AdminSeverity;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-bold tracking-wide",
        adminSeverityPillMap[severity],
        severity === "muted" && adminPillDark,
      )}
    >
      {children}
    </span>
  );
}
