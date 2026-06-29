import type { ColumnDef } from "@/components/admin/data-quality/AdminDataTable";
import { AdminPill } from "@/components/admin/ui/AdminPill";

/** rules/plan_dashboard.md §10 Phase 3 — kolom tabel diekstrak dari
 * DataQualityTabsClient.tsx supaya dipakai bersama oleh halaman entity baru
 * (/admin/data/companies, /founders, dst) tanpa duplikasi. */

// rules/plan_database.md Step 1 — 100% kalau semua kolom profil (bukan
// kolom administratif) terisi, dihitung di backend (_completeness_score()
// di orchestrator/webapp.py), bukan di sini, supaya satu sumber kebenaran.
function completenessColumn(): ColumnDef {
  return {
    key: "_completeness",
    label: "Score",
    sortable: false,
    width: "90px",
    render: (v) => {
      const score = Number(v ?? 0);
      const severity = score >= 80 ? "good" : score >= 40 ? "warning" : "danger";
      return <AdminPill severity={severity}>{score}%</AdminPill>;
    },
  };
}

export const formatDate = (v: unknown) => {
  if (!v) return "—";
  const num = Number(v);
  if (!Number.isNaN(num) && num > 0) return new Date(num * 1000).toLocaleDateString("id-ID");
  // Try parsing as date string
  const d = new Date(v as string);
  return !Number.isNaN(d.getTime()) ? d.toLocaleDateString("id-ID") : String(v).slice(0, 10) || "—";
};

// Created Date selalu kolom PERTAMA (sebelum Name) — lihat referensi screenshot
// di rules/plan_database.md. companies/investors pakai first_seen_at (investors
// baru punya kolom ini — row lama akan tampil "—", row baru ke depan terisi).
// founders pakai recorded_at (kapan relasi company_people-nya dicatat, bukan
// people.id-nya sendiri yang tidak punya creation timestamp).
function createdDateColumn(field: string): ColumnDef {
  return { key: field, label: "Created Date", sortable: true, width: "120px", render: formatDate };
}

export const COMPANY_COLUMNS: ColumnDef[] = [
  createdDateColumn("first_seen_at"),
  { key: "name", label: "Name", sortable: true, editable: true, width: "180px" },
  completenessColumn(),
  { key: "sector", label: "Sector", sortable: true, editable: true },
  { key: "location", label: "Location", sortable: true, editable: true },
  { key: "founded_year", label: "Founded", sortable: true, editable: true, width: "80px" },
  { key: "status", label: "Status", sortable: true, editable: true },
  {
    key: "stage", label: "Stage", sortable: true, width: "120px", render: (v) => {
      if (!v) return "—";
      const s = String(v);
      const map: Record<string, { label: string; cls: string }> = {
        bootstrap: { label: "Bootstrap", cls: "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300" },
        unicorn: { label: "Unicorn", cls: "border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
        decacorn: { label: "Decacorn", cls: "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
        public: { label: "Public", cls: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
        "non-startup": { label: "Non Startup", cls: "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
        shutdown: { label: "Shutdown", cls: "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400" },
      };
      const m = map[s.toLowerCase()];
      if (m) return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${m.cls}`}>{m.label}</span>;
      return <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">{s}</span>;
    }
  },
  { key: "website", label: "Website", editable: true, render: (v) => (v ? String(v).slice(0, 40) + "…" : "—") },
  { key: "last_updated_at", label: "Updated", sortable: true, render: formatDate },
  {
    key: "slug", label: "Profile", width: "70px", sortable: false, render: (_v: unknown, row: Record<string, unknown>) => {
      const slug = row.slug;
      if (!slug) return "—";
      return (
        <a href={`/companies/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline text-xs" onClick={(e) => e.stopPropagation()}>
          Open <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      );
    }
  },
];

export const FOUNDER_COLUMNS: ColumnDef[] = [
  createdDateColumn("recorded_at"),
  { key: "name", label: "Name", sortable: true, editable: true, width: "160px" },
  completenessColumn(),
  { key: "role", label: "Role", sortable: true, editable: true },
  { key: "company_name", label: "Company", sortable: true },
  { key: "started_date", label: "Started", editable: true },
  { key: "ended_date", label: "Ended", editable: true },
];

export const INVESTOR_COLUMNS: ColumnDef[] = [
  createdDateColumn("first_seen_at"),
  { key: "name", label: "Name", sortable: true, editable: true, width: "160px" },
  completenessColumn(),
  { key: "type", label: "Type", sortable: true, editable: true },
  { key: "location", label: "Location", sortable: true, editable: true },
  { key: "stage_focus", label: "Stage Focus", editable: true },
  { key: "sector_focus", label: "Sector Focus", editable: true },
  { key: "total_investments_usd", label: "Investments (USD)", sortable: true },
  { key: "website", label: "Website", editable: true, render: (v) => (v ? String(v).slice(0, 35) + "…" : "—") },
];

export const LIST_COLUMNS: ColumnDef[] = [
  createdDateColumn("created_at"),
  { key: "name", label: "Name", sortable: true, editable: true, width: "180px" },
  { key: "description", label: "Description", editable: true },
  { key: "company_count", label: "Companies", sortable: true, width: "100px" },
];

export const SUBMISSION_COLUMNS: ColumnDef[] = [
  createdDateColumn("created_at"),
  { key: "reference", label: "Reference", sortable: true, width: "140px" },
  { key: "kind", label: "Kind", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "submitter_email", label: "Submitter", width: "180px" },
  { key: "reviewed_at", label: "Reviewed", render: formatDate },
];

export const FUNDING_ROUND_COLUMNS: ColumnDef[] = [
  createdDateColumn("announced_date"),
  { key: "company_name", label: "Company", sortable: true, width: "160px" },
  { key: "round_type", label: "Round Type", sortable: true },
  { key: "amount_usd", label: "Amount (USD)", sortable: true, render: (v: unknown) => v ? `$${Number(v).toLocaleString()}` : "—" },
  { key: "lead_investor", label: "Lead Investor" },
  {
    key: "funding_id", label: "Investors", render: (_v: unknown, row: Record<string, unknown>) => {
      const investors = row.investors;
      return investors ? String(investors) : "—";
    }
  },
];

export const NEWS_ARTICLE_COLUMNS: ColumnDef[] = [
  createdDateColumn("published_at"),
  { key: "title", label: "Title", sortable: true, width: "240px" },
  { key: "source_name", label: "Source", sortable: true, width: "120px" },
  { key: "company_count", label: "Companies", width: "100px", render: (v: unknown) => String(v ?? "—") },
  { key: "event_count", label: "Events", width: "80px", render: (v: unknown) => String(v ?? "—") },
];
