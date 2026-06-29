"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import SimulationProgress from "@/components/swarm/SimulationProgress";
import SwarmReportView from "@/components/swarm/SwarmReportView";
import { getSwarmProject, getSwarmReport } from "@/lib/api/swarmService";
import type { SwarmProject, SwarmReport } from "@/types/swarm";

export default function SwarmProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<SwarmProject | null>(null);
  const [report, setReport] = useState<SwarmReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [projResult, reportResult] = await Promise.all([
        getSwarmProject(projectId),
        getSwarmReport(projectId),
      ]);
      if (projResult.success && projResult.data) setProject(projResult.data);
      if (reportResult.success && reportResult.data) setReport(reportResult.data);
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-4 w-96 rounded bg-gray-200" />
          <div className="h-48 rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-12 text-center">
        <h2 className="font-display text-heading-card text-gray-800">Project Not Found</h2>
        <p className="mt-2 text-muted">The prediction project could not be found.</p>
        <Link href="/swarm">
          <Button variant="primary" className="mt-4">Back to Swarm</Button>
        </Link>
      </div>
    );
  }

  const isSocial = project.mode === "social_sentiment";
  const modeLabel = isSocial ? "🐦 Social Sentiment" : "💼 Investment Prediction";

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12">
      <SectionHeader
        eyebrow={modeLabel}
        title={project.title}
        description={
          isSocial
            ? `${project.subType || "General"} • ${project.platforms?.join(" + ") || "Twitter + Reddit"} • ${project.agentCount} agents • ${project.loops} loops`
            : `${project.predictionType || "Prediction"} • ${project.simulationMode || "balanced"} mode • ${project.timeHorizon || "N/A"}`
        }
        action={
          <div className="flex gap-2">
            {report && (
              <Link href={`/swarm/${projectId}?tab=chat`}>
                <Button variant="outline">💬 Chat</Button>
              </Link>
            )}
            <Link href="/swarm/new">
              <Button variant="secondary">New</Button>
            </Link>
          </div>
        }
      />

      <div className="mt-8">
        {report ? (
          <SwarmReportView report={report} projectId={projectId} />
        ) : (
          <SimulationProgress
            projectId={projectId}
            onComplete={(r) => setReport(r)}
          />
        )}
      </div>
    </div>
  );
}
