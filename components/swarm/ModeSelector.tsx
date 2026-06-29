"use client";

import { cn } from "@/lib/cn";

export type SwarmMode = "social_sentiment" | "investment_prediction";

interface ModeSelectorProps {
  value: SwarmMode;
  onChange: (mode: SwarmMode) => void;
  className?: string;
}

export default function ModeSelector({ value, onChange, className }: ModeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      <button
        type="button"
        onClick={() => onChange("social_sentiment")}
        className={cn(
          "relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-left transition-all",
          value === "social_sentiment"
            ? "border-brand-600 bg-brand-50 shadow-sm"
            : "border-black/10 bg-white/80 hover:border-brand-300 hover:bg-brand-50/50"
        )}
      >
        <span className="text-3xl">🐦</span>
        <div>
          <h3 className={cn("font-display text-heading-card", value === "social_sentiment" ? "text-brand-700" : "text-gray-800")}>
            Social Sentiment
          </h3>
          <p className="mt-1 text-sm text-muted">
            Predict what people will say on Twitter/X & Reddit. Simulate conversations, sentiment shifts, and narrative spread.
          </p>
        </div>
        {value === "social_sentiment" && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-2 py-0.5 text-label-ui font-semibold text-white">
            Selected
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onChange("investment_prediction")}
        className={cn(
          "relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-left transition-all",
          value === "investment_prediction"
            ? "border-brand-600 bg-brand-50 shadow-sm"
            : "border-black/10 bg-white/80 hover:border-brand-300 hover:bg-brand-50/50"
        )}
      >
        <span className="text-3xl">💼</span>
        <div>
          <h3 className={cn("font-display text-heading-card", value === "investment_prediction" ? "text-brand-700" : "text-gray-800")}>
            Investment Prediction
          </h3>
          <p className="mt-1 text-sm text-muted">
            Predict business outcomes: funding probability, acquisition fit, IPO readiness, market dynamics, and risk analysis.
          </p>
        </div>
        {value === "investment_prediction" && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-2 py-0.5 text-label-ui font-semibold text-white">
            Selected
          </span>
        )}
      </button>
    </div>
  );
}
