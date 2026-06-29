import { AdminPill } from "@/components/admin/ui/AdminPill";
import { adminEyebrowClass, adminPageHeaderTitleDark, adminPageHeaderDescDark, adminPageHeaderEyebrowDark } from "@/components/admin/ui/adminTheme";
import { cn } from "@/lib/cn";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  pills,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  pills?: Array<{ label: string; severity?: "good" | "warning" | "danger" | "info" | "muted" }>;
  /** Konten bebas di sisi kanan header (mis. summary card) — beda dari
   * `pills` (badge sederhana), dipakai kalau butuh layout lebih dari itu. */
  children?: React.ReactNode;
}) {
  return (
    <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        <p className={cn("mb-2", adminEyebrowClass, adminPageHeaderEyebrowDark)}>{eyebrow}</p>
        <h1 className={cn("font-display text-4xl font-bold tracking-tight text-gray-900", adminPageHeaderTitleDark)}>{title}</h1>
        <p className={cn("mt-3 text-sm leading-6 text-gray-700", adminPageHeaderDescDark)}>{description}</p>
      </div>
      {pills?.length ? (
        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <AdminPill key={pill.label} severity={pill.severity}>
              {pill.label}
            </AdminPill>
          ))}
        </div>
      ) : null}
      {children}
    </section>
  );
}
