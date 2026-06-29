import { isNotStated } from "@/lib/formatters/format";
import type { CompanyProject } from "@/types/company";

export default function LatestProjects({ projects }: { projects: CompanyProject[] }) {
  if (!projects?.length) {
    return <p className="py-8 text-center text-sm text-muted">No specific product launches recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {projects.map((p) => (
        <div key={p.id} className="border-l-3 border-success-200 rounded-r-lg bg-white/70 p-3 pl-4">
          <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:text-brand-600">
            {p.name} ↗
          </a>
          {p.description && !isNotStated(p.description) && (
            <p className="mt-0.5 text-xs text-muted">{p.description}</p>
          )}
          {!isNotStated(p.launched_date) && (
            <p className="mt-0.5 text-xs text-muted">
              Launched: <span className="font-medium text-gray-700">{p.launched_date}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
