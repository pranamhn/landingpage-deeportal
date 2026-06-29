"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { AdminPanel } from "@/components/admin/ui/AdminPanel";
import { AdminButton } from "@/components/admin/ui/AdminButton";

export default function KpuIngestionPage() {
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("2024");
  const [electionType, setElectionType] = useState("pileg_dprd_kota");
  const [region, setRegion] = useState("");
  const [result, setResult] = useState("");

  const runIngestion = async () => {
    setLoading(true);
    setResult("Running KPU ingestion...");
    try {
      const resp = await fetch("/api/v1/admin/commands/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "ingest", args: { year, election_type: electionType, region } }),
      });
      const data = await resp.json();
      setResult(data.success ? "KPU ingestion completed." : `Error: ${data.message}`);
    } catch {
      setResult("Failed to connect to backend.");
    }
    setLoading(false);
  };

  return (
    <div>
      <AdminPageHeader eyebrow="Data Mining" title="KPU Ingestion" description="Auto-scrape election results from KPU website." />
      <AdminPanel>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-600">Election Type</label>
              <select value={electionType} onChange={(e) => setElectionType(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                <option value="pilpres">Presidential</option>
                <option value="pileg_dpr">Legislative DPR</option>
                <option value="pileg_dprd_prov">Legislative DPRD Prov</option>
                <option value="pileg_dprd_kota">Legislative DPRD Kota</option>
                <option value="pilkada_gub">Pilkada Gubernur</option>
                <option value="pilkada_bup">Pilkada Bupati</option>
                <option value="pilkada_walkot">Pilkada Walikota</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-600">Year</label>
              <input value={year} onChange={(e) => setYear(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
            </div>
          </div>
          <div>
            <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-600">Region Code (optional)</label>
            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. 32 for Jawa Barat" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          </div>
          <AdminButton variant="primary" disabled={loading} onClick={runIngestion}>
            {loading ? "Running..." : "Run KPU Ingestion"}
          </AdminButton>
          {result && <p className="text-sm text-muted">{result}</p>}
        </div>
      </AdminPanel>
    </div>
  );
}
