import { getAdminTableData } from "@/lib/adminJsonAdapter";
import { EntityTableClient } from "@/components/admin/data-quality/EntityTableClient";

export default async function AdminCompaniesPage() {
  const data = await getAdminTableData("companies", { per_page: 10 });
  return (
    <EntityTableClient
      table="companies"
      title="Companies"
      eyebrow="Data Management"
      description="Manage company profiles — edit, merge duplicates, bulk delete, and monitor completeness scores."
      supportsMerge
      supportsCompleteness
      initialData={data}
    />
  );
}
