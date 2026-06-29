import { searchCompanies } from "@/lib/api/companiesService";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leaderboard — DeePortal.ai", description: "Top funded companies ranked by total funding raised." };

function fmtUsd(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

export default async function LeaderboardPage() {
  // Fetch companies sorted by funding
  const result = await searchCompanies({ sort: "funding_desc", limit: "50" });
  const companies = result.success ? result.data.data : [];

  const topFunded = [...companies]
    .filter((c: any) => (c.total_funding_usd || 0) > 0)
    .sort((a: any, b: any) => (b.total_funding_usd || 0) - (a.total_funding_usd || 0))
    .slice(0, 50);

  return (
    <div>
      <section className="mb-6">
        <p className="eyebrow">Intelligence</p>
        <h1 className="font-display text-display-page font-bold">Leaderboard</h1>
        <p className="mt-2 text-muted">Top companies ranked by total disclosed funding.</p>
      </section>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <th className="py-3 pl-6 pr-4 w-12">#</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Sector</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Rounds</th>
              <th className="py-3 pl-4 pr-6 text-right">Total Funding</th>
            </tr>
          </thead>
          <tbody>
            {topFunded.map((c: any, i: number) => (
              <tr key={c.id} className="border-b border-gray-50 transition-colors hover:bg-brand-50/30">
                <td className="py-3 pl-6 pr-4 text-xs font-bold text-muted">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/companies/${c.slug || c.id}`} className="font-semibold text-brand-600 hover:underline">{c.name}</Link>
                </td>
                <td className="px-4 py-3 text-muted">{c.sector || "—"}</td>
                <td className="px-4 py-3 text-muted">{c.location || "—"}</td>
                <td className="px-4 py-3 tabular-nums text-gray-700">{c.funding_rounds_count || 0}</td>
                <td className="py-3 pl-4 pr-6 text-right text-sm font-bold text-success-600">{fmtUsd(c.total_funding_usd || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
