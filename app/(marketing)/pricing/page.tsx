"use client";

import Link from "next/link";

const TIERS = [
  {
    id: "free",
    name: "Starter",
    price: "$1",
    period: "/month",
    tagline: "A small contribution to keep data fresh.",
    features: [
      { text: "Browse companies, investors, funding rounds", included: true },
      { text: "Basic search & filters", included: true },
      { text: "View company profiles & timelines", included: true },
      { text: "API access", included: false },
      { text: "Priority data corrections", included: false },
    ],
    cta: { text: "Sign up", href: "/register" },
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$20",
    period: "/month",
    tagline: "For analysts, researchers, and power users.",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "Unlimited searches & filters", included: true },
      { text: "Unlimited watchlist entries", included: true },
      { text: "Priority data correction review", included: true },
      { text: "API access", included: false },
      { text: "Priority data corrections", included: false },
      { text: "Dedicated support", included: false },
    ],
    cta: { text: "Sign up", href: "/register" },
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "For funds, platforms, and teams that need scale.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Bulk API access (custom limits)", included: true },
      { text: "Full database export", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA & uptime guarantee", included: true },
      { text: "Custom integrations", included: true },
      { text: "Early access to new data sources", included: true },
      { text: "Team access & permissions", included: true },
    ],
    cta: { text: "Sign up", href: "/register" },
    highlight: false,
  },
] as const;

const FAQ = [
  { q: "Why does Starter cost $1?", a: "It's a small contribution toward the cost of continuously sourcing and verifying data, not a feature-gated tier — you still get full browsing access to the directory." },
  { q: "What happens when Pro launches?", a: "Pro is still in development. Click Subscribe now to start the checkout flow and you'll be first in line once billing is fully live." },
  { q: "Can I switch plans anytime?", a: "Absolutely. Upgrade, downgrade, or cancel anytime. Your data and watchlist stay with your account." },
  { q: "Can I export data?", a: "Not on Starter or Pro — every fact stays linked to its source on the platform itself. Bulk/full database export is available on Enterprise, by arrangement." },
  { q: "Do you offer discounts?", a: "Yes — reach out to us. We're happy to discuss discounted pricing for early-stage startups, academic researchers, and non-profit organizations." },
];

export default function PricingPage() {
  return (
    <div>
      <section className="mb-12 text-center">
        <p className="eyebrow">Pricing</p>
        <h1 className="font-display text-display-page font-bold">Simple, transparent pricing</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted">
          Start small, upgrade when you need more. Pro is in development — subscribe now to get early access.
        </p>
      </section>

      <div className="mb-16 grid items-start gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`group relative flex flex-col rounded-2xl border p-7 transition hover:shadow-lg ${tier.highlight
              ? "border-brand-200 bg-white shadow-md shadow-brand-100/30"
              : "border-transparent bg-white shadow-sm"
              }`}
          >
            {tier.highlight && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand-50/40 to-transparent pointer-events-none" />
            )}
            {tier.highlight && (
              <span className="relative -mt-10 mb-4 inline-flex self-center rounded-full bg-brand-600 px-3.5 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
                Popular
              </span>
            )}

            <p className="relative text-xs font-extrabold uppercase tracking-[0.15em] text-muted">{tier.name}</p>

            <div className="relative mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold tracking-tight text-gray-900">{tier.price}</span>
              {tier.period && <span className="text-sm font-medium text-muted">{tier.period}</span>}
            </div>

            <p className="relative mt-2 text-sm leading-relaxed text-muted">{tier.tagline}</p>

            <ul className="relative mt-6 flex-1 space-y-3 border-t border-gray-100 pt-5">
              {tier.features.map((f) => (
                <li key={f.text} className="flex gap-3 text-sm">
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${f.included ? "bg-success-50 text-success-600" : "bg-gray-100 text-gray-300"}`}>
                    {f.included ? "✓" : "✗"}
                  </span>
                  <span className={f.included ? "text-gray-700" : "text-gray-400"}>{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="relative mt-6 border-t border-gray-100 pt-5">
              <Link
                href={tier.cta.href}
                className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${tier.highlight
                  ? "bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md"
                  : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
              >
                {tier.cta.text}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-heading-section font-bold">Frequently asked questions</h2>
          <span className="text-xs font-medium text-muted">Can&apos;t find what you need? Reach out →</span>
        </div>
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200">
                <summary className="flex cursor-pointer items-center justify-between font-display text-sm font-bold text-gray-900 marker:hidden group-open:text-brand-700">
                  {item.q}
                  <svg className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </summary>
                <p className="mt-2 pr-8 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
          <div className="card sticky top-24 h-fit space-y-4 p-6">
            <div>
              <h3 className="font-display text-base font-bold text-gray-900">Still have questions?</h3>
              <p className="mt-0.5 text-sm text-muted">We&apos;ll get back within 24 hours.</p>
            </div>
            <form className="flex flex-col gap-3">
              <input type="text" placeholder="Your name" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
              <input type="email" placeholder="you@company.com" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
              <textarea rows={2} placeholder="How can we help?" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
              <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">Send message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
