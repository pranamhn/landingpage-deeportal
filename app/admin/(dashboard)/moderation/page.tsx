"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BACKEND_ORIGIN } from "@/lib/backendOrigin";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { AdminSection } from "@/components/admin/layout/AdminSection";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminPill } from "@/components/admin/ui/AdminPill";
import { AdminAutoRefresh } from "@/components/admin/ui/AdminAutoRefresh";
import { ModerationFilterBar } from "@/components/admin/moderation/ModerationFilterBar";
import { ModerationActionForm } from "@/components/admin/actions/ModerationActionForm";
import { adminCardClass } from "@/components/admin/ui/adminTheme";
import { cn } from "@/lib/cn";
import Link from "next/link";

interface ModerationItem {
  reference: string;
  status: string;
  kind: string;
  sourceContext: string;
  sourceMeta: string[];
  facts: { key: string; value: string }[];
  factsSummary: string;
  payloadJson: string;
}

export default function AdminModerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0); // 6.8 keyboard nav

  const fetchData = useCallback(
    async (params?: { status?: string; kind?: string; search?: string; page?: number }) => {
      setLoading(true);
      try {
        const sp = new URLSearchParams();
        if (params?.status) sp.set("status", params.status);
        if (params?.kind) sp.set("kind", params.kind);
        if (params?.search) sp.set("search", params.search);
        sp.set("page", String(params?.page ?? 1));
        const resp = await fetch(`${BACKEND_ORIGIN}/api/v1/admin/moderation?${sp.toString()}`, {
          credentials: "include",
        });
        const json = await resp.json();
        if (json.success) {
          const data = json.data;
          const rawItems = Array.isArray(data) ? data : (data?.rows ?? []);
          setItems(
            rawItems.map((row: any) => ({
              reference: row.reference,
              status: row.status,
              kind: row.kind,
              sourceContext: row.source_url,
              sourceMeta: [
                `${row.kind} · entity ${row.entity_id || "baru"}`,
                `created ${row.created_at ? new Date(row.created_at * 1000).toLocaleDateString("id-ID") : "?"}`,
              ],
              facts: Object.entries(row.payload ?? {}).map(([key, value]) => ({
                key,
                value: String(value),
              })),
              factsSummary: "",
              payloadJson: row.payload_json ?? "{}",
            })),
          );
          setTotal(typeof data.total === "number" ? data.total : rawItems.length);
          setPage(typeof data.page === "number" ? data.page : 1);
          setHasNext(!!data.has_next);
        }
      } catch {
        // keep stale
      }
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    fetchData({ page: 1 });
  }, [fetchData]);

  const pendingCount = items.filter(
    (item) => item.status !== "accepted" && item.status !== "rejected",
  ).length;

  // Keyboard shortcuts j/k navigate cards (6.8)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "j") { setActiveIndex((i) => Math.min(i + 1, items.length - 1)); }
      if (e.key === "k") { setActiveIndex((i) => Math.max(i - 1, 0)); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items.length]);

  useEffect(() => {
    document.querySelector(`[data-mod-card="${activeIndex}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  return (
    <>
      <AdminAutoRefresh intervalMs={30_000} />
      <div>
        <AdminPageHeader
          eyebrow="Moderation Queue"
          title="Review Submission Komunitas"
          description="Setiap perubahan tetap melewati review operator sebelum masuk ke data yang dipublikasikan."
          pills={[
            { label: `${total} total`, severity: total > 0 ? "warning" : "good" },
            { label: `${pendingCount} need decision`, severity: pendingCount > 0 ? "warning" : "good" },
          ]}
        />

        <ModerationFilterBar
          onFilter={(p) => fetchData(p)}
          total={total}
        />

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <AdminSection eyebrow="Submission" title="Queue kosong">
            <AdminEmptyState
              title="Queue moderation kosong"
              description="Belum ada submission yang perlu ditinjau."
            />
          </AdminSection>
        ) : (
          <>
            <div className="space-y-5">
              {items.map((item, idx) => {
                const statusSeverity =
                  item.status === "accepted"
                    ? "good"
                    : item.status === "rejected"
                      ? "danger"
                      : "warning";

                return (
                  <div key={item.reference} data-mod-card={idx} className={idx === activeIndex ? "ring-2 ring-brand-400 rounded-2xl" : ""}>
                    <AdminSection
                      key={item.reference}
                      eyebrow={item.kind || "Submission"}
                      title={item.reference}
                      description={item.sourceMeta.join(" · ")}
                      action={<AdminPill severity={statusSeverity}>{item.status}</AdminPill>}
                    >
                      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr_0.9fr]">
                        {/* Source context */}
                        <div className={cn(adminCardClass, "p-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/30")}>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                              Sumber & Konteks
                            </h3>
                            <AdminPill severity="warning">verify source</AdminPill>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            {item.sourceContext || "Tidak ada konteks sumber."}
                          </p>
                          {item.sourceContext?.startsWith("http") ? (
                            <div className="mt-4">
                              <Link
                                href={item.sourceContext}
                                target="_blank"
                                className="inline-flex min-h-10 items-center rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:border-amber-700 dark:hover:bg-amber-900/50"
                              >
                                Buka source URL
                              </Link>
                            </div>
                          ) : null}
                        </div>

                        {/* Extracted facts */}
                        <div className={cn(adminCardClass, "p-4")}>
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-brand-700 dark:text-brand-400">
                              Extracted Facts
                            </h3>
                            <AdminPill severity="info">{item.facts.length} facts</AdminPill>
                          </div>
                          {item.facts.length > 0 ? (
                            <div className="space-y-2">
                              {item.facts.map((fact) => (
                                <div
                                  key={fact.key}
                                  className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800"
                                >
                                  <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                                    {fact.key}
                                  </span>
                                  <span className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{fact.value}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Payload kosong.</p>
                          )}

                          {/* Collapsible raw JSON */}
                          <details className="mt-4">
                            <summary className="cursor-pointer text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                              Raw Payload
                            </summary>
                            <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-gray-100 p-3 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              {(() => {
                                try {
                                  return JSON.stringify(JSON.parse(item.payloadJson), null, 2);
                                } catch {
                                  return item.payloadJson;
                                }
                              })()}
                            </pre>
                          </details>
                        </div>

                        {/* Review action */}
                        <div className={cn(adminCardClass, "p-4 border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30")}>
                          <div className="mb-4">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                                Review action
                              </h3>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                              Simpan keputusan setelah source dan fakta utama sudah diverifikasi.
                            </p>
                          </div>
                          <ModerationActionForm reference={item.reference} />
                        </div>
                      </div>
                    </AdminSection>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {
              (hasNext || page > 1) && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => fetchData({ page: page - 1 })}
                    disabled={page <= 1}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Page {page}
                  </span>
                  <button
                    onClick={() => fetchData({ page: page + 1 })}
                    disabled={!hasNext}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              )
            }
          </>
        )}
        {/* Keyboard shortcut hint bar (6.8) */}
        {items.length > 0 && (
          <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
            <span><kbd className="rounded border border-gray-300 bg-gray-50 px-1 font-sans dark:border-gray-600 dark:bg-gray-800">j</kbd> <kbd className="rounded border border-gray-300 bg-gray-50 px-1 font-sans dark:border-gray-600 dark:bg-gray-800">k</kbd> navigate</span>
            <span><kbd className="rounded border border-gray-300 bg-gray-50 px-1 font-sans">a</kbd> accept</span>
            <span><kbd className="rounded border border-gray-300 bg-gray-50 px-1 font-sans">r</kbd> reject</span>
          </div>
        )}
      </div>
    </>
  );
}
