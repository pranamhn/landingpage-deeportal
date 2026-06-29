"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import type { SwarmMode, SocialSubType, PredictionType, ElectionType, SimulationMode } from "@/types/swarm";
import { createSwarmProject } from "@/lib/api/swarmService";

interface NewSwarmFormProps {
  className?: string;
  onCreated?: (projectId: string) => void;
}

const MODE_LABELS: Record<SwarmMode, string> = {
  social_sentiment: "Social Sentiment",
  investment_prediction: "Investment Prediction",
};

const SUB_TYPE_LABELS: Record<SocialSubType, string> = {
  general: "General Sentiment",
  political_election: "Political Election",
  ipo_sentiment: "IPO / Market Sentiment",
  crisis_sentiment: "Crisis / Issue Sentiment",
};

const PREDICTION_TYPE_LABELS: Record<PredictionType, string> = {
  funding: "Funding",
  acquisition: "Acquisition",
  ipo: "IPO Readiness",
  market_dynamics: "Market Dynamics",
  business_risk: "Business Risk",
  pricing: "Pricing",
  customer_behavior: "Customer Behavior",
  competitive_response: "Competitive Response",
};

const ELECTION_LABELS: Record<ElectionType, string> = {
  gubernur: "Gubernur",
  bupati: "Bupati",
  walikota: "Walikota",
  presiden: "Presiden",
  caleg: "Caleg",
};

const inputClass = "mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "text-xs font-extrabold uppercase tracking-[0.12em] text-brand-600";

export default function NewSwarmForm({ className, onCreated }: NewSwarmFormProps) {
  const [mode, setMode] = useState<SwarmMode>("investment_prediction");
  const [subType, setSubType] = useState<SocialSubType>("general");
  const [predictionType, setPredictionType] = useState<PredictionType>("funding");
  const [electionType, setElectionType] = useState<ElectionType>("gubernur");
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [objective, setObjective] = useState("");
  const [topics, setTopics] = useState("");
  const [candidates, setCandidates] = useState("");
  const [simulationMode, setSimulationMode] = useState<SimulationMode>("balanced");
  const [timeHorizon, setTimeHorizon] = useState("6 months");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSocial = mode === "social_sentiment";
  const isPolitical = isSocial && subType === "political_election";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: Record<string, unknown> = {
      title: title || `${isSocial ? "Social" : "Investment"} Prediction`,
      mode,
      agentCount: isSocial ? 100 : 20,
      loops: isSocial ? 10 : 10,
      objective: objective || undefined,
    };

    if (isSocial) {
      payload.subType = subType;
      payload.platforms = ["twitter", "reddit"];
      payload.seedTopics = topics ? topics.split(",").map((t) => t.trim()) : ["general"];
      if (isPolitical) {
        payload.electionType = electionType;
        payload.region = region || "Indonesia";
        if (candidates) {
          payload.candidates = candidates.split(",").map((c) => {
            const [name, party] = c.trim().split("/");
            return { name: name.trim(), party: (party || "Independent").trim() };
          });
        }
      }
    } else {
      payload.predictionType = predictionType;
      payload.simulationMode = simulationMode;
      payload.timeHorizon = timeHorizon;
      payload.markets = ["SEA"];
      payload.scenarios = ["optimistic", "neutral", "pessimistic"];
    }

    const result = await createSwarmProject(payload as unknown as Parameters<typeof createSwarmProject>[0]);
    setLoading(false);

    if (result.success && result.data) {
      onCreated?.(result.data.id);
    } else {
      setError(result.error?.message || "Failed to create project");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-10", className)}>
      {/* Mode */}
      <div>
        <label className={labelClass}>Prediction Mode</label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["social_sentiment", "investment_prediction"] as SwarmMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-xl border-2 px-5 py-4 text-left font-display font-semibold transition-all",
                mode === m ? "border-brand-600 bg-brand-50 text-brand-700" : "border-black/10 bg-white/80 text-gray-600 hover:border-brand-300"
              )}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Social sub-type */}
      {isSocial && (
        <>
          <div>
            <label className={labelClass}>Type</label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(Object.entries(SUB_TYPE_LABELS) as [SocialSubType, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSubType(key)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-all",
                    subType === key ? "border-brand-600 bg-brand-50 text-brand-700" : "border-black/10 bg-white/80 hover:border-brand-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isPolitical && (
            <>
              <div>
                <label className={labelClass}>Election Type</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(Object.entries(ELECTION_LABELS) as [ElectionType, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setElectionType(key)}
                      className={cn(
                        "rounded-full px-3 py-1 text-sm transition-all",
                        electionType === key ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-brand-100"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Region</label>
                <input className={inputClass} placeholder="e.g. Jawa Timur, DKI Jakarta" value={region} onChange={(e) => setRegion(e.target.value)} />
              </div>

              <div>
                <label className={labelClass}>Candidates</label>
                <input className={inputClass} placeholder="Candidate A / PDIP, Candidate B / Gerindra" value={candidates} onChange={(e) => setCandidates(e.target.value)} />
                <p className="mt-1 text-xs text-muted">Format: Name / Party, separated by commas</p>
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>Topics</label>
            <input className={inputClass} placeholder="economy, infrastructure, education" value={topics} onChange={(e) => setTopics(e.target.value)} />
            <p className="mt-1 text-xs text-muted">Topics that agents will discuss during simulation</p>
          </div>
        </>
      )}

      {/* Investment type */}
      {!isSocial && (
        <>
          <div>
            <label className={labelClass}>Prediction Type</label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(Object.entries(PREDICTION_TYPE_LABELS) as [PredictionType, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPredictionType(key)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition-all",
                    predictionType === key ? "border-brand-600 bg-brand-50 text-brand-700" : "border-black/10 bg-white/80 hover:border-brand-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Mode</label>
              <div className="mt-3 flex gap-2">
                {(["fast", "balanced", "deep"] as SimulationMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSimulationMode(m)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm capitalize transition-all",
                      simulationMode === m ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-brand-100"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Time Horizon</label>
              <input className={inputClass} value={timeHorizon} onChange={(e) => setTimeHorizon(e.target.value)} placeholder="6 months" />
            </div>
          </div>
        </>
      )}

      {/* Shared */}
      <div>
        <label className={labelClass}>Title</label>
        <input className={inputClass} placeholder="My prediction" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Objective</label>
        <input className={inputClass} placeholder="What do you want to predict?" value={objective} onChange={(e) => setObjective(e.target.value)} />
      </div>

      {error && (
        <div className="rounded-xl bg-danger-50 p-4 text-sm text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">{error}</div>
      )}

      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Start Prediction"}
      </Button>
    </form>
  );
}
