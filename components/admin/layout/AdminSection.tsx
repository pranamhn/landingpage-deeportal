import { cn } from "@/lib/cn";
import { AdminPanel } from "@/components/admin/ui/AdminPanel";
import { adminEyebrowClass } from "@/components/admin/ui/adminTheme";

export function AdminSection({
  eyebrow,
  title,
  description,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <AdminPanel>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={cn("mb-2", adminEyebrowClass)}>{eyebrow}</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{title}</h2>
          {description ? <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </AdminPanel>
  );
}
