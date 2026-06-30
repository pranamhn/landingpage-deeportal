import { getCommunityHubs } from "@/lib/api/companiesService";
import Badge from "@/components/ui/Badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Community — Deeportal", description: "Incubators, accelerators, and ecosystem programs supporting Asian startups." };

export default async function CommunityHubPage() {
  const result = await getCommunityHubs(20);
  const hubs = result.success ? result.data : [];

  return (
    <div>
      <section className="mb-8">
        <h1 className="font-display text-display-page font-bold">Community</h1>
        <p className="mt-2 text-muted">
          Incubators, accelerators, and ecosystem programs that support startups in Asia — not startups
          themselves, so they're kept separate from the company directory.
        </p>
      </section>

      {hubs.length === 0 ? (
        <p className="text-center text-muted">No community hub data yet.</p>
      ) : (
        <div className="space-y-4">
          {hubs.map((hub) => {
            const sectors = hub.sector ? hub.sector.split(",").map((s) => s.trim()).filter(Boolean) : [];
            return (
              <div key={hub.id} className="card max-w-2xl">
                <h2 className="font-display text-heading-card font-bold">{hub.name}</h2>
                {hub.description && <p className="mt-2 text-sm leading-relaxed text-gray-600">{hub.description}</p>}
                {(hub.location || hub.founded_year || sectors.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {hub.location && <Badge variant="neutral">{hub.location}</Badge>}
                    {hub.founded_year && <Badge variant="neutral">Founded {hub.founded_year}</Badge>}
                    {sectors.map((s) => <Badge key={s} variant="sector">{s}</Badge>)}
                  </div>
                )}
                {hub.website && (
                  <a href={hub.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block truncate text-xs text-brand-600 hover:underline">
                    {hub.website.replace(/^https?:\/\//, "")} ↗
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
