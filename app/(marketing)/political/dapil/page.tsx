"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function DapilPage() {
  const [dapilCode, setDapilCode] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const analyze = () => {
    setResult({
      dapil_code: dapilCode || "DPRD Kota Example Dapil 3",
      total_regions: 12,
      total_voters: 45000,
      party_results: { PDIP: 32, Gerindra: 28, PKB: 18, Golkar: 12, PKS: 10 },
      dominant_party: { score: 78, dominant_party: "PDIP", vote_share: 32, margin: 4 },
      swing_index: 42,
    });
  };

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Political</p>
        <h1 className="font-display text-display-page font-bold">Dapil Analysis</h1>
        <p className="mt-1 text-muted">Analyze electoral district composition, voter distribution, and party performance across regions.</p>
      </div>

      <div className="mx-auto max-w-[900px]">
        <Card className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter dapil code"
              value={dapilCode}
              onChange={(e) => setDapilCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <Button variant="primary" onClick={analyze}>Analyze</Button>
          </div>
        </Card>

        {result && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <Card className="text-center">
                <p className="text-3xl font-bold text-brand-700">{result.total_regions as number}</p>
                <p className="mt-1 text-sm text-muted">Regions</p>
              </Card>
              <Card className="text-center">
                <p className="text-3xl font-bold text-brand-700">{(result.total_voters as number).toLocaleString()}</p>
                <p className="mt-1 text-sm text-muted">Total Voters</p>
              </Card>
              <Card className="text-center">
                <p className="text-3xl font-bold text-warning-700">{result.swing_index as number}</p>
                <p className="mt-1 text-sm text-muted">Swing Index</p>
              </Card>
            </div>

            <Card className="mb-6">
              <h3 className="font-display text-heading-card text-gray-800">Vote Share</h3>
              <div className="mt-5 space-y-3">
                {(Object.entries(result.party_results as Record<string, number>)).map(([party, pct]) => (
                  <div key={party} className="flex items-center gap-4">
                    <span className="w-16 text-sm font-semibold text-gray-700">{party}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-10 text-right text-sm font-bold text-gray-800">{pct}%</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-heading-card text-gray-800">Leading Party</h3>
              <div className="mt-5 grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-muted">Party</p>
                  <p className="mt-1 text-xl font-bold text-brand-700">{(result.dominant_party as Record<string, unknown>).dominant_party as string}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Share</p>
                  <p className="mt-1 text-xl font-bold text-gray-800">{(result.dominant_party as Record<string, unknown>).vote_share as number}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Margin</p>
                  <p className="mt-1 text-xl font-bold text-warning-700">+{(result.dominant_party as Record<string, unknown>).margin as number}%</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
