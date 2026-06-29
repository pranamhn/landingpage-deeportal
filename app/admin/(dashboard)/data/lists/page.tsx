import { getAdminTableData } from "@/lib/adminJsonAdapter";
import { EntityTableClient } from "@/components/admin/data-quality/EntityTableClient";

export default async function AdminListsPage() {
  const data = await getAdminTableData("lists", { per_page: 10 });
  return (
    <EntityTableClient
      table="lists"
      title="Lists"
      eyebrow="Data Management"
      description="Manage curated lists — view member companies and edit list details."
      initialData={data}
    />
  );
}
