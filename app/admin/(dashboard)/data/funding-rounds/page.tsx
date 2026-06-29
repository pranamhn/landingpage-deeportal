import { getAdminTableData } from "@/lib/adminJsonAdapter";
import { EntityTableClient } from "@/components/admin/data-quality/EntityTableClient";

export default async function AdminFundingRoundsPage() {
  const data = await getAdminTableData("funding_rounds", { per_page: 10, sort_by: "announced_date", order: "desc" });
  return (
    <EntityTableClient
      table="funding_rounds"
      title="Funding Rounds"
      eyebrow="Data Management"
      description="Browse all funding rounds — sort by amount, date, or company."
      initialData={data}
    />
  );
}
