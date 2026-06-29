import Link from "next/link";
import Badge, { statusBadgeVariant } from "@/components/ui/Badge";
import { formatStatus, formatRoundType, formatCurrencyAbbrev, formatFullAmount, formatRelativeTime } from "@/lib/formatters/format";

export interface CompanyCardData {
  id: string;
  slug: string;
  name: string;
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

export default function CompanyCard({ company, compact = false }: { company: CompanyCardData; compact?: boolean }) {
  if (compact) {
    return (
      <Link href={`/companies/${company.slug}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {(company.name || "?")[0]}
        </span>
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
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
        {(company.name || "?")[0]}
      </span>
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
