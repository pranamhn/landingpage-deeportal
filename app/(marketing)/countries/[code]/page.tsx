import { searchCompanies } from "@/lib/api/companiesService";
import CompanyCard from "@/components/company/CompanyCard";
import ResultsSummary from "@/components/browse/ResultsSummary";
import EmptyState from "@/components/ui/EmptyState";
import type { Metadata } from "next";

const PAGE_SIZE = 24;

function countryName(code: string, fallback?: string | null): string {
  if (fallback) return fallback;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const name = countryName(code);
  return {
    title: `${name} Startups — Deeportal`,
    description: `Companies, funding rounds, and investors based in ${name}.`,
  };
}

export default async function CountryHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { code } = await params;
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const result = await searchCompanies({
    ...sp,
    country_code: code.toUpperCase(),
    limit: String(PAGE_SIZE),
    page: String(page),
  });
  const companies = result.success ? result.data.data : [];
  const name = countryName(code, companies[0]?.country);
  const hasNext = companies.length === PAGE_SIZE;
  const baseParams = { ...sp };
  delete baseParams.page;

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Country Hub</p>
        <h1 className="font-display text-display-page font-bold">{name} Startups</h1>
        <p className="mt-1 text-muted">Companies, funding rounds, and investors based in {name}.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {companies.map((c: any) => (
          <CompanyCard key={c.id} company={c} />
        ))}
      </div>

      {companies.length === 0 && (
        <EmptyState
          title={`No companies tracked in ${name} yet.`}
          description="Check back soon as we keep expanding coverage."
        />
      )}

      <div className="mt-4">
        <ResultsSummary
          count={companies.length}
          hasActiveFilters={false}
          basePath={`/countries/${code}`}
          params={baseParams}
          page={page}
          hasNext={hasNext}
        />
      </div>
    </div>
  );
}
