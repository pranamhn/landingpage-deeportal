import { getCompany, getSimilarCompanies, searchCompanies } from "@/lib/api/companiesService";
import WatchlistButton from "@/components/WatchlistButton";
import ClaimProfileCallout from "@/components/company/ClaimProfileCallout";
import EmbedBadgeCallout from "@/components/company/EmbedBadgeCallout";
import CompanyCard from "@/components/company/CompanyCard";
import CompanyFacts from "@/components/company/CompanyFacts";
import FundingTimeline from "@/components/company/FundingTimeline";
import SourceList from "@/components/company/SourceList";
import LatestProjects from "@/components/company/LatestProjects";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge, { statusBadgeVariant } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { formatStatus, formatDate, formatFullAmount, formatRole, isNotStated } from "@/lib/formatters/format";
import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const result = await searchCompanies({ limit: "500" });
  if (!result.success) return [];
  return result.data.data.map((c) => ({ slug: c.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCompany(slug);
  if (!result.success || !result.data) return { title: "Company not found" };
  const c = result.data;
  return {
    title: `${c.name} — Startup Profile | Deeportal`,
    description: c.description || `${c.name} profile: ${c.sector || ""} startup in ${c.location || "Asia"}.`,
    openGraph: {
      title: `${c.name} — Deeportal Companies`,
      description: c.description || "",
      type: "article",
    },
  };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const [result, similarResult] = await Promise.all([getCompany(slug), getSimilarCompanies(slug)]);

  if (!result.success || !result.data) {
    return (
      <Card className="py-16 text-center">
        <h1 className="font-display text-heading-card font-bold">Company not found</h1>
        <p className="mt-2 text-muted">The data you're looking for isn't available yet, or has moved.</p>
        <Link href="/companies" className="mt-4 inline-block text-brand-600 hover:underline">← Back to list</Link>
      </Card>
    );
  }

  const c = result.data;
  const similarCompanies = similarResult.success ? similarResult.data : [];
  const metaText = [c.sector, c.location, c.founded_year ? `founded ${c.founded_year}` : null].filter(Boolean).join(" · ");
  const lastVerified = formatDate(c.last_verified_at);
  const lastUpdated = formatDate(c.last_updated_at);
  const hasAcquisitions = c.acquisitions?.length > 0;
  const hasStatusHistory = c.status_history?.length > 0;
  const hasPeople = c.people?.length > 0;
  const hasProjects = c.projects?.length > 0;

  return (
    <div>
      <div className="space-y-6">
        <section className="card">
          <div className="flex gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700"></span>
            <div>
              <p className="eyebrow">Company Profile</p>
              <h1 className="font-display text-display-page font-bold">{c.name}</h1>
              {metaText && <p className="mt-1 text-sm text-muted">{metaText}</p>}
              {c.description && <p className="mt-3 text-gray-700">{c.description}</p>}
              {(c.website || c.contact_email) && (
                <p className="mt-2 flex flex-wrap gap-3 text-sm">
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                      {c.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  {c.contact_email && (
                    <a href={`mailto:${c.contact_email}`} className="text-brand-600 hover:underline">
                      {c.contact_email}
                    </a>
                  )}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {c.status && <Badge variant={statusBadgeVariant(c.status)}>{formatStatus(c.status)}</Badge>}
                {lastVerified ? (
                  <Badge variant="success" title="Confirmed accurate by an operator after a claim or correction was reviewed">
                    ✓ Verified {lastVerified}
                  </Badge>
                ) : (
                  lastUpdated && <Badge variant="neutral">Updated {lastUpdated}</Badge>
                )}
                <WatchlistButton companyId={c.id} />
              </div>
            </div>
          </div>
        </section>

        <CompanyFacts company={c} />

        <div className="grid gap-4 md:grid-cols-2">
          <section className="card">
            <SectionHeader eyebrow="Capital timeline" title="Funding Rounds" />
            <FundingTimeline rounds={c.funding_rounds} companySlug={c.slug} />
          </section>

          <section className="card">
            <SectionHeader eyebrow="Market signals" title="News & Events" />
            <SourceList events={c.news_events} companySlug={c.slug} companyName={c.name} />
          </section>
        </div>

        {hasProjects && (
          <section className="card">
            <SectionHeader eyebrow="Product activity" title="Latest Projects" />
            <LatestProjects projects={c.projects} />
          </section>
        )}

        {(hasAcquisitions || hasStatusHistory) && (
          <div className="grid gap-4 md:grid-cols-2">
            {hasAcquisitions && (
              <section className="card">
                <SectionHeader eyebrow="Corporate action" title="Acquisitions" />
                <div className="space-y-3">
                  {c.acquisitions.map((a) => (
                    <div key={a.id} className="border-l-3 border-brand-200 rounded-r-lg bg-white/70 p-3 pl-4">
                      <div className="flex items-baseline justify-between">
                        <strong>{a.acquirer_name}</strong>
                        <span className="font-display font-extrabold text-success-600" title={formatFullAmount(a.amount_usd)}>
                          {formatFullAmount(a.amount_usd)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        {a.announced_date && <span>{a.announced_date}</span>}
                        {a.source_url && (
                          <a href={a.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">Source ↗</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {hasStatusHistory && (
              <section className="card">
                <SectionHeader eyebrow="History" title="Status History" />
                <div className="space-y-3">
                  {c.status_history.map((s, idx) => (
                    <div key={`${s.status}-${idx}`} className="border-l-3 border-gray-200 rounded-r-lg bg-white/70 p-3 pl-4">
                      <div className="flex items-baseline justify-between">
                        <strong>{formatStatus(s.status)}</strong>
                        {s.effective_date && <span className="text-xs text-muted">{s.effective_date}</span>}
                      </div>
                      {s.source_url && !isNotStated(s.source_url) && (
                        <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-xs hover:text-brand-600">Source ↗</a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {(hasPeople || similarCompanies.length > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            {hasPeople && (
              <section className="card">
                <SectionHeader eyebrow="Team" title="Key People" />
                <div className="space-y-1">
                  {c.people.map((p) => (
                    <Link key={p.id} href={`/founders/${p.slug}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {(p.name || "?")[0]}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{p.name}</div>
                        <div className="truncate text-xs text-muted">{formatRole(p.role)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {similarCompanies.length > 0 && (
              <section className="card">
                <SectionHeader eyebrow="Recommended" title="Similar Companies" />
                <div className="space-y-1">
                  {similarCompanies.map((sc) => (
                    <CompanyCard key={sc.id} company={sc} compact />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <EmbedBadgeCallout companySlug={c.slug} />
        <ClaimProfileCallout companyName={c.name} companySlug={c.slug} />
      </div>
    </div>
  );
}
