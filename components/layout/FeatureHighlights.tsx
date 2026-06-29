import Link from "next/link";

const FEATURES = [
  {
    accent: "brand" as const,
    title: "Verified sources",
    body: "Every funding round and acquisition links directly to the original source article.",
    href: "/content/sources",
    action: "View source methodology",
  },
  {
    accent: "accent" as const,
    title: "Fresh data",
    body: "Company profiles are updated through daily news ingestion, not occasional manual research.",
    href: "/companies",
    action: "Explore the latest data",
  },
  {
    accent: "brand" as const,
    title: "Compare & save",
    body: "Compare up to 4 companies at once, save searches, and track them with a watchlist.",
    href: "/compare",
    action: "Compare companies",
  },
];

export default function FeatureHighlights() {
  return (
    <section className="grid gap-6 border-y border-black/10 py-6 md:grid-cols-3 md:divide-x md:divide-black/10">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className={`border-l-2 pl-4 md:border-l-0 md:pl-6 ${feature.accent === "brand" ? "border-brand-500" : "border-accent-500"}`}
        >
          <h3 className="font-display text-heading-card font-bold">{feature.title}</h3>
          <p className="mt-1 text-sm text-muted">{feature.body}</p>
          <Link href={feature.href} className="mt-3 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline">
            {feature.action} →
          </Link>
        </div>
      ))}
    </section>
  );
}
