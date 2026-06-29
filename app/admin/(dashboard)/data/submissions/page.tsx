import { getAdminTableData } from "@/lib/adminJsonAdapter";
import { EntityTableClient } from "@/components/admin/data-quality/EntityTableClient";

export default async function AdminSubmissionsPage() {
  const data = await getAdminTableData("submissions", { per_page: 10 });
  return (
    <EntityTableClient
      table="submissions"
      title="Submissions"
      eyebrow="Data Management"
      description="Review user-submitted data — track status and link submissions to entities."
      initialData={data}
    />
  );
}
