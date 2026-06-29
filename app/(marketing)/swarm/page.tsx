import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function SwarmPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Intelligence</p>
        <h1 className="font-display text-display-page font-bold">Swarm Predictions</h1>
        <p className="mt-1 text-muted">Multi-agent simulations powered by DeepSeek AI. Predict outcomes, simulate scenarios, and explore what-if analyses.</p>
      </div>

      <div className="mb-10 grid gap-6 md:grid-cols-2">
        <Link href="/swarm/new?mode=social" className="group">
          <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="font-display text-heading-card text-gray-800 group-hover:text-brand-700">Social Sentiment</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Simulate public conversations on Twitter/X, Reddit, Mastodon, and Bluesky. Analyze sentiment shifts, narrative spread, and influencer impact.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">General</span>
              <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">Political</span>
              <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">IPO</span>
              <span className="rounded-full bg-warning-50 px-3 py-1 text-xs font-semibold text-warning-700">Crisis</span>
            </div>
          </Card>
        </Link>

        <Link href="/swarm/new?mode=investment" className="group">
          <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="font-display text-heading-card text-gray-800 group-hover:text-brand-700">Investment Prediction</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Predict business outcomes across 34 scenarios. Funding probability, acquisition fit, IPO readiness, market dynamics, and risk analysis.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Funding</span>
              <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">Acquisition</span>
              <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">IPO</span>
              <span className="rounded-full bg-warning-50 px-3 py-1 text-xs font-semibold text-warning-700">Market</span>
            </div>
          </Card>
        </Link>
      </div>

      <div className="mb-8">
        <p className="eyebrow">How It Works</p>
        <h2 className="font-display text-display-page font-bold">From Data to Decision</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { step: "1", title: "Describe", desc: "Write your prediction goal or upload supporting documents." },
          { step: "2", title: "Analyze", desc: "AI extracts entities and builds a knowledge graph." },
          { step: "3", title: "Simulate", desc: "Multiple AI agents run scenarios in parallel." },
          { step: "4", title: "Decide", desc: "Evidence-backed report with scores and recommendations." },
        ].map((item) => (
          <Card key={item.step} className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {item.step}
            </div>
            <h4 className="font-semibold text-gray-800">{item.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted">{item.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
