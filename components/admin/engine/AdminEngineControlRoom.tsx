"use client";

import { useState, useEffect } from "react";
import { AdminPanel } from "@/components/admin/ui/AdminPanel";

interface Command {
  id: string;
  name: string;
  description: string;
  command: string;
  group: string;
  longRunning?: boolean;
  /** Backend jalankan via Popen (bukan subprocess.run), jadi bisa di-stop
   * lewat /api/v1/admin/commands/stop. Beda dari longRunning — "tests" juga
   * longRunning tapi sinkron/blocking di backend, tidak ada proses
   * background utk di-stop. */
  stoppable?: boolean;
  params?: { key: string; label: string; type: "date"; defaultValue: () => string }[];
}

interface Result {
  status: "success" | "error" | "running";
  output: string;
  timestamp: Date;
}

const COMMANDS: Command[] = [
  // ingest/enrich/enrich-investors/enrich-people dihapus dari sini — sudah
  // ada kontrol Run now/Stop real (launchctl) di EngineStatusPanel di atas,
  // jangan dirangkep dua jalur start berbeda buat proses yang sama.
  { id: "dedupe-funding", name: "Dedupe Funding", description: "Remove duplicate funding rounds", command: "dedupe-funding", group: "Data Quality", longRunning: true, stoppable: true },
  { id: "merge-similar-funding", name: "Merge Similar Funding", description: "Merge similar funding rounds", command: "merge-similar-funding", group: "Data Quality", longRunning: true, stoppable: true },
  { id: "merge-legal-affix-dupes", name: "Merge PT/Tbk Dupes", description: "Merge legal affix duplicates", command: "merge-legal-affix-dupes", group: "Data Quality", longRunning: true, stoppable: true },
  { id: "find-dupes", name: "Find Duplicates", description: "Scan for duplicate companies", command: "find-dupes", group: "Data Quality", longRunning: true, stoppable: true },
  { id: "backfill-dates", name: "Backfill Dates", description: "Backfill missing funding dates", command: "backfill-dates", group: "Backfill", longRunning: true, stoppable: true },
  { id: "backfill-country", name: "Backfill Country", description: "Backfill country data", command: "backfill-country", group: "Backfill", longRunning: true, stoppable: true },
  { id: "derive-investor-stats", name: "Derive Investor Stats", description: "Calculate investor statistics", command: "derive-investor-stats", group: "Backfill", longRunning: true, stoppable: true },
  { id: "backup", name: "Backup Database", description: "Create timestamped DB snapshot", command: "backup", group: "Backfill" },
  { id: "check-db", name: "Check Database", description: "SQLite integrity_check", command: "check-db", group: "Operations" },
  { id: "tests", name: "Run Tests", description: "Run pytest suite", command: "tests", group: "Operations", longRunning: true },
  { id: "typecheck", name: "TypeScript Check", description: "Run tsc --noEmit", command: "typecheck", group: "Operations" },
  { id: "stats", name: "Show Stats", description: "Directory quality snapshot", command: "stats", group: "Operations" },
];

const GROUPS = ["Data Quality", "Backfill", "Operations"];

function StopIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
      <rect x="3" y="3" width="10" height="10" rx="1.5" />
    </svg>
  );
}

