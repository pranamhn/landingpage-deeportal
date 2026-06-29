"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/cn";
import { getSimulationStreamUrl, getSwarmReport, startSimulation } from "@/lib/api/swarmService";
import type { ProgressEvent, SwarmReport } from "@/types/swarm";
import Button from "@/components/ui/Button";

const STEP_LABELS: Record<string, string> = {
  files_processing: "Processing Files",
  ontology_generating: "Generating Ontology",
  graph_building: "Building Knowledge Graph",
  agents_generating: "Generating Agents",
  simulating: "Running Simulation",
  scoring: "Calculating Scores",
  report_generating: "Generating Report",
  completed: "Complete",
};

interface SimulationProgressProps {
  projectId: string;
  className?: string;
  onComplete?: (report: SwarmReport) => void;
}

export default function SimulationProgress({ projectId, className, onComplete }: SimulationProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [status, setStatus] = useState<string>("queued");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Start elapsed timer
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);

    // Connect to SSE stream
    const url = getSimulationStreamUrl(projectId);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("progress", (e: MessageEvent) => {
      const data: ProgressEvent = JSON.parse(e.data);
      setProgress(data.progress);
      setCurrentStep(data.currentStep || "");
      setStatus(data.status);
      if (data.error) setError(data.error);
    });

    es.addEventListener("done", async (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setStatus(data.status);
      es.close();
      if (timerRef.current) clearInterval(timerRef.current);

      if (data.status === "completed") {
        // Fetch the report
        const result = await getSwarmReport(projectId);
        if (result.success && result.data) {
          onComplete?.(result.data);
        }
      }
    });

    es.onerror = () => {
      // Reconnect after 3 seconds
      setTimeout(() => {
        es.close();
      }, 3000);
    };

    return () => {
      es.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [projectId]);

  const handleStart = async () => {
    setStatus("queued");
    const result = await startSimulation(projectId);
    if (result.success) {
      setStatus("running");
    } else {
      setError("Failed to start simulation");
    }
  };

  const steps = Object.keys(STEP_LABELS);
  const currentStepIdx = steps.indexOf(currentStep);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-heading-card text-gray-800">
            {status === "queued" ? "Ready to Start" : status === "completed" ? "Simulation Complete" : "Simulation Running"}
          </h2>
          <p className="text-sm text-muted">
            {status === "queued"
              ? "Click start to begin the simulation"
              : status === "completed"
                ? `Completed in ${formatElapsed(elapsed)}`
                : `${formatElapsed(elapsed)} elapsed`}
          </p>
        </div>
        {status === "queued" && (
          <Button variant="primary" onClick={handleStart}>
            🚀 Start Simulation
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-danger-50 p-4 text-sm text-danger-600">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">{STEP_LABELS[currentStep] || "Initializing..."}</span>
          <span className="font-semibold text-brand-600">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              status === "completed" ? "bg-success-600" : status === "failed" ? "bg-danger-600" : "bg-brand-600"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          const isPending = idx > currentStepIdx;

          return (
            <div key={step} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isCompleted && "bg-success-600 text-white",
                  isCurrent && "bg-brand-600 text-white animate-pulse",
                  isPending && "bg-gray-200 text-gray-400"
                )}
              >
                {isCompleted ? "✓" : isCurrent ? "●" : idx + 1}
              </div>
              <span
                className={cn(
                  "text-sm",
                  isCompleted && "text-success-700",
                  isCurrent && "font-semibold text-brand-700",
                  isPending && "text-gray-400"
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
