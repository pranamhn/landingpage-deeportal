"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { AdminPanel } from "@/components/admin/ui/AdminPanel";
import { AdminButton } from "@/components/admin/ui/AdminButton";

interface Dataset {
  title: string;
  url: string;
  organization: string;
  description: string;
  formats: string[];
}

interface Resource {
  name: string;
  url: string;
  format: string;
}

export default function DataGoIdIngestionPage() {
  // Search
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Detail
  const [detailUrl, setDetailUrl] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Preview
  const [previewUrl, setPreviewUrl] = useState("");
  const [preview, setPreview] = useState<{ cols: string[]; rows: Record<string, string>[]; filename: string } | null>(null);

  const search = async (p: number) => {
    if (!keyword.trim()) return;
    setLoading(true);
    setStatus("Searching with AI...");
    setDatasets([]);
    setTotal(0);
    setPage(p);
    try {
      const resp = await fetch("/api/v1/admin/data-go-id/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: keyword.trim(), page: p }),
      });
      const data = await resp.json();
      if (data.success) {
        setDatasets(data.data.datasets);
        setTotal(data.data.total);
        setStatus(`${data.data.datasets.length} results · page ${data.data.page}`);
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch {
      setStatus("Connection failed.");
    }
    setLoading(false);
  };

  const fetchDetail = async (url: string) => {
    setDetailUrl(url);
    setResources([]);
    setLoadingDetail(true);
    try {
      const resp = await fetch("/api/v1/admin/data-go-id/dataset-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await resp.json();
      if (data.success) setResources(data.data.resources);
    } catch { /* ignore */ }
    setLoadingDetail(false);
  };

  const fetchPreview = async (url: string) => {
    setPreviewUrl(url);
    setPreview(null);
    setStatus("Loading preview...");
    try {
      const resp = await fetch("/api/v1/admin/data-go-id/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await resp.json();
      if (data.success) {
        setPreview({ cols: data.data.columns, rows: data.data.rows, filename: data.data.filename });
        setStatus("");
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch { setStatus("Connection failed."); }
  };

  const ingestUrl = async (url: string) => {
    setStatus("Importing...");
    try {
      const resp = await fetch("/api/v1/admin/data-go-id/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await resp.json();
      setStatus(data.success ? `✅ ${data.data.rows_inserted} rows → "${data.data.table}"` : `Error: ${data.message}`);
    } catch { setStatus("Connection failed."); }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Data Mining"
        title="data.go.id"
        description="Search and import Indonesia open data — powered by DeepSeek AI for HTML parsing."
      />

      {/* Search */}
      <AdminPanel>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search(1)}
              placeholder="Search datasets... (e.g. pendidikan, ekonomi, kesehatan)"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <AdminButton variant="primary" disabled={loading || !keyword.trim()} onClick={() => search(1)}>
              {loading ? "..." : "Search"}
            </AdminButton>
          </div>

          {status && (
            <p className={`text-sm ${status.startsWith("✅") ? "text-emerald-600" : status.startsWith("Error") ? "text-rose-600" : "text-muted"}`}>
              {status}
            </p>
          )}

          {total > 0 && (
            <div className="flex items-center gap-2">
              <AdminButton disabled={page <= 1 || loading} onClick={() => search(page - 1)}>← Prev</AdminButton>
              <span className="text-xs text-muted">Page {page} of ~{Math.ceil(total / 20)}</span>
              <AdminButton disabled={page >= Math.ceil(total / 20) || loading} onClick={() => search(page + 1)}>Next →</AdminButton>
            </div>
          )}
        </div>
      </AdminPanel>

      {/* Results */}
      <div className="mt-6 space-y-3">
        {datasets.map((ds) => (
          <div key={ds.url} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="min-w-0">
              <button onClick={() => fetchDetail(ds.url)} className="text-left text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
                {ds.title}
              </button>
              {ds.organization && <p className="mt-0.5 text-xs text-gray-500">{ds.organization}</p>}
              {ds.description && <p className="mt-1 text-xs text-muted line-clamp-2">{ds.description}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {ds.formats.map((f) => (
                  <span key={f} className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{f}</span>
                ))}
              </div>
            </div>

            {/* Resources */}
            {detailUrl === ds.url && (
              <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                {loadingDetail ? (
                  <p className="text-xs text-muted">Loading...</p>
                ) : resources.length > 0 ? (
                  <div className="space-y-2">
                    {resources.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                        <span className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] dark:bg-gray-700">{r.format}</span>
                        <span className="min-w-0 flex-1 truncate text-xs text-gray-700 dark:text-gray-300">{r.name}</span>
                        <AdminButton variant="primary" onClick={() => fetchPreview(r.url)} disabled={loading}>Preview</AdminButton>
                        <AdminButton variant="primary" onClick={() => ingestUrl(r.url)} disabled={loading}>Import</AdminButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted">No downloadable resources found.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview table */}
      {preview && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Preview — {preview.filename} ({preview.cols.length} cols, {preview.rows.length} rows)
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  {preview.cols.map((col) => (
                    <th key={col} className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 15).map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                    {preview.cols.map((col) => (
                      <td key={col} className="max-w-[300px] truncate px-4 py-2 text-gray-700 dark:text-gray-300">{String(row[col] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
