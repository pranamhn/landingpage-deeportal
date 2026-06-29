import Link from "next/link";
import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Data Sources — DeePortal.ai",
  description: "The actual feeds, indexes, and channels DeePortal pulls startup data from.",
};

const REGIONAL_FEEDS = [
  { name: "DailySocial", domain: "dailysocial.id" },
  { name: "TechInAsia", domain: "techinasia.com" },
  { name: "e27", domain: "e27.co" },
  { name: "DealStreetAsia", domain: "dealstreetasia.com" },
];

const COUNTRY_FEEDS: { country: string; code: string; feeds: string[] }[] = [
  { country: "Indonesia", code: "ID", feeds: ["tekno.kompas.com", "bisniskeuangan.kompas.com", "finance.detik.com", "rss.tempo.co", "cnnindonesia.com", "antaranews.com", "bisnis.com", "kumparan.com"] },
  { country: "India", code: "IN", feeds: ["inc42.com", "moneycontrol.com", "livemint.com"] },
  { country: "Singapore", code: "SG", feeds: ["straitstimes.com", "businesstimes.com.sg"] },
  { country: "Vietnam", code: "VN", feeds: ["e.vnexpress.net", "vietnamnews.vn", "tuoitre.vn"] },
  { country: "Malaysia", code: "MY", feeds: ["digitalnewsasia.com", "freemalaysiatoday.com", "malaymail.com"] },
  { country: "Philippines", code: "PH", feeds: ["philstar.com", "rappler.com", "manilatimes.net"] },
  { country: "Thailand", code: "TH", feeds: ["bangkokpost.com"] },
  { country: "Hong Kong", code: "HK", feeds: ["scmp.com"] },
  { country: "Japan", code: "JP", feeds: ["japantimes.co.jp"] },
  { country: "South Korea", code: "KR", feeds: ["koreaherald.com"] },
  { country: "Pakistan", code: "PK", feeds: ["tribune.com.pk"] },
  { country: "Bangladesh", code: "BD", feeds: ["tbsnews.net"] },
];

export default function SourcesPage() {
  return (
    <div className="space-y-10">
      <section>
        <p className="mb-2 eyebrow">Data sources</p>
        <h1 className="mb-3 font-display text-display-page font-bold">Where DeePortal's data actually comes from</h1>
        <p className="max-w-prose text-sm leading-relaxed text-gray-600">
          No aggregated summary, no black box — this is the real, current list of feeds and
          indexes DeePortal checks. See{" "}
          <Link href="/content/methodology" className="text-brand-600 hover:underline">methodology</Link>{" "}
          for how an article from one of these turns into a published record.
        </p>
      </section>

      <section>
        <SectionHeader eyebrow="Primary sources" title="Regional startup-news feeds" description="Dedicated startup/tech outlets covering Southeast Asia — almost every article from these is relevant." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REGIONAL_FEEDS.map((f) => (
            <div key={f.domain} className="card">
              <h3 className="font-display text-base font-bold text-gray-900">{f.name}</h3>
              <p className="mt-1 text-sm text-muted">{f.domain}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Broader coverage" title="Country news feeds" description="General business/tech feeds, fetched and tagged by country, used to catch coverage the regional outlets miss." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COUNTRY_FEEDS.map((c) => (
            <div key={c.code} className="card">
              <h3 className="font-display text-base font-bold text-gray-900">{c.country}</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {c.feeds.map((domain) => <li key={domain}>{domain}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Honest scope" title="This doesn't cover all of Asia yet" />
        <div className="card prose max-w-none text-sm leading-relaxed text-gray-700">
          <p>
            Twelve countries above have a dedicated feed checking them regularly: Indonesia,
            India, Singapore, Vietnam, Malaysia, the Philippines, Thailand, Hong Kong, Japan,
            South Korea, Pakistan, and Bangladesh. The rest of Asia isn&apos;t there yet —
            Cambodia, Laos, Myanmar, most of Central Asia, and most of the Middle East currently
            have no presence in this directory at all.
          </p>
          <p className="mt-3">
            Mainland China, Taiwan, and Sri Lanka occasionally show up because GDELT or web search
            happened to surface a company from there, but have no dedicated feed yet — every
            candidate source we tried for those three (TechNode, Caixin Global, Taipei Times,
            Taiwan News, Daily FT, EconomyNext, Daily Mirror) turned out to be blocked, disabled,
            or in a feed format our parser can&apos;t read. That&apos;s incidental coverage, not
            systematic — thinner and less consistent than the twelve above.
          </p>
          <p className="mt-3">
            New country feeds get added as they&apos;re found and verified by hand — checked both
            for a valid HTTP response and that our actual parser can read real articles out of it,
            never added on a guess.
          </p>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Wider net" title="Global indexes & search" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <h3 className="font-display text-base font-bold text-gray-900">GDELT</h3>
            <p className="mt-1 text-sm text-muted">
              A free, open global news index (gdeltproject.org) that goes back to 2017 — used for
              ongoing monitoring and for filling in funding history that predates our regular feeds.
            </p>
          </div>
          <div className="card">
            <h3 className="font-display text-base font-bold text-gray-900">Web search</h3>
            <p className="mt-1 text-sm text-muted">
              A fallback for company events that the curated feeds and GDELT don't surface.
            </p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="From you"
          title="Community submissions"
          action={<Link href="/submit" className="text-sm text-brand-600 hover:underline">Submit data →</Link>}
        />
        <div className="card prose max-w-none text-sm leading-relaxed text-gray-700">
          <p>
            Anyone can submit a correction or a missing data point. Submissions are reviewed by an
            operator before publishing — never published automatically — the same standard applied
            to everything extracted from the feeds above.
          </p>
        </div>
      </section>
    </div>
  );
}
