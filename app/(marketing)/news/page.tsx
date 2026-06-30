import Link from "next/link";
import type { Metadata } from "next";
import { BACKEND_ORIGIN } from "@/lib/backendOrigin";

export const metadata: Metadata = { title: "News Feed — DeePortal.ai", description: "Latest news and updates from Asia's startup ecosystem." };

interface NewsRow {
  id: string;
  title?: string | null;
  summary?: string | null;
  url: string;
  source?: string | null;
  published_at?: string | null;
  company_name: string;
  company_slug: string;
}

async function getNews(page = 1) {
  try {
    const resp = await fetch(`${BACKEND_ORIGIN}/api/v1/news?page=${page}&limit=21`, { next: { revalidate: 300 } });
    const json = await resp.json();
    return json.success ? json.data : { rows: [], total: 0, page: 1, has_next: false };
  } catch {
    return { rows: [], total: 0, page: 1, has_next: false };
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function fmtDate(raw: string | null | number): string {
  if (raw == null) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  try {
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

function fmtTimeAgo(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return fmtDate(raw);
  } catch {
    return "";
  }
}

const SOURCE_COLORS: Record<string, string> = {
  "techcrunch.com": "from-green-500 to-emerald-700",
  "techinasia.com": "from-blue-500 to-indigo-700",
  "dealstreetasia.com": "from-orange-500 to-red-600",
  "kr-asia.com": "from-rose-500 to-pink-700",
  "e27.co": "from-cyan-500 to-teal-700",
  "bloomberg.com": "from-slate-700 to-slate-900",
  "reuters.com": "from-amber-500 to-orange-700",
  "forbes.com": "from-gray-700 to-gray-900",
  "cnbc.com": "from-blue-700 to-blue-900",
  "nikkei.com": "from-red-600 to-rose-800",
};

function sourceGradient(domain: string): string {
  for (const [key, gradient] of Object.entries(SOURCE_COLORS)) {
    if (domain.includes(key)) return gradient;
  }
  // Deterministic color based on domain hash
  const gradients = [
    "from-brand-500 to-brand-700",
    "from-accent-500 to-accent-700",
    "from-violet-500 to-purple-700",
    "from-sky-500 to-blue-700",
    "from-emerald-500 to-green-700",
    "from-amber-500 to-orange-700",
    "from-rose-500 to-pink-700",
    "from-teal-500 to-cyan-700",
  ];
  let hash = 0;
  for (let i = 0; i < domain.length; i++) hash = ((hash << 5) - hash) + domain.charCodeAt(i);
  return gradients[Math.abs(hash) % gradients.length];
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const data = await getNews(page);
  const rows: NewsRow[] = data.rows || [];

  return (
    <div>
      <section className="mb-8">
        <p className="eyebrow">Intelligence</p>
        <h1 className="font-display text-display-page font-bold">News Feed</h1>
        <p className="mt-2 text-muted">{(data.total || 0).toLocaleString()} articles from across the ecosystem.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((n) => {
          const domain = extractDomain(n.url);
          const source = n.source || domain || "";
          const imageGradient = sourceGradient(domain);
          const timeAgo = fmtTimeAgo(n.published_at);

          return (
            <div
              key={n.id}
              className="group card flex flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Source header bar */}
              <a href={n.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 bg-gradient-to-r ${imageGradient} px-4 py-2.5`}>
                <img
                  src={faviconUrl(domain)}
                  alt=""
                  className="h-5 w-5 rounded-sm bg-white/20"
                  width={20}
                  height={20}
                  loading="lazy"
                />
                <span className="truncate text-xs font-semibold text-white/90">{source}</span>
                {timeAgo && (
                  <span className="ml-auto shrink-0 text-[11px] text-white/70">{timeAgo}</span>
                )}
              </a>

              {/* Title + summary */}
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-sm font-semibold leading-snug text-gray-900 line-clamp-3 group-hover:text-brand-600 transition-colors">
                  {n.title || "Untitled"}
                </h3>
                {n.summary && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.summary}</p>
                )}
              </a>

              {/* Company footer */}
              {n.company_name && (
                <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-2.5">
                  <Link
                    href={`/companies/${n.company_slug}`}
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    {n.company_name}
                  </Link>
                  <a href={n.url} target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0 text-xs text-gray-300 hover:text-brand-400 transition-colors">↗</a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {rows.length === 0 && (
        <div className="card py-16 text-center">
          <p className="text-muted">No news articles yet.</p>
        </div>
      )}

      {(data.has_next || page > 1) && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link href={`/news?page=${page - 1}`} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              ← Previous
            </Link>
          ) : (
            <span className="rounded-xl border border-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-300">← Previous</span>
          )}
          <span className="text-sm font-medium text-muted">Page {page}</span>
          {data.has_next ? (
            <Link href={`/news?page=${page + 1}`} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Next →
            </Link>
          ) : (
            <span className="rounded-xl border border-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-300">Next →</span>
          )}
        </div>
      )}
    </div>
  );
}
