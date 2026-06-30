import { searchCompanies, getTrendingCompanies, getFeaturedCompanies } from "@/services/companies";
import { getAcquisitions, getStats } from "@/services/index";
import { getInvestors } from "@/services/investors";
import { getRecentFunding } from "@/services/funding";
import Link from "next/link";
import CompanyCard from "@/components/company/CompanyCard";
import SectionHeader from "@/components/ui/SectionHeader";
import Input from "@/components/ui/Input";
import Button, { buttonClassName } from "@/components/ui/Button";
import HeroSection from "@/components/layout/HeroSection";
import StatPanel from "@/components/layout/StatPanel";
import FeatureHighlights from "@/components/layout/FeatureHighlights";
import { formatCurrencyAbbrev, formatFullAmount, formatRoundType, isNotStated } from "@/lib/formatters/format";

function fmtDate(raw: any): string {
  if (!raw || isNotStated(String(raw))) return "—";
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch { }
  return "—";
}

export default async function HomePage() {
  const [companiesResult, statsResult, fundingResult, trendingResult, featuredResult, acquisitionsResult, investorsResult] = await Promise.all([
    searchCompanies({ limit: "6" }),
    getStats(),
    getRecentFunding(20),
    getTrendingCompanies(),
    getFeaturedCompanies(),
    getAcquisitions(6),
    getInvestors(5),
  ]);
  const companies = companiesResult.success ? companiesResult.data.data : [];
  const stats = statsResult.success ? statsResult.data : null;
  const funding = (fundingResult.success ? fundingResult.data : []).filter((f: any) => f.amount_usd > 0).slice(0, 5);
  const trending = trendingResult.success ? trendingResult.data : [];
  const featured = featuredResult.success ? featuredResult.data : [];
  const acquisitions = acquisitionsResult.success ? acquisitionsResult.data : [];
  const topInvestors = investorsResult.success ? investorsResult.data : [];

  const statItems = [
    { label: "Companies", value: stats?.companies, accent: "brand" as const },
    { label: "Funding rounds", value: stats?.funding_rounds, accent: "accent" as const },
    { label: "Investors", value: stats?.investors, accent: "brand" as const },
    { label: "People", value: stats?.people, accent: "accent" as const },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 md:grid-cols-[1.55fr_0.9fr]">
        <HeroSection
          eyebrow="Asia Startup Data"
          title="Discover Asian startups and investors"
          description="Verifiable startup data — every fact linked to its source."
        >
          <form action="/companies" method="GET" className="flex max-w-md flex-col gap-2 sm:flex-row">
            <label htmlFor="home-company-search" className="sr-only">Search companies</label>
            <Input id="home-company-search" name="q" type="search" placeholder="Search company name..." className="bg-white shadow-sm" />
            <Button type="submit" className="w-full shrink-0 sm:w-auto">Search</Button>
          </form>
        </HeroSection>
        <StatPanel items={statItems} lastUpdatedAt={stats?.last_updated_at} />
      </section>

      <FeatureHighlights />

      {featured.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="Sponsored placement"
            title="Featured"
            description="Paid placement — clearly labeled, never affects search ranking or verification status."
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((c: any) => <CompanyCard key={c.id} company={c} />)}
          </div>
        </section>
      )}

      <section>
        <SectionHeader
          eyebrow="Last 90 days"
          title="Currently trending"
          description="Ranked by news volume and recent funding rounds."
        />
        {trending.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {trending.slice(0, 6).map((c: any) => <CompanyCard key={c.id} company={c} />)}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {companies.slice(0, 6).map((c: any) => <CompanyCard key={c.id} company={c} />)}
          </div>
        )}
      </section>

      {/* Fresh Data — recently updated companies */}
      {companies.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="Fresh data"
            title="Recently updated"
            description="Companies with the most recent profile updates."
            action={<Link href="/companies" className="text-sm text-brand-600 hover:underline">Browse all →</Link>}
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {companies.slice(0, 3).map((c: any) => <CompanyCard key={c.id} company={c} />)}
          </div>
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col">
          <SectionHeader
            eyebrow="Ecosystem"
            title="Investor spotlight"
            description="Top investors by portfolio count."
            action={<Link href="/investors" className="text-sm text-brand-600 hover:underline">Browse all →</Link>}
          />
          <div className="card flex-1 space-y-0 divide-y divide-gray-50 p-0">
            {topInvestors.map((inv: any, i: number) => (
              <Link key={inv.id} href={`/investors/${inv.slug || inv.id}`} className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-brand-50/30">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-500" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-400"}`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{inv.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <span>{inv.type || "Investor"}</span>
                    <span className="text-gray-300">·</span>
                    <span className="font-medium text-gray-600">{inv.portfolio_count || 0} companies</span>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-300 group-hover:text-brand-400 transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <SectionHeader
            eyebrow="Latest funding"
            title="Recent funding rounds"
            description="The latest recorded rounds, complete with investors and source links."
            action={<Link href="/funding" className="text-sm text-brand-600 hover:underline">Browse all →</Link>}
          />
          <div className="card flex-1 space-y-0 divide-y divide-gray-50 p-0">
            {funding.length > 0 ? (
              funding.map((f: any) => (
                <a key={f.id} href={`/companies/${f.company_slug}`} className="group flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-brand-50/30">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{f.company_name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      {f.round_type && f.round_type !== "undisclosed" && (
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">{formatRoundType(f.round_type)}</span>
                      )}
                      <span>{fmtDate(f.announced_date) !== "—" ? fmtDate(f.announced_date) : ""}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-success-600" title={formatFullAmount(f.amount_usd)}>
                    {formatCurrencyAbbrev(f.amount_usd)}
                  </span>
                </a>
              ))
            ) : (
              <p className="px-5 py-8 text-center text-muted">No funding data yet.</p>
            )}
          </div>
        </div>
      </section>

      {acquisitions.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="Corporate activity"
            title="Recent acquisitions"
            description="The latest acquisitions recorded in the directory."
            action={
              <Link
                href="/acquisitions"
                aria-label="View all acquisitions"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-600 transition hover:bg-brand-50"
              >
                →
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {acquisitions.map((a: any, i: number) => {
              const gradients = [
                "from-brand-500 to-brand-700",
                "from-accent-500 to-accent-700",
                "from-violet-500 to-purple-700",
                "from-sky-500 to-blue-700",
                "from-emerald-500 to-green-700",
                "from-amber-500 to-orange-700",
              ];
              const gradient = gradients[i % gradients.length];
              const amount = a.amount_usd ? formatCurrencyAbbrev(a.amount_usd) : null;

              return (
                <Link
                  key={a.id}
                  href={`/companies/${a.acquiree_slug}`}
                  className="group card flex flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Header bar */}
                  <div className={`flex items-center gap-2 bg-gradient-to-r ${gradient} px-3 sm:px-4 py-2.5`}>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/80">M&A</span>
                    <span className="text-[10px] sm:text-[11px] text-white/70">
                      {!isNotStated(a.announced_date) ? fmtDate(a.announced_date)
                        : !isNotStated(a.source_published_at) ? fmtDate(a.source_published_at)
                          : ""}
                    </span>
                    {amount && (
                      <span className="ml-auto shrink-0 text-sm font-extrabold text-white">{amount}</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
                    <p className="text-[13px] sm:text-sm font-semibold leading-snug text-gray-900 line-clamp-2 break-words">
                      <span className="text-brand-600">{a.acquirer_name || "Unknown"}</span>
                      <span className="mx-1.5 text-gray-300">→</span>
                      <span>{a.acquiree_name || "Unknown"}</span>
                    </p>
                    {amount && (
                      <p className="text-[11px] sm:text-xs text-success-600 font-medium" title={formatFullAmount(a.amount_usd)}>
                        {formatFullAmount(a.amount_usd)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="card flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-heading-card font-bold">Try Swarm Predictions</p>
          <p className="mt-1 text-sm text-muted">AI-powered multi-agent simulations. Predict funding outcomes, analyze market sentiment, and explore what-if scenarios.</p>
        </div>
        <Link href="/swarm" className={buttonClassName({ className: "shrink-0" })}>Open Swarm →</Link>
      </section>

      <section className="card flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-heading-card font-bold">Know something we're missing?</p>
          <p className="mt-1 text-sm text-muted">Help complete the directory — submit a new company, funding round, or correction.</p>
        </div>
        <Link href="/submit" className={buttonClassName({ className: "shrink-0" })}>Submit data →</Link>
      </section>
    </div>
  );
}
