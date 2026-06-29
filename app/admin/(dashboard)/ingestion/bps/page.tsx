"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { AdminPanel } from "@/components/admin/ui/AdminPanel";
import { AdminButton } from "@/components/admin/ui/AdminButton";

// ── Common BPS variables ──
const ALL_VARS: { id: string; label: string }[] = [
  { id: "404", label: "Jumlah Penduduk" },
  { id: "409", label: "IPM (Indeks Pembangunan Manusia)" },
  { id: "439", label: "Persentase Penduduk Miskin" },
  { id: "543", label: "TPT - Pengangguran Terbuka" },
  { id: "411", label: "Gini Ratio" },
  { id: "412", label: "Pengeluaran per Kapita" },
  { id: "1975", label: "Mid Year Population" },
  { id: "1976", label: "Population Growth Rate" },
  { id: "405", label: "Kepadatan Penduduk" },
  { id: "413", label: "Jumlah Penduduk Miskin" },
  { id: "415", label: "Indeks Kedalaman Kemiskinan (P1)" },
  { id: "416", label: "Indeks Keparahan Kemiskinan (P2)" },
  { id: "418", label: "Rata-rata Lama Sekolah" },
  { id: "419", label: "Harapan Lama Sekolah" },
  { id: "420", label: "Angka Harapan Hidup" },
  { id: "428", label: "Angka Melek Huruf" },
  { id: "434", label: "TPAK - Partisipasi Angkatan Kerja" },
  { id: "438", label: "Laju Pertumbuhan Ekonomi" },
  { id: "440", label: "PDRB per Kapita" },
  { id: "442", label: "Inflasi Tahun Kalender" },
  { id: "462", label: "IPG - Indeks Pembangunan Gender" },
  { id: "493", label: "Indeks Demokrasi Indonesia" },
  { id: "494", label: "IPAK - Anti Korupsi" },
  { id: "1155", label: "Rasio Elektrifikasi" },
  { id: "1161", label: "PDB per Tenaga Kerja" },
  { id: "1214", label: "Nilai Tambah Manufaktur" },
  { id: "1231", label: "Jumlah Desa Tertinggal" },
  { id: "1241", label: "Akses Hunian Layak" },
  { id: "1325", label: "Prevalensi Stunting Balita" },
  { id: "1337", label: "Kursi Perempuan DPR/DPRD" },
  { id: "1458", label: "Angka Melek Huruf >15" },
  { id: "1709", label: "IHK 90 Kota Umum" },
  { id: "1955", label: "PDB Triwulanan Harga Berlaku" },
  { id: "1956", label: "PDB Triwulanan Harga Konstan" },
  { id: "2261", label: "IHK 38 Provinsi (2022=100)" },
];

interface Progress {
  status: "idle" | "running" | "done";
  current: number;
  total: number;
  region: string;
  regions_total: number;
  regions_done: number;
}

