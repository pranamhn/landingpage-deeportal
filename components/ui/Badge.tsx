import { cn } from "@/lib/cn";

export type BadgeVariant = "brand" | "accent" | "sector" | "success" | "warning" | "danger" | "neutral" | "info";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  brand: "bg-brand-50 text-brand-700",
  accent: "bg-accent-50 text-accent-500",
  sector: "bg-sector-50 text-sector-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  neutral: "bg-gray-100 text-muted",
  info: "bg-blue-50 text-blue-700",
};

export function statusBadgeVariant(status: string | null | undefined): BadgeVariant {
  switch (status) {
    case "operating":
      return "success";
    case "acquired":
      return "brand";
    case "shut_down":
      return "danger";
    default:
      return "neutral";
  }
}

export default function Badge({
  children,
  variant = "neutral",
  className,
  title,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  title?: string;
}) {
  return (
    <span title={title} className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", VARIANT_CLASSES[variant], className)}>
      {children}
    </span>
  );
}
