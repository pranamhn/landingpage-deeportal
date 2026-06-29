"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const REGIONS = [
  { code: "31", name: "DKI Jakarta" },
  { code: "32", name: "Jawa Barat" },
  { code: "35", name: "Jawa Timur" },
  { code: "34", name: "DI Yogyakarta" },
  { code: "33", name: "Jawa Tengah" },
  { code: "default", name: "Indonesia" },
];

const INCOMES = ["low", "middle_low", "middle", "middle_high", "high"];
const labelClass = "text-xs font-extrabold uppercase tracking-[0.12em] text-brand-600";
const inputClass = "mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function SegmentPage() {
  const [region, setRegion] = useState("default");
  const [ageMin, setAgeMin] = useState(15);
  const [ageMax, setAgeMax] = useState(64);
  const [income, setIncome] = useState("all");
  const [result, setResult] = useState<{ total_population: number; estimated_segment_size: number } | null>(null);

  const regions: Record<string, { total: number }> = {
    "31": { total: 10_670_000 }, "32": { total: 49_700_000 }, "35": { total: 41_000_000 },
    "34": { total: 3_700_000 }, "33": { total: 37_000_000 }, "default": { total: 278_000_000 },
  };

  const estimate = () => {
    const total = regions[region]?.total || 278_000_000;
    const pct = (ageMax - ageMin) / 75;
    const estimated = Math.round(total * pct * (income !== "all" ? 0.2 : 1));
    setResult({ total_population: total, estimated_segment_size: estimated });
  };

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Population</p>
        <h1 className="font-display text-display-page font-bold">Segment Builder</h1>
        <p className="mt-1 text-muted">Define demographic attributes to estimate your addressable market.</p>
      </div>

      <div className="mx-auto max-w-[720px]">
        <Card className="mb-6">
          <div className="space-y-8">
            <div>
              <label className={labelClass}>Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass}>
                {REGIONS.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Age Range</label>
              <div className="mt-2 flex items-center gap-3">
                <input type="number" value={ageMin} onChange={(e) => setAgeMin(Number(e.target.value))} min={0} max={100} className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                <span className="text-sm text-muted">to</span>
                <input type="number" value={ageMax} onChange={(e) => setAgeMax(Number(e.target.value))} min={0} max={100} className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                <span className="text-sm text-muted">years</span>
              </div>
            </div>

            <div>
              <label className={labelClass}>Income Level</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => setIncome("all")} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${income === "all" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-brand-50"}`}>All</button>
                {INCOMES.map((i) => (
                  <button key={i} onClick={() => setIncome(i)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${income === i ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-brand-50"}`}>{i.replace("_", " ")}</button>
                ))}
              </div>
            </div>

            <Button variant="primary" onClick={estimate} className="w-full">Estimate Segment</Button>
          </div>
        </Card>

        {result && (
          <Card className="text-center">
            <p className="text-sm text-muted">Estimated Segment Size</p>
            <p className="mt-2 text-5xl font-bold text-brand-700">{result.estimated_segment_size.toLocaleString()}</p>
            <p className="mt-2 text-sm text-muted">
              of {result.total_population.toLocaleString()} total ({Math.round((result.estimated_segment_size / result.total_population) * 100)}%)
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
