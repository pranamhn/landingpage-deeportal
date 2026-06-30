import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormSearchableSelect from "@/components/form/FormSearchableSelect";
import { getCompanyFacets } from "@/lib/api/companiesService";
import { unstable_cache } from "next/cache";

const getCachedFacets = unstable_cache(
  async () => {
    const result = await getCompanyFacets();
    return result;
  },
  ["company-facets"],
  { revalidate: 3600 },
);

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "operating", label: "Operating" },
  { value: "acquired", label: "Acquired" },
  { value: "shut_down", label: "Shut Down" },
];

const POPULAR_SECTOR_COUNT = 8;

export default async function FilterPanel({ params }: { params: Record<string, string> }) {
  const facetsResult = await getCachedFacets();
  const sectors = facetsResult.success ? facetsResult.data.sectors : [];
  const popularSectors = sectors.slice(0, POPULAR_SECTOR_COUNT);
  const otherSectors = sectors.slice(POPULAR_SECTOR_COUNT).slice().sort((a, b) => a.sector.localeCompare(b.sector));

  const sectorOptions = [
    ...popularSectors.map((s) => ({ id: s.sector, label: `${s.sector} (${s.count})` })),
    ...otherSectors.map((s) => ({ id: s.sector, label: s.sector })),
  ];

  const statusOptions = STATUS_OPTIONS.map((o) => ({ id: o.value, label: o.label }));

  return (
    <form className="card h-fit space-y-3 md:sticky md:top-20 md:self-start" method="GET">
      <p className="eyebrow">Filter</p>
      <Input name="q" defaultValue={params.q || ""} placeholder="Search companies..." />
      <FormSearchableSelect name="sector" defaultValue={params.sector || ""} options={sectorOptions} placeholder="All sectors" />
      <Input name="location" defaultValue={params.location || ""} placeholder="Location..." />
      <FormSearchableSelect name="status" defaultValue={params.status || ""} options={statusOptions} placeholder="All statuses" />
      <Button type="submit" fullWidth>Search</Button>
    </form>
  );
}
