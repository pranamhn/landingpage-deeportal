"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface RegionData {
  code: string;
  population?: number;
  hdi?: number;
  poverty?: number;
  unemployment?: number;
  gini?: number;
}

const REGION_NAMES: Record<string, string> = {
  "11": "Aceh", "12": "Sumatera Utara", "13": "Sumatera Barat", "14": "Riau",
  "15": "Jambi", "16": "Sumatera Selatan", "17": "Bengkulu", "18": "Lampung",
  "19": "Kep. Bangka Belitung", "21": "Kep. Riau",
  "31": "DKI Jakarta", "32": "Jawa Barat", "33": "Jawa Tengah",
  "34": "DI Yogyakarta", "35": "Jawa Timur", "36": "Banten",
  "51": "Bali", "52": "Nusa Tenggara Barat", "53": "Nusa Tenggara Timur",
  "61": "Kalimantan Barat", "62": "Kalimantan Tengah", "63": "Kalimantan Selatan",
  "64": "Kalimantan Timur", "65": "Kalimantan Utara",
  "71": "Sulawesi Utara", "72": "Sulawesi Tengah", "73": "Sulawesi Selatan",
  "74": "Sulawesi Tenggara", "75": "Gorontalo", "76": "Sulawesi Barat",
  "81": "Maluku", "82": "Maluku Utara", "91": "Papua", "92": "Papua Barat",
};

function formatPop(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

function calcScore(r: RegionData): number {
  let score = 50;
  if (r.hdi) score += (r.hdi - 60) * 0.6;
  if (r.poverty !== undefined) score -= r.poverty * 2;
  if (r.unemployment !== undefined) score -= r.unemployment;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export default function PopulationPage() {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/population/summary")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRegions(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalPop = regions.reduce((sum, r) => sum + (r.population || 0), 0);
  const avgHdi = regions.filter((r) => r.hdi).length > 0
    ? regions.filter((r) => r.hdi).reduce((s, r) => s + (r.hdi || 0), 0) / regions.filter((r) => r.hdi).length
    : 0;

  const sorted = useMemo(() => {
    return [...regions]
      .map((r) => ({ ...r, score: calcScore(r) }))
      .sort((a, b) => b.score - a.score);
  }, [regions]);

  const [page, setPage] = useState(1);
  const CARDS_PER_PAGE = 30;
  const totalPages = Math.max(1, Math.ceil(sorted.length / CARDS_PER_PAGE));
  const paged = sorted.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Intelligence</p>
        <h1 className="font-display text-display-page font-bold">Population Data</h1>
        <p className="mt-1 text-muted">Indonesia demographic intelligence from BPS data. Explore real-time regional profiles across 34 provinces.</p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Population", value: loading ? "..." : formatPop(totalPop), sub: "34 provinces" },
          { label: "Regions Covered", value: loading ? "..." : String(regions.length), sub: "provinces" },
          { label: "Avg. HDI", value: loading ? "..." : (avgHdi / 100).toFixed(2), sub: "human development index" },
          { label: "Data Source", value: "BPS", sub: "2024 statistics" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-brand-700">{stat.value}</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">{stat.label}</p>
            <p className="text-xs text-muted">{stat.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-heading-section font-bold text-gray-800">Top Regions by Opportunity</h2>
        <Link href="/population/segment">
          <Button variant="outline">Build Segment</Button>
        </Link>
      </div>

      {loading && <p className="py-8 text-center text-muted">Loading data...</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {paged.map((region) => (
          <Link key={region.code} href={`/population/${region.code}`} className="group">
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 group-hover:text-brand-700">
                  {REGION_NAMES[region.code] || region.code}
                </h3>
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">{region.score}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted">Pop.</span>{" "}
                  <span className="font-semibold">{region.population ? formatPop(region.population) : "-"}</span>
                </div>
                <div>
                  <span className="text-muted">HDI</span>{" "}
                  <span className="font-semibold">{region.hdi !== undefined ? (region.hdi / 100).toFixed(2) : "-"}</span>
                </div>
                <div>
                  <span className="text-muted">Poverty</span>{" "}
                  <span className="font-semibold">{region.poverty !== undefined ? region.poverty + "%" : "-"}</span>
                </div>
                <div>
                  <span className="text-muted">Unemp.</span>{" "}
                  <span className="font-semibold">{region.unemployment !== undefined ? region.unemployment + "%" : "-"}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button onClick={() => setPage(1)} disabled={page <= 1} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">«</button>
          <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">‹</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const s = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = s + i;
            if (p > totalPages) return null;
            return <button key={p} onClick={() => setPage(p)} className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium ${p === page ? "bg-brand-600 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>{p}</button>;
          })}
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">›</button>
          <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">»</button>
        </div>
      )}
    </div>
  );
}
