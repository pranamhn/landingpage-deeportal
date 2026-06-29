import Link from "next/link";
import type { Metadata } from "next";
import { getStats } from "@/lib/api/statsService";
import HeroSection from "@/components/layout/HeroSection";
import StatPanel from "@/components/layout/StatPanel";
import FeatureHighlights from "@/components/layout/FeatureHighlights";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About — DeePortal.ai",
  description: "DeePortal.ai is a source-backed directory of Asian startups, investors, and funding — every fact linked to where it came from.",
};

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Discover",
    body: "News RSS feeds, web search, and GDELT continuously surface new funding, acquisition, and launch coverage across Asia.",
  },
  {
    step: "02",
    title: "Extract",
    body: "Each article is parsed for structured facts — company, round, amount, investors, date — with the source URL carried through every step.",
  },
  {
    step: "03",
    title: "Verify",
    body: "Extractions are cross-checked against existing records and reviewed before publishing. No source link, no fact — gagal aman by design.",
  },
];

const EXPLORE_LINKS = [
  { href: "/companies", label: "Companies", body: "Browse startup profiles with funding history and sources." },
  { href: "/investors", label: "Investors", body: "VC and investor profiles with portfolio and check-size data." },
  { href: "/funding", label: "Funding rounds", body: "Every recorded round, filterable by stage, sector, and country." },
  { href: "/acquisitions", label: "Acquisitions", body: "M&A activity across the region." },
  { href: "/founders", label: "Founders & people", body: "The people behind the companies." },
  { href: "/lists", label: "Lists", body: "Curated company lists for research and comparison." },
];

const DATA_ADVANTAGE = [
  {
    accent: "brand" as const,
    title: "Multi-source",
    body: "Pulled from hundreds of regional news outlets, RSS feeds, and public filings — not a single feed, not one market.",
  },
  {
    accent: "accent" as const,
    title: "Operator-reviewed",
    body: "Every extraction is cross-checked against existing records and reviewed by a person before it's published.",
  },
  {
    accent: "brand" as const,
    title: "Source-linked",
    body: "Every published fact carries a link back to the article it came from. No source, no fact.",
  },
];

export default async function AboutPage() {
  const statsResult = await getStats();
  const stats = statsResult.success ? statsResult.data : null;

  const statItems = [
    { label: "Companies", value: stats?.companies, accent: "brand" as const },
    { label: "Funding rounds", value: stats?.funding_rounds, accent: "accent" as const },
    { label: "Investors", value: stats?.investors, accent: "brand" as const },
    { label: "People", value: stats?.people, accent: "accent" as const },
  ];

  return (
    <div className="space-y-12">
      <section className="grid gap-6 md:grid-cols-[1.55fr_0.9fr]">
        <HeroSection
          eyebrow="About DeePortal.ai"
          title="A source-backed directory for Asia's startup ecosystem"
          description="Asia's startup news is scattered across hundreds of local outlets and updated unevenly. DeePortal pulls it into one place — continuously, and with every fact traceable back to where it came from."
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/companies"><Button>Browse companies</Button></Link>
            <Link href="/content/methodology"><Button variant="secondary">How the data is verified</Button></Link>
          </div>
        </HeroSection>
        <StatPanel items={statItems} lastUpdatedAt={stats?.last_updated_at} />
      </section>

      <FeatureHighlights />

      <section className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeader eyebrow="Always current" title="Stay ahead of the news, not behind it" />
          <p className="text-sm leading-relaxed text-gray-700">
            Startup funding news in Asia breaks across dozens of local outlets, often in
            different languages, at different times. DeePortal pulls all of it into one feed
            through continuous ingestion, not a periodic manual research cycle.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            Save companies and investors to a watchlist to track them over time, or subscribe
            to the weekly funding digest for a summary of new rounds and acquisitions straight
            to your inbox.
          </p>
          <Link href="/register" className="mt-5 inline-block"><Button>Create free account</Button></Link>
        </div>
        <div className="relative min-h-[200px] overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-brand-50 via-white to-accent-50">
          <div className="hero-glow" aria-hidden="true" />
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Why DeePortal" title="No fact without a source" />
        <div className="card prose max-w-none text-sm leading-relaxed text-gray-700">
          <p>
            Most startup data in Asia lives in spreadsheets, scattered press coverage, or
            behind paywalls built for other markets. DeePortal exists to make that data
            findable in one place — funding rounds, acquisitions, investors, and the people
            behind the companies — without asking you to trust a number that nobody can trace.
          </p>
          <p className="mt-3">
            Every company profile, funding round, and event on this site links back to the
            article or page it was extracted from. If we can&apos;t find a source for a fact,
            we leave it blank rather than guess.
          </p>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="The data advantage" title="What makes DeePortal data trustworthy" />
        <div className="grid gap-4 md:grid-cols-3">
          {DATA_ADVANTAGE.map((item) => (
            <div
              key={item.title}
              className={`card border-t-2 ${item.accent === "brand" ? "border-t-brand-500" : "border-t-accent-500"}`}
            >
              <h3 className="font-display text-heading-card font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="How it works"
          title="From news article to verified record"
          action={<Link href="/content/sources" className="text-sm text-brand-600 hover:underline">View data sources →</Link>}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {PIPELINE_STEPS.map((s) => (
            <div key={s.step} className="card">
              <span className="font-display text-2xl font-extrabold text-brand-200">{s.step}</span>
              <h3 className="mt-1 font-display text-heading-card font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Explore" title="What you can do here" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXPLORE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="card block transition hover:shadow-md">
              <h3 className="font-display text-base font-bold text-gray-900">{link.label}</h3>
              <p className="mt-1 text-sm text-muted">{link.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card flex flex-col items-start gap-4 bg-gradient-to-br from-brand-50 to-accent-50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-heading-section font-bold">Ready to dig in?</h2>
          <p className="mt-1 text-sm text-muted">Start browsing, or get the weekly funding digest in your inbox.</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link href="/companies"><Button>Browse companies</Button></Link>
          <Link href="/register"><Button variant="secondary">Create free account</Button></Link>
        </div>
      </section>
    </div>
  );
}
