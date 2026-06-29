import { getAdminTableData } from "@/lib/adminJsonAdapter";
import { EntityTableClient } from "@/components/admin/data-quality/EntityTableClient";

export default async function AdminInvestorsPage() {
  const data = await getAdminTableData("investors", { per_page: 10 });
  return (
    <EntityTableClient
      table="investors"
      title="Investors"
      eyebrow="Data Management"
      description="Manage investor profiles — edit details, track investments, merge duplicates."
      supportsMerge
      supportsCompleteness
      initialData={data}
    />
  );
}
