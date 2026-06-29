import { searchCompanies } from "@/lib/api/companiesService";
import CompanyCard from "@/components/company/CompanyCard";
import FilterPanel from "@/components/browse/FilterPanel";
import ResultsSummary from "@/components/browse/ResultsSummary";
import ActiveFilterChips from "@/components/ui/ActiveFilterChips";
import EmptyState from "@/components/ui/EmptyState";

const PAGE_SIZE = 24;

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const result = await searchCompanies({ ...params, limit: String(PAGE_SIZE), page: String(page) });
  const companies = result.success ? result.data.data : [];
  const hasActiveFilters = Object.entries(params).some(([key, value]) => key !== "page" && Boolean(value));
  const hasNext = companies.length === PAGE_SIZE;

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Browse Companies</p>
        <h1 className="font-display text-display-page font-bold">Asia Startup Directory</h1>
        <p className="mt-1 text-muted">Every key fact links back to its source. Active filters can be shared via URL.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <FilterPanel params={params} />

        <div>
          <ActiveFilterChips basePath="/companies" searchParams={params} />

          <div className="grid gap-3 md:grid-cols-2">
            {companies.map((c: any) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>

          {companies.length === 0 && (
            <EmptyState
              title="No matching companies yet."
              description="Try loosening the filters or using a more general keyword."
            />
          )}

          <div className="mt-4">
            <ResultsSummary
              count={companies.length}
              hasActiveFilters={hasActiveFilters}
              basePath="/companies"
              params={params}
              page={page}
              hasNext={hasNext}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
