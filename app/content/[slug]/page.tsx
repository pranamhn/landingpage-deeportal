import type { Metadata } from "next";

// "about", "methodology", dan "sources" sengaja TIDAK ada di sini lagi —
// masing-masing sekarang punya page.tsx asli sendiri (app/about/page.tsx,
// app/content/methodology/page.tsx, app/content/sources/page.tsx) yang
// menang atas route dinamis ini karena segmen statis Next.js diprioritaskan
// di atas [slug].
const pages: Record<string, { title: string; heading: string; body: string }> = {
  terms: {
    title: "Terms of Service",
    heading: "Terms of Service",
    body: "By using DeePortal.ai, you agree to these terms. If you don't agree, please don't use the service.\n\nDeePortal is a directory of startup, investor, and funding data aggregated from public news sources and community submissions, with every fact linked back to its source where possible.\n\nData on this site is provided on a best-effort basis. We verify what we can and link to the original source for every fact we publish, but we don't guarantee completeness or accuracy — always check the linked source before relying on any figure for a decision.\n\nCreating an account lets you use the watchlist, saved searches, data submission, and API features. You're responsible for keeping your login credentials and API keys confidential, and for activity that happens under your account.\n\nAPI access is subject to the rate limits and quotas of your plan — see /pricing for details. Automated scraping of the site outside the documented API is not permitted.\n\nIf you submit a correction or new data point, you confirm it's accurate to the best of your knowledge. Submissions are reviewed by an operator before publishing — we may edit, reject, or remove any submission.\n\nThe service is provided \"as is,\" without warranty of any kind. We are not liable for decisions made based on data found on this site.\n\nWe may update these terms as the service evolves; continued use after a change means you accept the updated terms.",
  },
  privacy: {
    title: "Privacy",
    heading: "Privacy",
    body: "Deeportal only collects company and individual data that is already publicly available. We do not collect personal data outside a professional context. User accounts are used for watchlist, saved searches, and data contribution features. Account data is not shared with third parties.",
  },
  governance: {
    title: "Data Governance",
    heading: "Data Governance",
    body: "All data entering the directory goes through a moderation process. Operators review submissions before they're published. Users can flag inaccurate data through the profile claim or correction features. We're committed to maintaining data accuracy and transparency.",
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];
  return { title: `${page?.title || slug} — Deeportal`, description: page?.body?.slice(0, 160) || "" };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const page = pages[slug];

  if (!page) {
    return <div className="card py-16 text-center"><h1 className="font-display text-heading-card font-bold">Page not found</h1></div>;
  }

  return (
    <div>
      <section className="mb-8">
        <h1 className="font-display text-display-page font-bold">{page.heading}</h1>
      </section>
      <div className="card prose max-w-none">
        {page.body.split("\n\n").map((p, i) => (
          <p key={i} className="mb-4 last:mb-0">{p}</p>
        ))}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}
