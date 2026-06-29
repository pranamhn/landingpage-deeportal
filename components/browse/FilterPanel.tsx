import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { getCompanyFacets } from "@/lib/api/companiesService";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "operating", label: "Operating" },
  { value: "acquired", label: "Acquired" },
  { value: "shut_down", label: "Shut Down" },
];

const POPULAR_SECTOR_COUNT = 8;

export default async function FilterPanel({ params }: { params: Record<string, string> }) {
  const facetsResult = await getCompanyFacets();
  const sectors = facetsResult.success ? facetsResult.data.sectors : [];
  // Backend sudah urut by count DESC — ambil N teratas sebagai "Populer",
  // sisanya disortir alfabetis di "Lainnya" supaya tetap bisa di-scan.
  const popularSectors = sectors.slice(0, POPULAR_SECTOR_COUNT);
  const otherSectors = sectors.slice(POPULAR_SECTOR_COUNT).slice().sort((a, b) => a.sector.localeCompare(b.sector));

  return (
    <form className="card h-fit space-y-3 md:sticky md:top-20 md:self-start" method="GET">
      <p className="eyebrow">Filter</p>
      <Input name="q" defaultValue={params.q || ""} placeholder="Search companies..." />
      <Select name="sector" defaultValue={params.sector || ""}>
        <option value="">All sectors</option>
        {popularSectors.length > 0 && (
          <optgroup label="Popular">
            {popularSectors.map((s) => (
              <option key={s.sector} value={s.sector}>{s.sector} ({s.count})</option>
            ))}
          </optgroup>
        )}
        {otherSectors.length > 0 && (
          <optgroup label="Other">
            {otherSectors.map((s) => (
              <option key={s.sector} value={s.sector}>{s.sector}</option>
            ))}
          </optgroup>
        )}
      </Select>
      <Input name="location" defaultValue={params.location || ""} placeholder="Location..." />
      <Select name="status" defaultValue={params.status || ""}>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>
      <Button type="submit" fullWidth>Search</Button>
    </form>
  );
}
