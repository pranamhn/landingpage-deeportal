"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { SwarmReport as SwarmReportType, ChatMessage } from "@/types/swarm";
import { sendChatMessage } from "@/lib/api/swarmService";
import SwarmScoreCard from "./SwarmScoreCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface SwarmReportProps {
  report: SwarmReportType;
  projectId: string;
  className?: string;
}

export default function SwarmReport({ report, projectId, className }: SwarmReportProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"findings" | "risks" | "opportunities" | "recommendations" | "chat">("findings");

  const handleChat = async () => {
    if (!input.trim()) return;
    setChatLoading(true);
    setChatMessages((prev) => [...prev, { id: String(Date.now()), role: "user", content: input }]);

    const result = await sendChatMessage(projectId, input);
    setChatLoading(false);
    setInput("");

    if (result.success && result.data) {
      setChatMessages((prev) => [...prev, result.data!.message]);
    }
  };

  const tabs = [
    { id: "findings" as const, label: "📊 Findings", count: report.keyFindings?.length || 0 },
    { id: "risks" as const, label: "⚠️ Risks", count: report.risks?.length || 0 },
    { id: "opportunities" as const, label: "💡 Opportunities", count: report.opportunities?.length || 0 },
    { id: "recommendations" as const, label: "✅ Actions", count: report.recommendations?.length || 0 },
    { id: "chat" as const, label: "💬 Chat", count: chatMessages.length },
  ];

  return (
    <div className={cn("space-y-8", className)}>
      {/* Summary */}
      <div className="rounded-2xl border border-black/10 bg-white/80 p-7 shadow-sm">
        <p className="text-label-ui font-extrabold uppercase tracking-[0.1em] text-brand-600">Summary</p>
        <p className="mt-2 leading-relaxed text-gray-700">{report.summary}</p>
      </div>

      {/* Score Card */}
      <SwarmScoreCard report={report} />

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-black/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-semibold transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-brand-600 text-brand-700"
                  : "text-muted hover:text-gray-700"
              )}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "findings" && (
            <div className="space-y-3">
              {report.keyFindings?.map((f, i) => (
                <div key={i} className="rounded-xl border border-black/10 bg-white/80 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">{f.title}</h4>
                    <Badge variant="brand">{Math.round(f.confidence * 100)}% confidence</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{f.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "risks" && (
            <div className="space-y-3">
              {report.risks?.map((r, i) => (
                <div key={i} className="rounded-xl border border-black/10 bg-white/80 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">{r.type}</h4>
                    <Badge variant={r.severity === "high" || r.severity === "critical" ? "danger" : "warning"}>
                      {r.severity} • {Math.round(r.probability * 100)}%
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{r.description}</p>
                  {r.mitigation && <p className="mt-2 text-sm text-success-700">🛡️ {r.mitigation}</p>}
                </div>
              ))}
            </div>
          )}

          {activeTab === "opportunities" && (
            <div className="space-y-3">
              {report.opportunities?.map((o, i) => (
                <div key={i} className="rounded-xl border border-black/10 bg-white/80 p-4">
                  <h4 className="font-semibold text-gray-800">{o.type}</h4>
                  <p className="mt-1 text-sm text-muted">{o.description}</p>
                  <Badge variant="success" className="mt-2">{o.potentialImpact} impact</Badge>
                </div>
              ))}
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-3">
              {report.recommendations?.map((r, i) => (
                <div key={i} className="rounded-xl border border-black/10 bg-white/80 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">{r.action}</h4>
                    <Badge variant={r.priority === "high" ? "danger" : r.priority === "medium" ? "warning" : "neutral"}>
                      {r.priority}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{r.rationale}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "chat" && (
            <div className="space-y-4">
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "rounded-xl p-3 text-sm",
                      msg.role === "user" ? "ml-8 bg-brand-50 text-brand-900" : "mr-8 bg-gray-100 text-gray-800"
                    )}
                  >
                    <p className="text-label-ui font-bold text-muted">{msg.role === "user" ? "You" : msg.role === "agent" ? "Agent" : "Swarm AI"}</p>
                    <p className="mt-1">{msg.content}</p>
                  </div>
                ))}
                {chatLoading && <p className="text-sm text-muted">Swarm AI is thinking...</p>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  placeholder="Ask a follow-up question about this prediction..."
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <Button variant="primary" onClick={handleChat} disabled={chatLoading || !input.trim()}>
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
