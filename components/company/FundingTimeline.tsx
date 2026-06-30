import Link from "next/link";
import { extractDomain, formatCurrencyAbbrev, formatFullAmount, formatRoundType, isNotStated } from "@/lib/formatters/format";
import type { FundingRound } from "@/types/company";

type FundingInvestor = FundingRound["investors"][number] & { is_lead?: boolean };

type FundingSource = {
  url: string;
  title?: string;
};

type MergedFundingRound = Omit<FundingRound, "investors"> & {
  investors: FundingInvestor[];
  sources: FundingSource[];
};

function isInformativeRoundType(roundType?: string | null) {
  const normalized = roundType?.trim().toLowerCase().replace(/[_-]+/g, " ");
  return Boolean(normalized && normalized !== "undisclosed" && normalized !== "unknown");
}

function investorKey(investor: FundingInvestor) {
  return investor.slug || investor.id || investor.name.trim().toLowerCase();
}

function getSources(round: FundingRound): FundingSource[] {
  if (!round.source_url) return [];

  const titles = (round.source_title || "").split(" · ");
  return round.source_url
    .split(" | ")
    .filter(Boolean)
    .map((url, index) => ({
      url,
      title: !isNotStated(titles[index]) ? titles[index] : index === 0 && !isNotStated(round.source_title) ? round.source_title : undefined,
    }));
}

function mergeFundingRounds(rounds: FundingRound[]): MergedFundingRound[] {
  const merged = new Map<string, MergedFundingRound>();

  rounds.forEach((round) => {
    const amount = Number(round.amount_usd) || 0;
    const date = round.announced_date?.trim() || "";
    const investors = (round.investors || []) as FundingInvestor[];

    // A known date and amount identify the same reported event. For undated
    // records, require the type and investor set too so unrelated rounds are
    // not collapsed merely because their nominal happens to match.
    const key = amount
      ? date
        ? `dated:${date}:${amount}`
        : `undated:${amount}:${round.round_type || ""}:${investors.map(investorKey).sort().join(",")}`
      : `unique:${round.id}`;

    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, {
        ...round,
        investors: investors.map((investor) => ({ ...investor })),
        sources: getSources(round),
      });
      return;
    }

    if (!isInformativeRoundType(existing.round_type) && isInformativeRoundType(round.round_type)) {
      existing.round_type = round.round_type;
    }

    const investorMap = new Map(existing.investors.map((investor) => [investorKey(investor), investor]));
    investors.forEach((investor) => {
      const key = investorKey(investor);
      const current = investorMap.get(key);
      if (current) {
        current.is_lead = Boolean(current.is_lead || investor.is_lead);
      } else {
        const copy = { ...investor };
        existing.investors.push(copy);
        investorMap.set(key, copy);
      }
    });

    const sourceUrls = new Set(existing.sources.map((source) => source.url));
    getSources(round).forEach((source) => {
      if (!sourceUrls.has(source.url)) {
        existing.sources.push(source);
        sourceUrls.add(source.url);
      }
    });
  });

  return Array.from(merged.values());
}

export default function FundingTimeline({ rounds, companySlug }: { rounds: FundingRound[]; companySlug: string }) {
  if (!rounds?.length) {
    return (
      <div className="py-8 text-center text-sm text-muted">
        <p>No funding round data yet.</p>
        <Link href={`/submit?kind=correction&entity_id=${companySlug}`} className="mt-1 inline-block text-brand-600 hover:underline">
          Know its funding history? Help fill it in →
        </Link>
      </div>
    );
  }

  const mergedRounds = mergeFundingRounds(rounds);

  return (
    <div className="space-y-3">
      {mergedRounds.map((r) => (
        <div key={r.id} className="border-l-3 border-brand-200 rounded-r-lg bg-white/70 p-3 pl-4">
          {r.announced_date && (
            <span className="mb-1 inline-block rounded bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">
              {r.announced_date.slice(0, 7)}
            </span>
          )}
          <div className="flex items-baseline justify-between">
            <strong>{formatRoundType(r.round_type)}</strong>
            <span className="font-display font-extrabold text-success-600" title={formatFullAmount(r.amount_usd)}>
              {formatCurrencyAbbrev(r.amount_usd)}
            </span>
          </div>
          {r.investors?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {r.investors.map((inv) => (
                <span key={inv.id} className="flex items-center gap-1 text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold">
                    {(inv.name || "?")[0]}
                  </span>
                  <Link href={`/investors/${inv.slug || inv.id}`} className="hover:text-brand-600">{inv.name}</Link>
                  {inv.is_lead ? " (lead)" : ""}
                </span>
              ))}
            </div>
          )}
          {r.sources.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {r.sources.map((source, i) => (
                <a key={`${source.url}-${i}`} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-muted hover:text-brand-600">
                  {source.title || extractDomain(source.url) || "Source"} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
