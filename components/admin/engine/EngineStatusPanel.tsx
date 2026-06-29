"use client";

import { useState, useEffect } from "react";

interface ServiceState {
  loaded: boolean;
  running: boolean;
  pid: number | null;
}

interface EngineStatus {
  auto: { running: boolean; pid?: number };
  ingest: ServiceState;
  enrich: { companies: ServiceState; investors: ServiceState; people: ServiceState };
  database: string;
  schema_version: number | null;
  backup_count: number;
  running_commands: string[];
  totals: { news: number; companies: number; investors: number; founders: number };
  range: string;
  activity: { runs: number; articles_processed: number; events_found: number; errors: number };
  cost: { total_usd: number; total_calls: number };
}

const RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: "30m", label: "Last 30 min" },
  { value: "1h", label: "Last 1 hour" },
  { value: "6h", label: "Last 6 hours" },
  { value: "12h", label: "Last 12 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

interface Budget {
  budget_usd: number;
  spent_today_usd: number;
  calls_today: number;
  exceeded: boolean;
}

function BudgetCard() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const resp = await fetch("/api/v1/admin/engine/budget");
      const json = await resp.json();
      if (json.success) {
        setBudget(json.data);
        setError(null);
      } else {
        setError(json.message || "Failed to load budget.");
      }
    } catch {
      setError("Could not reach server.");
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, []);

  async function save() {
    const value = parseFloat(draft);
    if (!value || value <= 0) return;
    setSaving(true);
    try {
      await fetch("/api/v1/admin/engine/budget", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget_usd: value }),
      });
      await load();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!budget) {
    if (error) {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm text-xs text-rose-600">
          {error}
          {error.toLowerCase().includes("unauthorized") && (
            <> — <a href="/admin/login" className="underline">log in again</a></>
          )}
        </div>
      );
    }
    return <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-xs text-gray-400">Loading budget...</div>;
  }

  const pct = Math.min(100, Math.round((budget.spent_today_usd / budget.budget_usd) * 100));

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${budget.exceeded ? "border-rose-200 bg-rose-50" : "border-gray-200 bg-white"}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${budget.exceeded ? "bg-rose-500" : "bg-blue-500"}`} />
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Daily Budget</h4>
        </div>
        {!editing && (
          <button
            onClick={() => { setDraft(String(budget.budget_usd)); setEditing(true); }}
            className="text-[11px] font-semibold text-brand-600 hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">$</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm"
            autoFocus
          />
          <button onClick={save} disabled={saving} className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50">
            {saving ? "..." : "Save"}
          </button>
          <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-700">Cancel</button>
        </div>
      ) : (
        <>
          <div className="text-lg font-bold text-gray-900">
            ${budget.spent_today_usd.toFixed(4)} <span className="text-sm font-normal text-gray-400">/ ${budget.budget_usd.toFixed(2)}/day</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${budget.exceeded ? "bg-rose-500" : "bg-blue-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {budget.exceeded ? "Cap reached — pipelines pause until tomorrow" : `${budget.calls_today} calls today`}
          </div>
        </>
      )}
    </div>
  );
}

function StatusCard({
  label,
  description,
  state,
  onStart,
  onStop,
  pending,
}: {
  label: string;
  description: string;
  state: { running: boolean; pid?: number | null; loaded?: boolean };
  onStart: () => void;
  onStop: () => void;
  pending: boolean;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border p-5 shadow-sm ${state.running ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"
        }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${state.running ? "bg-emerald-500 animate-live-dot" : "bg-gray-300"
            }`}
        />
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</h4>
      </div>
      <p className="mb-2 line-clamp-3 text-xs leading-relaxed text-gray-500">{description}</p>
      {state.pid && <div className="text-xs text-gray-500">PID {state.pid}</div>}
      <button
        onClick={state.running ? onStop : onStart}
        disabled={pending}
        className={`mt-auto w-full rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${state.running
          ? "bg-rose-600 text-white hover:bg-rose-700"
          : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
      >
        {pending ? "..." : state.running ? "Stop" : "Run now"}
      </button>
    </div>
  );
}

export function EngineStatusPanel() {
  const [status, setStatus] = useState<EngineStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [range, setRange] = useState("24h");

  async function load(currentRange: string) {
    try {
      const resp = await fetch(`/api/v1/admin/engine/status?range=${currentRange}`);
      const json = await resp.json();
      if (json.success) {
        setStatus(json.data);
        setError(null);
      } else {
        // Tetap pertahankan `status` lama biar UI tidak loncat balik ke
        // skeleton "Loading..." tiap polling gagal sesaat — tapi tetap
        // tampilkan error supaya kelihatan ini GAGAL, bukan masih loading
        // (sebelumnya: gagal diam-diam, "Loading..." nyangkut selamanya,
        // kelihatan kayak lambat padahal sebenarnya session admin expired).
        setError(json.message || "Gagal memuat status engine.");
      }
    } catch {
      setError("Tidak bisa menghubungi server.");
    }
  }

  useEffect(() => {
    load(range);
    const interval = setInterval(() => load(range), 15_000);
    return () => clearInterval(interval);
  }, [range]);

  async function stopIngest() {
    setPending("ingest");
    try {
      await fetch("/api/v1/admin/ingestion/stop", { method: "POST" });
    } finally {
      await load(range);
      setPending(null);
    }
  }
  async function startIngest() {
    setPending("ingest");
    try {
      await fetch("/api/v1/admin/ingestion/start", { method: "POST" });
    } finally {
      await load(range);
      setPending(null);
    }
  }
  async function stopEnrich(which: "companies" | "investors" | "people") {
    setPending(which);
    try {
      await fetch("/api/v1/admin/enrichment/stop", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ which }),
      });
    } finally {
      await load(range);
      setPending(null);
    }
  }
  async function startEnrich(which: "companies" | "investors" | "people") {
    setPending(which);
    try {
      await fetch("/api/v1/admin/enrichment/start", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ which }),
      });
    } finally {
      await load(range);
      setPending(null);
    }
  }

  if (!status) {
    if (error) {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">
          Failed to load engine status: {error}
          {error.toLowerCase().includes("unauthorized") && (
            <> — <a href="/admin/login" className="font-semibold underline">your session may have expired, log in again</a></>
          )}
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
        Loading engine status...
      </div>
    );
  }

  const activity = status.activity ?? { runs: 0, articles_processed: 0, events_found: 0, errors: 0 };
  const cost = status.cost ?? { total_usd: 0, total_calls: 0 };
  const totals = status.totals ?? { news: 0, companies: 0, investors: 0, founders: 0 };
  const rangeLabel = RANGE_OPTIONS.find((r) => r.value === range)?.label ?? range;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Activity &amp; cost</h4>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
          Range
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Runs */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Ingestion Runs ({rangeLabel})</h4>
          </div>
          <div className="text-lg font-bold text-gray-900">{activity.runs}</div>
          <div className="mt-1 text-xs text-gray-500">{activity.articles_processed} articles sent to LLM</div>
        </div>

        {/* Result */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${activity.errors > 0 ? "bg-amber-500" : "bg-emerald-500"}`} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Result ({rangeLabel})</h4>
          </div>
          <div className="text-lg font-bold text-gray-900">{activity.events_found} events found</div>
          <div className="mt-1 text-xs text-gray-500">{activity.errors} errors</div>
        </div>

        {/* Cost */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">LLM Cost ({rangeLabel})</h4>
          </div>
          <div className="text-lg font-bold text-gray-900">${cost.total_usd.toFixed(4)}</div>
          <div className="mt-1 text-xs text-gray-500">{cost.total_calls} calls</div>
        </div>

        <BudgetCard />

        {/* Totals */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Total News</h4>
          </div>
          <div className="text-lg font-bold text-gray-900">{totals.news.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Companies</h4>
          </div>
          <div className="text-lg font-bold text-gray-900">{totals.companies.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Investors</h4>
          </div>
          <div className="text-lg font-bold text-gray-900">{totals.investors.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Founders</h4>
          </div>
          <div className="text-lg font-bold text-gray-900">{totals.founders.toLocaleString()}</div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
          News &amp; Enrichment (real launchd status — not the one-off Execute buttons below)
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            label="Ingest News"
            description="Fetches news from RSS feeds, GDELT, and web search; extracts funding/M&A events via LLM. Manual only — no auto schedule."
            state={status.ingest} onStart={startIngest} onStop={stopIngest} pending={pending === "ingest"}
          />
          <StatusCard
            label="Enrich Companies"
            description="Backfills incomplete company profiles (sector, location, description) via web search + LLM, up to 200/run. Manual only — no auto schedule."
            state={status.enrich.companies} onStart={() => startEnrich("companies")} onStop={() => stopEnrich("companies")} pending={pending === "companies"}
          />
          <StatusCard
            label="Enrich Investors"
            description="Backfills investor profiles via Wikipedia + web search heuristics — no LLM calls. Manual only — no auto schedule."
            state={status.enrich.investors} onStart={() => startEnrich("investors")} onStop={() => stopEnrich("investors")} pending={pending === "investors"}
          />
          <StatusCard
            label="Enrich Founders"
            description="Backfills founder/executive profiles via Wikipedia + web search heuristics — no LLM calls. Manual only — no auto schedule."
            state={status.enrich.people} onStart={() => startEnrich("people")} onStop={() => stopEnrich("people")} pending={pending === "people"}
          />
        </div>
      </div>
    </div>
  );
}
