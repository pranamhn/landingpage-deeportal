import { cn } from "@/lib/cn";
import type { SwarmReport } from "@/types/swarm";

interface SwarmScoreCardProps {
  report: SwarmReport;
  className?: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-success-600";
  if (score >= 60) return "text-brand-600";
  if (score >= 40) return "text-warning-600";
  return "text-danger-600";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-success-50 border-success-200";
  if (score >= 60) return "bg-brand-50 border-brand-200";
  if (score >= 40) return "bg-warning-50 border-warning-200";
  return "bg-danger-50 border-danger-200";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Very High";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export default function SwarmScoreCard({ report, className }: SwarmScoreCardProps) {
  const isSocial = report.mode === "social_sentiment";
  const mainScore = isSocial ? report.score.sentimentScore : report.score.predictionScore;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Score Card */}
      <div className={cn("rounded-2xl border p-7 text-center", mainScore !== undefined ? scoreBg(mainScore) : "bg-white/80 border-black/10")}>
        <p className="text-label-ui font-extrabold uppercase tracking-[0.1em] text-muted">
          {isSocial ? "Sentiment Score" : "Prediction Score"}
        </p>
        <p className={cn("mt-2 font-display text-5xl font-extrabold", mainScore !== undefined ? scoreColor(mainScore) : "text-gray-800")}>
          {isSocial
            ? `${mainScore && mainScore > 0 ? "+" : ""}${mainScore ?? "—"}`
            : mainScore ?? "—"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {mainScore !== undefined ? scoreLabel(isSocial ? Math.abs(mainScore) : mainScore) : "Pending"} • Confidence: {report.score.confidenceScore}%
        </p>
      </div>

      {/* Sub-scores (Investment mode) */}
      {report.score.subScores && report.score.subScores.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-heading-section text-gray-800">Score Breakdown</h3>
          {report.score.subScores.map((sub) => (
            <div key={sub.name} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm text-gray-600">{sub.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={cn("h-full rounded-full", scoreColor(sub.score))}
                  style={{ width: `${sub.score}%` }}
                />
              </div>
              <span className={cn("w-10 text-right text-sm font-semibold", scoreColor(sub.score))}>{sub.score}</span>
            </div>
          ))}
        </div>
      )}

      {/* Political electability */}
      {report.score.electabilityForecast && (
        <div className="space-y-3">
          <h3 className="font-display text-heading-section text-gray-800">Electability Forecast</h3>
          {Object.entries(report.score.electabilityForecast).map(([name, score]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm font-semibold text-gray-700">{name}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${score}%` }} />
              </div>
              <span className="w-12 text-right text-sm font-bold text-brand-700">{score}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
