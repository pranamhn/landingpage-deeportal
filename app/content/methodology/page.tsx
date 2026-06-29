import Link from "next/link";
import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Methodology — DeePortal.ai",
  description: "How DeePortal collects, extracts, and verifies startup data before it's published.",
};

const SOURCES = [
  { title: "Regional startup news feeds", body: "Dedicated startup-news outlets covering Southeast Asia (TechInAsia, e27, DealStreetAsia, DailySocial, and similar) — almost every article from these is relevant, so they feed the pipeline directly." },
  { title: "Country news feeds", body: "General business/tech feeds for Indonesia, Singapore, Vietnam, and Malaysia, used to catch coverage the regional startup outlets miss. These are noisier, so each article is screened for a funding, M&A, or launch signal first." },
  { title: "GDELT", body: "A public, open global news index used for both ongoing monitoring and historical backfill, since it indexes news back to 2017 — useful for filling in funding history that predates our regular feeds." },
  { title: "Web search", body: "A fallback source for company events that the curated feeds and GDELT don't surface." },
  { title: "Community submissions", body: "User-submitted corrections and data, reviewed before publishing — never published automatically." },
];

const PIPELINE = [
  { step: "01", title: "Discover", body: "New articles are pulled from the feeds and search sources above. General-news articles are screened for at least one funding/M&A/launch signal before going further, so the noisier feeds don't drown out real events with unrelated news." },
  { step: "02", title: "Fetch", body: "The full article text is downloaded — extraction works from the full body, not just a headline or snippet." },
  { step: "03", title: "Extract", body: "A language model reads the article and pulls structured fields: company name, event type, round type, amount, date, and investors. Every extracted fact is tied to the article's own URL — if a fact can't be traced to that exact source, it's discarded, not guessed." },
  { step: "04", title: "Resolve", body: "The company name is matched against existing records by exact name or known alias first. A new record is only created if neither matches. This matching is deliberately literal, not fuzzy — approximate matching risks merging two different companies, e.g. a parent and its subsidiary." },
  { step: "05", title: "Store & review", body: "Verified events are written to the directory and queued for operator review before they go live." },
];

const SAFEGUARDS = [
  { title: "No source, no fact", body: "A fact without a working source URL pointing to the original article doesn't make it into the directory." },
  { title: "No guessed amounts", body: "Funding amounts that can't be parsed cleanly are marked undisclosed rather than estimated." },
  { title: "No placeholder companies", body: "Articles using fictional or placeholder company names (explainer content, examples) are filtered out before extraction." },
];

export default function MethodologyPage() {
  return (
    <div className="space-y-10">
      <section>
        <p className="mb-2 eyebrow">Methodology</p>
        <h1 className="mb-3 font-display text-display-page font-bold">How DeePortal data is collected and compiled</h1>
        <p className="max-w-prose text-sm leading-relaxed text-gray-600">
          Every company profile, funding round, and acquisition on DeePortal traces back to a
          real news article or public source. Here&apos;s the actual pipeline that gets it from
          a published article to a record on this site.
        </p>
      </section>

      <section>
        <SectionHeader
          eyebrow="Inputs"
          title="Where the data comes from"
          action={<Link href="/content/sources" className="text-sm text-brand-600 hover:underline">Full source list →</Link>}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {SOURCES.map((s) => (
            <div key={s.title} className="card">
              <h3 className="font-display text-base font-bold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Pipeline" title="From article to structured record" />
        <div className="grid gap-4 md:grid-cols-2">
          {PIPELINE.map((p) => (
            <div key={p.step} className="card">
              <span className="font-display text-2xl font-extrabold text-brand-200">{p.step}</span>
              <h3 className="mt-1 font-display text-heading-card font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Built to fail safe" title="Wrong is worse than incomplete" />
        <div className="grid gap-4 md:grid-cols-3">
          {SAFEGUARDS.map((s) => (
            <div key={s.title} className="card border-t-2 border-t-brand-500">
              <h3 className="font-display text-heading-card font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Cadence" title="Continuously updated, not a periodic refresh" />
        <div className="card prose max-w-none text-sm leading-relaxed text-gray-700">
          <p>
            Feeds and the GDELT index are checked on an ongoing basis rather than on a fixed
            weekly or monthly cycle. Every run is logged — articles seen, events extracted,
            errors encountered — so freshness is something we can audit, not just claim.
          </p>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Limitations" title="What this approach doesn't cover" />
        <div className="card prose max-w-none text-sm leading-relaxed text-gray-700">
          <p>
            Extraction currently works reliably in Indonesian and English; coverage of other
            regional languages is more limited. Web search and GDELT results add breadth but
            carry the same source-URL requirement as curated feeds, since the anti-hallucination
            filter applies equally to all sources. Cross-source deduplication is best-effort —
            two outlets covering the same round may name a company slightly differently before
            our matching logic resolves it to one record.
          </p>
        </div>
      </section>
    </div>
  );
}
