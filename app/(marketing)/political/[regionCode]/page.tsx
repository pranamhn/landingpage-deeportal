import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default async function RegionPoliticalProfile({ params }: { params: Promise<{ regionCode: string }> }) {
  const { regionCode } = await params;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="eyebrow">Political</p>
          <h1 className="font-display text-display-page font-bold">Region {regionCode}</h1>
          <p className="mt-1 text-muted">Demographics, electoral history, political scores, and local issues.</p>
        </div>
        <Link href="/political">
          <Button variant="outline">All Regions</Button>
        </Link>
      </div>

      <div className="mb-10 grid gap-3 md:grid-cols-3">
        {[
          { label: "Political Region Score", score: 72 },
          { label: "Swing Index", score: 35 },
          { label: "Turnout Opportunity", score: 58 },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <p className="text-3xl font-bold text-brand-700">{s.score}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="font-display text-heading-card text-gray-800">Election History</h3>
          <div className="mt-4 space-y-3">
            {[
              { year: 2024, winner: "PDIP", pct: 35, turnout: 78 },
              { year: 2019, winner: "PDIP", pct: 38, turnout: 75 },
              { year: 2014, winner: "Gerindra", pct: 32, turnout: 72 },
            ].map((e) => (
              <div key={e.year} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
                <span className="font-semibold text-gray-800">{e.year}</span>
                <span className="text-gray-700">{e.winner} ({e.pct}%)</span>
                <Badge variant="neutral">Turnout {e.turnout}%</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-heading-card text-gray-800">Local Issues</h3>
          <div className="mt-4 space-y-3">
            {[
              { issue: "Infrastructure", severity: "high" as const, pct: 65 },
              { issue: "Education", severity: "medium" as const, pct: 45 },
              { issue: "Healthcare", severity: "high" as const, pct: 55 },
            ].map((i) => (
              <div key={i.issue} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{i.issue}</span>
                <Badge variant={i.severity === "high" ? "danger" : "warning"}>{i.severity}</Badge>
                <span className="text-muted">{i.pct}% affected</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Badge variant="neutral">Source: KPU 2024 &middot; BPS 2024 &middot; Quality: Good</Badge>
      </div>
    </div>
  );
}
