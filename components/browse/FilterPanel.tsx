"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormSearchableSelect from "@/components/form/FormSearchableSelect";
import type { LocalOption } from "@/components/form/SearchableSelect";

interface FilterPanelProps {
  params: Record<string, string>;
  sectorOptions: LocalOption[];
  statusOptions: LocalOption[];
}

export default function FilterPanel({ params, sectorOptions, statusOptions }: FilterPanelProps) {
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
