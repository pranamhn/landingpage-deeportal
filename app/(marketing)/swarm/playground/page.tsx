"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SearchableSelect from "@/components/form/SearchableSelect";

const API_BASE = "/api/swarm/playground";

function PersonaPackBrowser() {
  const [packs, setPacks] = useState<{ id: string; name: string; description: string; category: string; personas: { role: string; persona: Record<string, unknown>; decisionFactors: string[] }[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/persona-packs`);
      const json = await res.json();
      if (json.success) setPacks(json.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (!packs.length && !loading) {
    return (
      <Card className="text-center">
        <p className="text-muted">Browse pre-built agent profiles for simulations.</p>
        <Button variant="primary" onClick={loadPacks} className="mt-4">Load Packs</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {packs.map((pack) => (
        <Card key={pack.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setExpanded(expanded === pack.id ? null : pack.id)}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">{pack.name}</h4>
              <p className="text-sm text-muted">{pack.description}</p>
            </div>
            <Badge variant={pack.category === "political" ? "warning" : pack.category === "social" ? "accent" : "brand"}>{pack.category}</Badge>
          </div>
          {expanded === pack.id && (
            <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
              {pack.personas.map((p, i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="font-semibold text-brand-700">{p.role.replace(/_/g, " ")}</p>
                  <p className="text-muted">Goal: {p.persona.goal as string}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.decisionFactors.map((f) => (
                      <span key={f} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function PersonaTester() {
  const [role, setRole] = useState("seed_investor");
  const [topic, setTopic] = useState("");
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const testPersona = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/test-persona`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, persona: { riskTolerance: "medium", goal: "Analyze the given scenario", country: "Indonesia" }, scenario: scenario || "General analysis", topic: topic || "technology" }),
      });
      const json = await res.json();
      if (json.success) setResult(json.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const roles = ["seed_investor", "vc_investor", "founder", "political_influencer", "swing_voter", "independent_journalist", "adversarial_analyst"];

  return (
    <Card>
      <h3 className="font-display text-heading-card text-gray-800">Test Persona</h3>
      <div className="mt-4 space-y-3">
        <SearchableSelect
          value={role}
          options={roles.map((r) => ({ id: r, label: r.replace(/_/g, " ") }))}
          onChange={(opt) => setRole(opt?.id || roles[0])}
        />
        <input placeholder="Topic (e.g. fintech)" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <input placeholder="Scenario (optional)" value={scenario} onChange={(e) => setScenario(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <Button variant="primary" onClick={testPersona} disabled={loading} className="w-full">Test Persona</Button>
      </div>
      {result && (
        <div className="mt-4 rounded-xl bg-brand-50 p-4 text-sm space-y-2 dark:bg-brand-900/30">
          <p><strong>Decision:</strong> {result.decision as string}</p>
          <p><strong>Action:</strong> {result.action as string}</p>
          <p><strong>Score Impact:</strong> <span className={cn("font-bold", (result.score_impact as number) > 0 ? "text-success-600" : "text-danger-600")}>{(result.score_impact as number) > 0 ? "+" : ""}{result.score_impact as number}</span></p>
          <p className="text-muted">{result.reasoning as string}</p>
        </div>
      )}
    </Card>
  );
}

function MultiLangTester() {
  const [lang, setLang] = useState("id");
  const [topic, setTopic] = useState("ekonomi digital");
  const [sentiment, setSentiment] = useState<"positive" | "negative" | "neutral">("positive");
  const [result, setResult] = useState<{ post: string } | null>(null);

  const testPost = async () => {
    try {
      const res = await fetch(`${API_BASE}/test-multilang`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang, topic, sentiment }) });
      const json = await res.json();
      if (json.success) setResult(json.data);
    } catch { /* ignore */ }
  };

  const languages = [
    { code: "id", name: "Bahasa Indonesia" }, { code: "en", name: "English" }, { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" }, { code: "ko", name: "Korean" }, { code: "th", name: "Thai" }, { code: "vi", name: "Vietnamese" },
  ];

  return (
    <Card>
      <h3 className="font-display text-heading-card text-gray-800">Multi-language Post</h3>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {languages.map((l) => (
            <button key={l.code} onClick={() => setLang(l.code)} className={cn("rounded-full px-3 py-1 text-sm transition", lang === l.code ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-brand-50")}>{l.name}</button>
          ))}
        </div>
        <input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <div className="flex gap-2">
          {(["positive", "negative", "neutral"] as const).map((s) => (
            <button key={s} onClick={() => setSentiment(s)} className={cn("rounded-lg px-3 py-1 text-sm capitalize transition", sentiment === s ? (s === "positive" ? "bg-success-600 text-white" : s === "negative" ? "bg-danger-600 text-white" : "bg-gray-600 text-white") : "bg-gray-100 text-gray-600")}>{s}</button>
          ))}
        </div>
        <Button variant="primary" onClick={testPost} className="w-full">Generate Post</Button>
      </div>
      {result && <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm italic text-gray-700">"{result.post}"</div>}
    </Card>
  );
}

function SignalTester() {
  const [projectId, setProjectId] = useState("");
  const [signalType, setSignalType] = useState("competitor_funding");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const injectSignal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/inject-signal`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, signalType }) });
      const json = await res.json();
      if (json.success) setResult(json.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const signalTypes = [
    { type: "competitor_funding", label: "Competitor Funding", impact: -4 },
    { type: "regulatory_change", label: "Regulatory Change", impact: -6 },
    { type: "key_hire", label: "Key Hire", impact: +5 },
    { type: "market_crash", label: "Market Crash", impact: -8 },
    { type: "product_launch", label: "Product Launch", impact: +7 },
    { type: "partnership", label: "Partnership", impact: +6 },
    { type: "scandal", label: "Scandal", impact: -9 },
    { type: "macro_event", label: "Macro Event", impact: -5 },
  ];

  return (
    <Card>
      <h3 className="font-display text-heading-card text-gray-800">Inject External Signal</h3>
      <div className="mt-4 space-y-3">
        <input placeholder="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <div className="grid grid-cols-2 gap-2">
          {signalTypes.map((s) => (
            <button key={s.type} onClick={() => setSignalType(s.type)} className={cn("rounded-lg border px-3 py-2 text-left text-sm transition", signalType === s.type ? "border-brand-600 bg-brand-50" : "border-black/10 hover:border-brand-300")}>
              {s.label} <span className={s.impact > 0 ? "text-success-600" : "text-danger-600"}>({s.impact > 0 ? "+" : ""}{s.impact})</span>
            </button>
          ))}
        </div>
        <Button variant="primary" onClick={injectSignal} disabled={loading || !projectId} className="w-full">Inject Signal</Button>
      </div>
      {result && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex gap-4">
            <div className="rounded-xl bg-gray-50 p-3 text-center flex-1">
              <p className="text-muted">Before</p>
              <p className="text-2xl font-bold">{result.beforeScore as number}</p>
            </div>
            <div className="flex items-center text-xl text-muted">→</div>
            <div className="rounded-xl bg-gray-50 p-3 text-center flex-1">
              <p className="text-muted">After</p>
              <p className={cn("text-2xl font-bold", (result.impact as number) > 0 ? "text-success-600" : "text-danger-600")}>{result.afterScore as number}</p>
            </div>
          </div>
          <p className="text-muted text-center">Impact: {(result.impact as number) > 0 ? "+" : ""}{result.impact as number} points &middot; {(result.affectedNodes as unknown[])?.length || 0} nodes affected</p>
        </div>
      )}
    </Card>
  );
}

export default function PlaygroundPage() {
  const [tab, setTab] = useState<"packs" | "test" | "multilang" | "signals">("test");

  const tabs = [
    { id: "test" as const, label: "Test Persona" },
    { id: "packs" as const, label: "Persona Packs" },
    { id: "multilang" as const, label: "Multi-language" },
    { id: "signals" as const, label: "Signal Injection" },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Swarm</p>
        <h1 className="font-display text-display-page font-bold">Agent Playground</h1>
        <p className="mt-1 text-muted">Test personas, generate multi-language posts, browse pre-built packs, and inject external signals.</p>
      </div>

      <div className="mb-8 flex gap-1 border-b border-black/10">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("px-4 py-2.5 text-sm font-semibold transition-colors", tab === t.id ? "border-b-2 border-brand-600 text-brand-700" : "text-muted hover:text-gray-700")}>{t.label}</button>
        ))}
      </div>

      <div className="mx-auto max-w-[720px]">
        {tab === "test" && <PersonaTester />}
        {tab === "packs" && <PersonaPackBrowser />}
        {tab === "multilang" && <MultiLangTester />}
        {tab === "signals" && <SignalTester />}
      </div>
    </div>
  );
}