export function AdminEngineControlRoom() {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [pendingFetch, setPendingFetch] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<Set<string>>(new Set());
  const [params, setParams] = useState<Record<string, Record<string, string>>>({});

  // Sumber kebenaran "apakah job ini BENERAN masih jalan di server" —
  // pendingFetch cuma berlangsung sebentar (durasi request/response), TAPI
  // command longRunning di-backend langsung return begitu proses background
  // dimulai (lihat _start_background_command di orchestrator/webapp.py),
  // jadi tanpa polling ini kartu cuma "kedip" lalu balik ke Execute padahal
  // job-nya masih jalan menit-menitan di server.
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const resp = await fetch("/api/v1/admin/engine/status");
        const json = await resp.json();
        if (!cancelled && json.success) {
          setActiveJobs(new Set(json.data.running_commands || []));
        }
      } catch { }
    }
    poll();
    const interval = setInterval(poll, 4000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  async function execute(cmd: Command) {
    const cmdParams = params[cmd.id] || {};
    setPendingFetch(cmd.id);
    setResults((prev) => ({ ...prev, [cmd.id]: { status: "running", output: cmd.longRunning ? "Memulai di background..." : "Executing...", timestamp: new Date() } }));
    try {
      const resp = await fetch("/api/v1/admin/commands/execute", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd.command, params: cmdParams }),
      });
      const json = await resp.json();
      setResults((prev) => ({ ...prev, [cmd.id]: { status: json.success ? "success" : "error", output: json.data?.output || json.message || "Done", timestamp: new Date() } }));
      if (json.success && cmd.stoppable) {
        setActiveJobs((prev) => new Set(prev).add(cmd.id));
      }
    } catch {
      setResults((prev) => ({ ...prev, [cmd.id]: { status: "error", output: "Network error", timestamp: new Date() } }));
    }
    setPendingFetch(null);
  }

  async function stop(cmd: Command) {
    setPendingFetch(cmd.id);
    try {
      const resp = await fetch("/api/v1/admin/commands/stop", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd.command }),
      });
      const json = await resp.json();
      setActiveJobs((prev) => { const next = new Set(prev); next.delete(cmd.id); return next; });
      setResults((prev) => ({ ...prev, [cmd.id]: { status: json.success ? "success" : "error", output: json.message || "Done", timestamp: new Date() } }));
    } catch {
      setResults((prev) => ({ ...prev, [cmd.id]: { status: "error", output: "Network error", timestamp: new Date() } }));
    }
    setPendingFetch(null);
  }

  return (
    <div>
      {GROUPS.map((group) => {
        const groupCmds = COMMANDS.filter((c) => c.group === group);
        return (
          <div key={group} className="mb-6">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{group}</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {groupCmds.map((cmd) => {
                const isPending = pendingFetch === cmd.id;
                const isActive = activeJobs.has(cmd.id);
                const cmdParams = params[cmd.id] || {};
                return (
                  <AdminPanel
                    key={cmd.id}
                    className={`flex flex-col gap-3 p-4 transition-colors ${isActive ? "border-amber-300 bg-amber-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{cmd.name}</h3>
                        <p className="mt-0.5 text-xs text-gray-500">{cmd.description}</p>
                      </div>
                      {isActive && (
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-600" />
                          Running
                        </span>
                      )}
                    </div>
                    {cmd.params?.map((p) => (
                      <div key={p.key}>
                        <label className="text-[11px] font-semibold uppercase text-gray-400">{p.label}</label>
                        <input type={p.type} value={cmdParams[p.key] || p.defaultValue()} disabled={isPending || isActive}
                          onChange={(e) => setParams((prev) => ({ ...prev, [cmd.id]: { ...prev[cmd.id], [p.key]: e.target.value } }))}
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
                        />
                      </div>
                    ))}
                    {isActive ? (
                      <button onClick={() => stop(cmd)} disabled={isPending}
                        className="mt-auto flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                        <StopIcon />
                        {isPending ? "Stopping..." : "Stop"}
                      </button>
                    ) : (
                      <button onClick={() => execute(cmd)} disabled={isPending}
                        className="mt-auto rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">
                        {isPending ? "Running..." : "Execute"}
                      </button>
                    )}
                  </AdminPanel>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(results).length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Output</h3>
          {Object.entries(results).map(([cmdId, result]) => {
            const cmd = COMMANDS.find((c) => c.id === cmdId);
            return (
              <div key={cmdId} className={`rounded-xl border-l-4 p-4 ${result.status === "error" ? "border-l-rose-500 bg-rose-50" : "border-l-emerald-500 bg-emerald-50"}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{cmd?.name}</span>
                  <button onClick={() => setResults((prev) => { const n = { ...prev }; delete n[cmdId]; return n; })} className="text-xs text-gray-400 hover:text-gray-700">Clear</button>
                </div>
                <pre className="max-h-48 overflow-auto rounded-lg bg-white/60 p-3 text-xs whitespace-pre-wrap font-mono text-gray-700">{result.output}</pre>
                <div className="mt-1 text-[11px] text-gray-400">{result.timestamp.toLocaleTimeString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
