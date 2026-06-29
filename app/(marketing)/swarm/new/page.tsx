"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import NewSwarmForm from "@/components/swarm/NewSwarmForm";

export default function NewSwarmPage() {
  const router = useRouter();

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Swarm</p>
        <h1 className="font-display text-display-page font-bold">New Prediction</h1>
        <p className="mt-1 text-muted">Choose a prediction mode and configure your simulation.</p>
      </div>

      <div className="mx-auto max-w-[720px]">
        <Card>
          <NewSwarmForm onCreated={(projectId) => router.push(`/swarm/${projectId}`)} />
        </Card>
      </div>
    </div>
  );
}
