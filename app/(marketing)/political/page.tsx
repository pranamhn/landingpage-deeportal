import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function PoliticalPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Intelligence</p>
        <h1 className="font-display text-display-page font-bold">Political Data</h1>
        <p className="mt-1 text-muted">Aggregated public data for understanding electoral history, regional demographics, and political risk.</p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Regions", value: "83K+", sub: "desa/kelurahan" },
          { label: "Elections", value: "2014–2024", sub: "3 cycles" },
          { label: "Sources", value: "5", sub: "KPU, BPS, Dukcapil" },
          { label: "Metrics", value: "5", sub: "scoring models" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-brand-700">{stat.value}</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">{stat.label}</p>
            <p className="text-xs text-muted">{stat.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-heading-section font-bold text-gray-800">Political Scores</h2>
        <Link href="/political/dapil">
          <Button variant="outline">Dapil Analysis</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Region Score", desc: "Composite index: population, HDI, poverty, turnout, and electoral competitiveness." },
          { title: "Dominant Party", desc: "Historical vote share, margin over runner-up, and multi-cycle trend direction." },
          { title: "Swing Index", desc: "Electoral volatility measured across three election cycles." },
          { title: "Turnout Gap", desc: "Difference between registered voters and actual turnout — opportunity signal." },
          { title: "Issue Priority", desc: "Local issues ranked by severity and share of population affected." },
        ].map((item) => (
          <Card key={item.title}>
            <h3 className="font-semibold text-gray-800">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-warning-200 bg-warning-50 p-6 text-center dark:border-warning-800 dark:bg-warning-900/30">
        <p className="text-sm leading-relaxed text-warning-800 dark:text-warning-400">
          Uses <strong>aggregated public data only</strong>. No individual voter profiling, religion or ethnicity targeting, or disinformation tools.
        </p>
      </div>
    </div>
  );
}
