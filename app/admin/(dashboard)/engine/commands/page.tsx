import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { AdminEngineControlRoom } from "@/components/admin/engine/AdminEngineControlRoom";

export default function AdminCommandsPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Engine Control"
        title="Command Center"
        description="Run maintenance commands: data quality checks, backfills, database operations, and tests."
      />
      <AdminEngineControlRoom />
    </div>
  );
}