export default function BpsIngestionPage() {
  const [region, setRegion] = useState("cascade");
  const [year, setYear] = useState("2024");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [search, setSearch] = useState("");
  const [selectedVars, setSelectedVars] = useState<Set<string>>(
    new Set(["404", "1975", "409", "439", "411", "410", "413"])
  );
  const [ingestedVars, setIngestedVars] = useState<Set<string>>(new Set());

  const [progress, setProgress] = useState<Progress>({ status: "idle", current: 0, total: 0, region: "", regions_total: 0, regions_done: 0 });
  const [showDone, setShowDone] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minDisplayRef = useRef<number>(0);

  const regionLabel = region === "cascade" ? "Indonesia (Prov + Kab/Kota)" : region === "all-34" ? "Indonesia (34 Prov)" : region === "all" ? "Java (6 prov)" : region === "kecamatan" ? "Kecamatan (AI Scrape)" : region === "desa" ? "Desa/Kelurahan (AI Scrape)" : "1 province";

  const pollProgress = useCallback(async () => {
    try {
      const resp = await fetch("/api/v1/admin/bps/ingest-progress");
      const data = await resp.json();
      if (data.success && data.data) {
        const p = data.data as Progress;
        setProgress(p);
        if (p.status === "done") {
          const elapsed = Date.now() - minDisplayRef.current;
          const delay = elapsed < 2000 ? 2000 - elapsed : 0;
          setTimeout(() => {
            setLoading(false);
            setShowDone(true);
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          }, delay);
          doneTimeoutRef.current = setTimeout(() => setShowDone(false), 8000);
        }
      }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { fetch("/api/v1/admin/bps/ingested-vars").then(r => r.json()).then(d => { if (d.success) setIngestedVars(new Set(d.data)) }).catch(() => { }) }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (doneTimeoutRef.current) clearTimeout(doneTimeoutRef.current);
    };
  }, []);

  const filteredVars = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ALL_VARS;
    return ALL_VARS.filter((v) => v.id.includes(q) || v.label.toLowerCase().includes(q));
  }, [search]);

  const toggleVar = (id: string) => {
    const next = new Set(selectedVars);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedVars(next);
  };

  const runIngestion = async () => {
    if (selectedVars.size === 0) return;
    setLoading(true);
    setStatus(null);
    setShowDone(false);
    minDisplayRef.current = Date.now();

    const isAiScrape = region === "kecamatan" || region === "desa";
    const command = isAiScrape ? "ingest-bps-ai" : "ingest-bps";
    const totalRegions = isAiScrape ? 514 : 34; // ~514 kab/kota for kecamatan/desa crawl

    setProgress({ status: "running", current: 0, total: selectedVars.size * totalRegions, region: "Starting AI scrape...", regions_total: totalRegions, regions_done: 0 });
    try {
      const resp = await fetch("/api/v1/admin/commands/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          params: { region, year, vars: Array.from(selectedVars).join(",") },
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setProgress((prev) => ({ ...prev, status: "running" }));
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(pollProgress, 1500);
        pollProgress();
      } else {
        setLoading(false);
        setProgress({ status: "idle", current: 0, total: 0, region: "", regions_total: 0, regions_done: 0 });
        setStatus({ type: "error", message: data.message || "Unknown error" });
      }
    } catch {
      setLoading(false);
      setProgress({ status: "idle", current: 0, total: 0, region: "", regions_total: 0, regions_done: 0 });
      setStatus({ type: "error", message: "Cannot connect to backend." });
    }
  };

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  const isRunning = progress.status === "running" || loading;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Data Mining"
        title="BPS Ingestion"
        description="Pull statistical data from BPS into Deeportal. Select variables and click Run."
      />

      {/* Done notification */}
      {showDone && progress.status === "done" && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">✅ Ingestion Complete</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {progress.current} records across {progress.regions_done} regions.{" "}
                <a href="/admin/data/bps" className="font-semibold underline">View data →</a>
              </p>
            </div>
            <button onClick={() => setShowDone(false)} className="text-emerald-400 hover:text-emerald-600 text-lg">×</button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {isRunning && (
        <AdminPanel className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {progress.region || "Starting..."}
            </p>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{progress.current}/{progress.total} · {pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">Polling every 1.5s</p>
        </AdminPanel>
      )}

      {/* Controls */}
      <AdminPanel className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={isRunning}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>── WebAPI (BPS API) ──</option>
              <option value="cascade">Indonesia (Prov + Kab/Kota)</option>
              <option value="all-34">Indonesia (34 Provinces only)</option>
              <option value="all">Java (6 Provinces)</option>
              <option value="" disabled>── AI Scrape (DeepSeek) ──</option>
              <option value="kecamatan">Kecamatan (Sub-district) 🧠</option>
              <option value="desa">Desa/Kelurahan (Village) 🧠</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Year</label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={isRunning}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="flex items-end">
            <AdminButton
              variant="primary"
              disabled={isRunning || selectedVars.size === 0}
              onClick={runIngestion}
              className="w-full text-base"
            >
              {isRunning ? "⏳ Running..." : `▶ Run Ingestion (${selectedVars.size} vars)`}
            </AdminButton>
          </div>
        </div>
      </AdminPanel>

      {/* Variables */}
      <AdminPanel className="mb-5">
        <h3 className="mb-1 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400">
          Select Variables
        </h3>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          {selectedVars.size} variable{selectedVars.size !== 1 ? "s" : ""} selected. Search or click to toggle.
        </p>

        {/* Selected tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {Array.from(selectedVars).map((id) => {
            const found = ALL_VARS.find((v) => v.id === id);
            return (
              <span key={id} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                {found ? found.label : `Var ${id}`}
                {!isRunning && <button onClick={() => toggleVar(id)} className="ml-0.5 text-brand-400 hover:text-brand-700">×</button>}
              </span>
            );
          })}
          {!isRunning && (
            <button onClick={() => setSelectedVars(new Set())} className="rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:border-rose-800 dark:bg-gray-800 dark:hover:bg-rose-900/30">
              Clear All
            </button>
          )}
        </div>

        {/* Search / Select */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isRunning}
          placeholder="Search variables..."
          className="mb-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <div className="max-h-[300px] overflow-y-auto space-y-0.5">
          {filteredVars.map((v) => {
            const isSelected = selectedVars.has(v.id);
            return (
              <button
                key={v.id}
                type="button"
                disabled={isRunning}
                onClick={() => toggleVar(v.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${isSelected ? "bg-brand-50 dark:bg-brand-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
              >
                <span className={`text-xs ${isSelected ? "text-emerald-500" : ingestedVars.has(v.id) ? "text-blue-400" : "text-gray-300"}`}>{isSelected ? "✓" : ingestedVars.has(v.id) ? "●" : "○"}</span>
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 w-14">{v.id}</span>
                <span className="text-gray-700 dark:text-gray-200">{v.label}</span>
              </button>
            );
          })}
        </div>
      </AdminPanel>

      {/* Status / Error */}
      {status && (
        <AdminPanel>
          <div className={`rounded-xl px-4 py-3 text-sm ${status.type === "success"
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
            }`}>
            {status.message}
          </div>
        </AdminPanel>
      )}
    </div>
  );
}
