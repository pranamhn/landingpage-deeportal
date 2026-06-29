import Link from "next/link";
import type { Metadata } from "next";
import { BACKEND_ORIGIN } from "@/lib/backendOrigin";

export const metadata: Metadata = { title: "News Feed — DeePortal.ai", description: "Latest news and updates from Asia's startup ecosystem." };

async function getNews(page = 1) {
  try {
    const resp = await fetch(`${BACKEND_ORIGIN}/api/v1/news?page=${page}&limit=20`, { next: { revalidate: 300 } });
    const json = await resp.json();
    return json.success ? json.data : { rows: [], total: 0, page: 1, has_next: false };
  } catch {
    return { rows: [], total: 0, page: 1, has_next: false };
  }
}

function fmtDate(raw: string | null | number): string {
  if (raw == null) return "tidak disebutkan";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  try {
    // Unix timestamp (seconds)
    if (typeof raw === "number" || !isNaN(Number(raw))) {
      const ts = typeof raw === "number" ? raw : Number(raw);
      const d = new Date(ts * 1000);
      if (!isNaN(d.getTime())) return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch { }
  return String(raw);
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const data = await getNews(page);

  return (
    <div>
      <section className="mb-6">
        <p className="eyebrow">Intelligence</p>
        <h1 className="font-display text-display-page font-bold">News Feed</h1>
        <p className="mt-2 text-muted">{data.total.toLocaleString()} articles from across the ecosystem.</p>
      </section>

      <div className="space-y-2">
        {data.rows.map((n: any) => (
          <div key={n.id} className="card flex items-start gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="min-w-0 flex-1">
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-brand-600">{n.title}</a>
              {n.summary && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{n.summary}</p>}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                <Link href={`/companies/${n.company_slug}`} className="font-medium text-brand-600 hover:underline">{n.company_name}</Link>
                <span>{fmtDate(n.published_at)}</span>
                {n.source && <span className="text-gray-400">{n.source}</span>}
              </div>
            </div>
            <a href={n.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 shrink-0 text-xs text-brand-500 hover:text-brand-700">↗</a>
          </div>
        ))}
      </div>

      {(data.has_next || page > 1) && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/news?page=${page - 1}`} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              ← Prev
            </Link>
          )}
          <span className="text-sm text-muted">Page {page}</span>
          {data.has_next && (
            <Link href={`/news?page=${page + 1}`} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
