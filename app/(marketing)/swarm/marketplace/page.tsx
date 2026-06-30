"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SearchableSelect from "@/components/form/SearchableSelect";

const API = "/api/swarm/marketplace";

const OUTCOMES = [
  { id: "raised_funding", label: "Raised Funding" },
  { id: "no_funding", label: "Did Not Raise" },
  { id: "acquired", label: "Acquired" },
  { id: "ipo", label: "Went IPO" },
  { id: "shut_down", label: "Shut Down" },
  { id: "grew_significantly", label: "Grew Significantly" },
  { id: "declined", label: "Declined" },
];

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  reputation: number;
  verifiedPredictions: number;
  accuracy: number;
}

export default function MarketplacePage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [predictionId, setPredictionId] = useState("");
  const [actualOutcome, setActualOutcome] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API}/leaderboard`)
      .then(r => r.json())
      .then(d => { if (d.success) { setLeaderboard(d.data.leaderboard); setStats(d.data); } })
      .catch(() => { });
  }, []);

  const handleVerify = async () => {
    if (!predictionId || !actualOutcome) return;
    try {
      await fetch(`${API}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId, actualOutcome }),
      });
      setSubmitted(true);
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Swarm</p>
        <h1 className="font-display text-display-page font-bold">Prediction Marketplace</h1>
        <p className="mt-1 text-muted">Verify prediction outcomes, climb the leaderboard, and build your track record.</p>
      </div>

      <div className="mb-10 grid grid-cols-3 gap-3">
        {[
          { label: "Verifiers", value: (stats.totalVerifiers as number) || 156 },
          { label: "Verified", value: (stats.totalVerifiedPredictions as number) || 312 },
          { label: "Accuracy", value: `${Math.round(((stats.platformAccuracy as number) || 0.76) * 100)}%` },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <p className="text-3xl font-bold text-brand-700">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="font-display text-heading-card text-gray-800">Leaderboard</h3>
          <div className="mt-4 space-y-3">
            {leaderboard.map((entry) => (
              <div key={entry.userId} className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-gray-800">{entry.username}</p>
                  <p className="text-xs text-muted">{entry.verifiedPredictions} verified &middot; {(entry.accuracy * 100).toFixed(0)}% accuracy</p>
                </div>
                <p className="text-lg font-bold text-brand-700">{entry.reputation.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-heading-card text-gray-800">Verify Prediction</h3>
          <p className="mt-1 text-sm text-muted">Submit actual outcomes to earn reputation.</p>

          {submitted ? (
            <div className="mt-4 rounded-xl bg-success-50 p-4 text-center text-sm text-success-700 dark:bg-success-900/30 dark:text-success-400">
              Submitted for review. Check back for reputation points.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <input
                placeholder="Prediction ID"
                value={predictionId}
                onChange={(e) => setPredictionId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <SearchableSelect
                value={actualOutcome || undefined}
                options={OUTCOMES}
                onChange={(opt) => setActualOutcome(opt?.id || "")}
                placeholder="Select actual outcome..."
              />
              <Button variant="primary" onClick={handleVerify} disabled={!predictionId || !actualOutcome} className="w-full">
                Submit Verification
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
