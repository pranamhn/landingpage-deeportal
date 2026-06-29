const NOT_STATED = new Set(["tidak disebutkan", "tidak ada", "-", ""]);

export function isNotStated(value: string | null | undefined): boolean {
  if (!value) return true;
  return NOT_STATED.has(value.trim().toLowerCase());
}

function titleCaseFromSnake(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}

export function formatRoundType(roundType: string | null | undefined): string {
  if (!roundType) return "Undisclosed";
  return titleCaseFromSnake(roundType);
}

export function formatStatus(status: string | null | undefined): string {
  if (!status) return "—";
  return titleCaseFromSnake(status);
}

export function formatRole(role: string | null | undefined): string {
  if (!role) return "—";
  return titleCaseFromSnake(role);
}

export function formatCurrencyAbbrev(amountUsd: number | null | undefined): string {
  if (!amountUsd) return "—";
  const abs = Math.abs(amountUsd);
  if (abs >= 1_000_000_000) return `$${trimDecimal(amountUsd / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `$${trimDecimal(amountUsd / 1_000_000)}M`;
  if (abs >= 1_000) return `$${trimDecimal(amountUsd / 1_000)}K`;
  return `$${amountUsd.toLocaleString()}`;
}

function trimDecimal(value: number): string {
  return (Math.round(value * 10) / 10).toString();
}

export function formatFullAmount(amountUsd: number | null | undefined): string {
  if (!amountUsd) return "—";
  return `$${amountUsd.toLocaleString()}`;
}

export function formatDate(epochSeconds: number | null | undefined): string | null {
  if (!epochSeconds) return null;
  return new Date(epochSeconds * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function formatRelativeTime(epochSeconds: number | null | undefined): string | null {
  if (!epochSeconds) return null;
  const diffSeconds = Date.now() / 1000 - epochSeconds;
  if (diffSeconds < 60) return "just now";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}
