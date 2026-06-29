export function AdminBrandBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-11 w-11 text-sm" : "h-14 w-14 text-lg";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 font-display font-bold text-gray-900 shadow-lg ${sizeClass}`}
    >
      HC
    </span>
  );
}
