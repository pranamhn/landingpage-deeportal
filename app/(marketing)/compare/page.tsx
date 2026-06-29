"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { compareCompanies, searchCompanies, getTrendingCompanies } from "@/lib/api/companiesService";
import type { Company } from "@/types/company";
import Badge, { statusBadgeVariant } from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { formatCurrencyAbbrev, formatFullAmount, isNotStated } from "@/lib/formatters/format";

const MAX_COMPANIES = 4;
const AVATAR_COLORS = ["bg-brand-100 text-brand-700", "bg-accent-50 text-accent-600", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700"];

function totalRaised(c: Company): number {
  return (c.funding_rounds || []).reduce((sum, r: any) => sum + (r.amount_usd || 0), 0);
}

function Avatar({ name, index }: { name: string; index: number }) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
      {(name || "?")[0].toUpperCase()}
    </span>
  );
}

export default function ComparePage() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trending, setTrending] = useState<Company[]>([]);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ slug: string; name: string; sector?: string; location?: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTrendingCompanies().then((r) => {
      if (r.success) setTrending(r.data.filter((c) => !isNotStated(c.name)).slice(0, 6));
    });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const result = await searchCompanies({ q: query.trim(), limit: "6" });
      if (result.success) setSuggestions(result.data.data as any);
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function runCompare(nextSlugs: string[]) {
    if (nextSlugs.length === 0) {
      setCompanies([]);
      return;
    }
    setLoading(true);
    setError("");
    const result = await compareCompanies(nextSlugs);
    if (result.success) setCompanies(result.data);
    else setError(result.message);
    setLoading(false);
  }

  function addCompany(slug: string) {
    if (slugs.length >= MAX_COMPANIES || slugs.includes(slug)) return;
    const next = [...slugs, slug];
    setSlugs(next);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    runCompare(next);
  }

  function removeSlug(s: string) {
    const next = slugs.filter((x) => x !== s);
    setSlugs(next);
    runCompare(next);
  }

  const rows: { label: string; render: (c: Company) => React.ReactNode }[] = [
    { label: "Sector", render: (c) => c.sector ? <Badge variant="sector">{c.sector}</Badge> : "—" },
    { label: "Location", render: (c) => c.location || "—" },
    { label: "Founded", render: (c) => c.founded_year || "—" },
    { label: "Employees", render: (c) => c.employee_range || "—" },
    { label: "Status", render: (c) => c.status ? <Badge variant={statusBadgeVariant(c.status)}>{c.status}</Badge> : "—" },
    { label: "Funding rounds", render: (c) => c.funding_rounds?.length || 0 },
    {
      label: "Total raised", render: (c) => {
        const total = totalRaised(c);
        return total > 0 ? <span title={formatFullAmount(total)} className="font-semibold text-gray-900">{formatCurrencyAbbrev(total)}</span> : "—";
      },
    },
    { label: "Investors", render: (c) => new Set((c.funding_rounds || []).flatMap((r: any) => (r.investors || []).map((i: any) => i.name || i))).size || "—" },
    { label: "People tracked", render: (c) => c.people?.length || 0 },
  ];

  return (
    <div>
      <section className="mb-6">
        <p className="eyebrow mb-2">Side-by-side</p>
        <h1 className="font-display text-display-page font-bold">Compare companies</h1>
        <p className="mt-2 max-w-prose text-muted">
          Pick up to {MAX_COMPANIES} companies to compare sector, funding history, total raised,
          investor count, status, and team size, side by side — useful for sizing up competitors
          or shortlisting acquisition targets.
        </p>
      </section>

      <div ref={boxRef} className="relative mb-8 max-w-md">
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={slugs.length >= MAX_COMPANIES ? `Max ${MAX_COMPANIES} reached` : "Search company by name..."}
          disabled={slugs.length >= MAX_COMPANIES}
          className="shadow-sm"
        />
        {showSuggestions && query.trim() && (
          <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {searching ? (
              <p className="p-3 text-sm text-muted">Searching...</p>
            ) : suggestions.length > 0 ? (
              suggestions.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => addCompany(s.slug)}
                  disabled={slugs.includes(s.slug)}
                  className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="font-medium text-gray-900">{s.name}</span>
                  <span className="truncate text-xs text-muted">{s.sector || s.location || ""}</span>
                </button>
              ))
            ) : (
              <p className="p-3 text-sm text-muted">No matches for &quot;{query}&quot;.</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-danger-600">{error}</p>}

      {slugs.length === 0 ? (
        <div className="card flex flex-col items-center gap-5 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m6 10V11m-9 6h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <p className="font-display text-base font-bold text-gray-900">Nothing to compare yet</p>
            <p className="mt-1 text-sm text-muted">Search above, or try one of these trending companies:</p>
          </div>
          {trending.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {trending.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => addCompany(c.slug)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  + {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="w-40 shrink-0 p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted"></th>
                  {slugs.map((s, i) => {
                    const c = companies.find((co: any) => co.slug === s || co.id === s);
                    return (
                      <th key={s} className="min-w-[160px] p-4 text-left align-top">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c?.name || s} index={i} />
                            {c ? (
                              <Link href={`/companies/${c.slug}`} className="font-display text-sm font-bold text-gray-900 hover:text-brand-600">
                                {c.name}
                              </Link>
                            ) : (
                              <span className="font-display text-sm font-bold text-gray-400">{s}</span>
                            )}
                          </div>
                          <button onClick={() => removeSlug(s)} className="shrink-0 rounded-full p-1 text-gray-300 transition hover:bg-rose-50 hover:text-rose-500" aria-label={`Remove ${s}`}>
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        {!c && !loading && <p className="mt-1.5 text-xs font-medium text-rose-500">Not found</p>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={slugs.length + 1} className="p-10 text-center text-sm text-muted">Loading...</td></tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={row.label} className={idx % 2 === 1 ? "bg-gray-50/40" : ""}>
                      <td className="p-4 text-sm font-semibold text-muted">{row.label}</td>
                      {slugs.map((s) => {
                        const c = companies.find((co: any) => co.slug === s || co.id === s);
                        return (
                          <td key={s} className="p-4 text-sm text-gray-900">
                            {c ? row.render(c) : <span className="text-gray-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
