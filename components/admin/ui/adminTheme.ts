import type { AdminSeverity } from "@/types/admin";

// ── Surface tokens (light mode) ──

export const adminSurfaceClass =
  "rounded-[22px] border border-black/10 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20";

export const adminCardClass =
  "rounded-2xl border border-gray-100 bg-white/90 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/90 dark:hover:shadow-gray-900/50";

// ── Control tokens ──

export const adminInputClass =
  "min-h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20";

export const adminSelectClass =
  "min-h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat pr-10 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-brand-400 dark:focus:ring-brand-400/20";

export const adminControlClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-400/30 disabled:cursor-not-allowed disabled:opacity-60";

export const adminGhostControlClass =
  "inline-flex min-h-11 items-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-brand-400/30 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-400/30 dark:hover:bg-brand-900/30";

// ── Severity tokens ──

export const adminSeveritySurfaceMap: Record<AdminSeverity, string> = {
  good: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/30",
  danger: "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/30",
  info: "border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/30",
  muted: "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50",
};

export const adminSeverityPillMap: Record<AdminSeverity, string> = {
  good: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  info: "border-brand-200 bg-brand-100 text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-400",
  muted: "border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400",
};

export const adminSeverityAccentMap: Record<AdminSeverity, string> = {
  good: "from-emerald-500/60 to-emerald-300/20",
  warning: "from-amber-500/60 to-amber-300/20",
  danger: "from-rose-500/60 to-rose-300/20",
  info: "from-brand-500/60 to-brand-300/20",
  muted: "from-gray-400/40 to-gray-200/10",
};

export const adminSeverityDotMap: Record<AdminSeverity, string> = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-brand-500",
  muted: "bg-gray-400",
};

// ── Button variant tokens ──

export const adminButtonVariantMap = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600",
  danger: "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600",
  ghost: "border border-gray-200 bg-white text-gray-700 hover:border-brand-400/30 hover:bg-brand-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100",
} as const;

// ── Layout tokens ──

export const adminMaxWidth = "max-w-[1280px]";

export const adminBackgroundGradient = "bg-gray-50 dark:bg-gray-900";

// ── Divider token ──

export const adminDividerClass = "h-px bg-gray-200 dark:bg-gray-700";

// ── Eyebrow token ──

export const adminEyebrowClass =
  "text-xs font-extrabold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400";

// ── Sidebar tokens ──

export const sidebarWidth = "w-60";
export const sidebarCollapsedWidth = "w-14";
export const sidebarBg = "bg-white dark:bg-gray-900";
export const sidebarBorder = "border-r border-gray-200 dark:border-gray-700";

export const sidebarGroupHeader =
  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 transition-colors hover:text-gray-600";

export const sidebarItem =
  "relative flex items-center rounded-md px-2 py-1.5 text-[13px] font-medium transition-all duration-150";
export const sidebarItemActive = "bg-brand-50 text-brand-700";
export const sidebarItemInactive = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

export const sidebarAccentBar =
  "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-600";

export const sidebarBadge =
  "ml-auto inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-brand-100 px-1.5 text-[10px] font-bold text-brand-700";

export const sidebarCollapseButton =
  "flex w-full items-center justify-center gap-2 border-t border-gray-100 px-3 py-3 text-xs text-gray-400 transition-colors hover:text-gray-600";

// ── Dark mode shell tokens (rules/plan_dashboard.md §10 Phase 5.6) ──

export const adminShellDark = "dark:bg-gray-900 dark:text-gray-100";
export const adminHeaderDark = "dark:border-gray-800 dark:bg-gray-900/70";
export const adminSidebarDark = "dark:bg-gray-900 dark:border-gray-800";
export const adminSidebarBgDark = "dark:bg-gray-900";
export const adminSidebarItemDarkInactive = "dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200";
export const adminSidebarItemDarkActive = "dark:bg-gray-800 dark:text-gray-100";
export const adminSidebarGroupHeaderDark = "dark:text-gray-500 dark:hover:text-gray-300";
export const adminSidebarBorderDark = "dark:border-gray-800";
export const adminBreadcrumbDark = "dark:text-gray-400";
export const adminCardDark = "dark:border-gray-800 dark:bg-gray-800";
export const adminPageHeaderTitleDark = "dark:text-gray-100";
export const adminPageHeaderDescDark = "dark:text-gray-400";
export const adminPageHeaderEyebrowDark = "dark:text-brand-400";
export const adminTableToolbarDark = "dark:from-gray-800 dark:to-gray-800/50 dark:border-gray-700";
export const adminTableHeaderDark = "dark:from-gray-800 dark:to-gray-700";
export const adminTableRowDark = "dark:border-gray-800 dark:text-gray-300";
export const adminTableRowAltDark = "dark:bg-gray-800/50";
export const adminTableHoverDark = "dark:hover:from-brand-900/20 dark:hover:to-gray-800";
export const adminSearchInputDark = "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500";
export const adminToolbarBgDark = "dark:bg-gray-800";
export const adminPillDark = "dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300";

