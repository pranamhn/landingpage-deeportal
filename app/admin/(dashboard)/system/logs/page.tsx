import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { EngineLogViewer } from "@/components/admin/engine/EngineLogViewer";

export default function AdminLogsPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="System"
        title="System Logs"
        description="Real-time process logs for ingestion, enrichment, and background services."
      />
      <EngineLogViewer />
    </div>
  );
}
