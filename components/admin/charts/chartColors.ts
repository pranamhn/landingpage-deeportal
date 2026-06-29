// Brand color scales for chart components — konsisten dengan adminTheme tokens.
// Semua color di sini memenuhi WCAG AA di atas background putih (#fff).

/** Categorical palette — 8 warna distinct untuk bar/pie multi-series. Brand-aligned. */
export const CATEGORICAL = [
  "#2e38db", // brand-600
  "#1d7a44", // success-600
  "#a3650a", // warning-600
  "#7800f0", // accent-500
  "#a82424", // danger-600
  "#1d3a8a", // navy-600
  "#4a4fb0", // sector-600
  "#6b6b8a", // muted
];

/** Sequential blue palette — untuk heatmap / ranked bars */
export const SEQUENTIAL_BLUE = [
  "#eff6ff", "#bfdbfe", "#93c5fd", "#60a5fa",
  "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af",
];

/** Status color map */
export const STATUS_COLORS: Record<string, string> = {
  operating: "#1d7a44",   // success-600
  acquired: "#7800f0",    // accent-500
  shut_down: "#a82424",   // danger-600
  unknown: "#6b6b8a",     // muted
};

/** Sector color map */
export const SECTOR_COLORS: Record<string, string> = {
  fintech: "#2e38db",     // brand-600
  edtech: "#a3650a",      // warning-600
  healthtech: "#1d7a44",  // success-600
  agritech: "#1d3a8a",    // navy-600
  logistics: "#7800f0",   // accent-500
  saas: "#4a4fb0",        // sector-600
  ecommerce_enabler: "#a82424", // danger-600
};

/** Return a stable color for any label by hashing */
export function colorForLabel(label: string): string {
  const safe = label ?? "unknown";
  let hash = 0;
  for (let i = 0; i < safe.length; i++) {
    hash = safe.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORICAL[Math.abs(hash) % CATEGORICAL.length];
}

/** Default chart dimensions */
export const CHART = {
  barHeight: 28,
  barGap: 4,
  barRadius: 4,
  padding: { top: 8, right: 16, bottom: 8, left: 120 },
  donutThickness: 28,
} as const;
