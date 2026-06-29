import { getAdminTableData } from "@/lib/adminJsonAdapter";
import { EntityTableClient } from "@/components/admin/data-quality/EntityTableClient";

export default async function AdminFoundersPage() {
  const data = await getAdminTableData("founders", { per_page: 10 });
  return (
    <EntityTableClient
      table="founders"
      title="Founders"
      eyebrow="Data Management"
      description="Manage founder profiles — edit details, link to companies, and monitor completeness."
      supportsMerge
      supportsCompleteness
      initialData={data}
    />
  );
}
