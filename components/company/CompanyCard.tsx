"use client";

import Link from "next/link";
import Badge, { statusBadgeVariant } from "@/components/ui/Badge";
import { formatStatus, formatRoundType, formatCurrencyAbbrev, formatFullAmount, formatRelativeTime } from "@/lib/formatters/format";

export interface CompanyCardData {
  id: string;
  slug: string;
  name: string;
  website?: string | null;
  sector?: string | null;
  location?: string | null;
  founded_year?: string | null;
  description?: string | null;
  status?: string | null;
  total_funding_usd?: number | null;
  last_round_type?: string | null;
  funding_rounds_count?: number | null;
  last_updated_at?: number | null;
  last_verified_at?: number | null;
  featured_until?: number | null;
  lead_investor_name?: string | null;
  investor_count?: number | null;
}

function cardStatusClass(status?: string | null) {
  if (status === "shut_down") return "bg-danger-50/70";
  if (status === "operating") return "bg-success-50/70";
  return "bg-white/80";
}

function extractDomain(url?: string | null): string {
  if (!url) return "";
  try {
    return new URL(url.replace(/^(?!https?:\/\/)/, "https://")).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export function CompanyAvatar({ name, website, size = "md" }: { name?: string | null; website?: string | null; size?: "sm" | "md" | "lg" }) {
  const domain = extractDomain(website);
  const initial = (name || "?")[0];
  const dims = size === "lg" ? "h-14 w-14 text-2xl rounded-2xl" : size === "sm" ? "h-8 w-8 text-xs rounded-lg" : "h-10 w-10 text-sm rounded-full";
  const imgDims = size === "lg" ? 56 : size === "sm" ? 32 : 40;

  if (!domain) {
    return (
      <span className={`flex shrink-0 items-center justify-center bg-brand-100 font-bold text-brand-700 ${dims}`}>
        {initial}
      </span>
    );
  }

  return (
    <span className="relative shrink-0" style={{ width: imgDims, height: imgDims }}>
      <img
        src={faviconUrl(domain)}
        alt=""
        className="rounded-full object-contain bg-white border border-gray-100"
        style={{ width: imgDims, height: imgDims }}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
        }}
      />
      <span className={`hidden absolute inset-0 flex items-center justify-center bg-brand-100 font-bold text-brand-700 ${dims}`}>
        {initial}
      </span>
    </span>
  );
}

function CompanyAvatarCompact({ name, website }: { name?: string | null; website?: string | null }) {
  const domain = extractDomain(website);
  const initial = (name || "?")[0];

  if (!domain) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
        {initial}
      </span>
    );
  }

  return (
    <span className="relative h-9 w-9 shrink-0">
      <img
        src={faviconUrl(domain)}
        alt=""
        className="h-9 w-9 rounded-full object-contain bg-white border border-gray-100"
        width={36}
        height={36}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
        }}
      />
      <span className="hidden absolute inset-0 flex items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
        {initial}
      </span>
    </span>
  );
}

export default function CompanyCard({ company, compact = false }: { company: CompanyCardData; compact?: boolean }) {
  if (compact) {
    return (
      <Link href={`/companies/${company.slug}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
        <CompanyAvatarCompact name={company.name} website={company.website} />
        <div className="min-w-0">
          <div className="truncate font-semibold">{company.name}</div>
          <div className="truncate text-xs text-muted">{company.sector || "—"} · {company.location || "—"}</div>
        </div>
      </Link>
    );
  }

  const hasFunding = Boolean(company.total_funding_usd && company.total_funding_usd > 0);
  const hasRoundsOnly = !hasFunding && Boolean(company.funding_rounds_count && company.funding_rounds_count > 0);
  const isFeatured = Boolean(company.featured_until && company.featured_until * 1000 > Date.now());
  const hasBadges = isFeatured || Boolean(company.sector) || Boolean(company.location) || Boolean(company.founded_year) || Boolean(company.status && company.status !== "unknown") || hasFunding || hasRoundsOnly;
  const updatedAgo = formatRelativeTime(company.last_updated_at);

  return (
    <Link
      href={`/companies/${company.slug}`}
      className={`group flex min-h-[150px] items-start gap-3 rounded-2xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-7 ${cardStatusClass(company.status)}`}
    >
      <CompanyAvatar name={company.name} website={company.website} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate font-semibold group-hover:text-brand-600">{company.name}</span>
            {company.last_verified_at && (
              <span className="shrink-0 text-success-600" title="Verified by an operator">✓</span>
            )}
          </div>
          {hasFunding && (
            <span
              className="shrink-0 font-display text-sm font-extrabold text-success-600"
              title={formatFullAmount(company.total_funding_usd)}
            >
              {formatCurrencyAbbrev(company.total_funding_usd)}
            </span>
          )}
        </div>
        {company.description && <p className="mt-1 line-clamp-3 text-xs text-muted">{company.description}</p>}
        {hasBadges && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {isFeatured && <Badge variant="warning" title="Sponsored placement">★ Featured</Badge>}
            {company.sector && <Badge variant="sector">{company.sector}</Badge>}
            {company.location && <Badge variant="neutral">{company.location}</Badge>}
            {company.founded_year && <Badge variant="neutral">Founded {company.founded_year}</Badge>}
            {company.status && company.status !== "unknown" && (
              <Badge variant={statusBadgeVariant(company.status)}>{formatStatus(company.status)}</Badge>
            )}
            {hasFunding && company.last_round_type && (
              <Badge variant="brand">{formatRoundType(company.last_round_type)}</Badge>
            )}
            {hasRoundsOnly && (
              <Badge variant="neutral">{company.funding_rounds_count} funding round</Badge>
            )}
          </div>
        )}
        {hasFunding && company.lead_investor_name && (
          <p className="mt-1.5 text-xs text-muted">
            Investor: <span className="font-semibold text-gray-700">{company.lead_investor_name}</span>
            {Boolean(company.investor_count && company.investor_count > 1) && ` +${(company.investor_count as number) - 1} more`}
          </p>
        )}
        {updatedAgo && <p className="mt-2 text-xs text-muted">Updated {updatedAgo}</p>}
      </div>
    </Link>
  );
}
