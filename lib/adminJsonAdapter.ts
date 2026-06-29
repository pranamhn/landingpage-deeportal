import type {
  AdminDataQualityData,
  AdminIngestionData,
  AdminIngestionFullData,
  AdminIngestionDetails,
  AdminMetric,
  AdminModerationDetail,
  AdminOverviewData,
  AdminSection,
  AdminSeverity,
  AdminStatsData,
  AdminSystemData,
  AdminTableName,
  AdminTableData,
} from "@/types/admin";
import { getBackendAdminJson, postBackendAdminJson } from "./adminBackend";

function freshness(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Belum diverifikasi";
  const timestamp = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(timestamp)) return "Belum diverifikasi";
  const days = Math.max(0, Math.floor((Date.now() / 1000 - timestamp) / 86400));
  if (days === 0) return "Diverifikasi hari ini";
  if (days === 1) return "Diverifikasi kemarin";
  return `Diverifikasi ${days} hari lalu`;
}

function unwrap<T>(result: { ok: boolean; data: T | null }, fallback: T): T {
  return result.ok && result.data !== null ? result.data : fallback;
}

// --- Overview ---

interface PortfolioVenture {
  id: string;
  id_short: string;
  idea: string;
  type: string;
  status: string;
  budget_spent: number;
  revenue: number;
  created: number;
  sentiment?: Record<string, unknown>;
  extra?: Record<string, unknown>;
}

interface PortfolioRaw {
  active: number;
  killed: number;
  scaling: number;
  live: number;
  building: number;
  spawned: number;
  list: PortfolioVenture[];
  revenue_rp: number;
  spend_rp: number;
  net_rp: number;
  stale_kpi: number;
}

interface OverviewRaw {
  cost: { total: number; total_calls: number };
  portfolio: PortfolioRaw;
  auto: { running: boolean; pid?: number };
  activity: { action: string; detail: string; time: string }[];
  directory_quality: {
    company: Record<string, number>;
    counts: Record<string, number>;
    missing: { id: string; name: string; sector?: string; location?: string; founded_year?: string; website?: string }[];
    submissions: { reference: string; status: string; kind: string }[];
  };
}

function formatRupiah(value: number | undefined): string {
  return `Rp ${(value ?? 0).toLocaleString("id-ID")}`;
}

const VENTURE_STATUS_SEVERITY: Record<string, AdminSeverity> = {
  scaling: "good",
  live: "good",
  building: "info",
  spawned: "warning",
  killed: "muted",
};

export async function getOverviewFromJson(): Promise<AdminOverviewData> {
  const result = await getBackendAdminJson<OverviewRaw>("/api/v1/admin/overview");
  const raw = unwrap(result, null as unknown as OverviewRaw);
  if (!raw) return { metrics: [] };

  const dq = raw.directory_quality;
  const pendingSubmissions = dq.submissions?.length ?? 0;
  const missingProfiles = dq.missing?.length ?? 0;
  const staleProfiles = dq.company?.stale ?? 0;
  const autoRunning = Boolean(raw.auto?.running);
  const metrics: AdminMetric[] = [
    {
      label: "Pending review",
      value: String(pendingSubmissions),
      description: pendingSubmissions > 0 ? "Submission menunggu tindakan operator" : "Tidak ada backlog moderation",
      severity: pendingSubmissions > 0 ? "warning" : "good",
    },
    {
      label: "Profiles need fixes",
      value: String(missingProfiles),
      description: "Queue missing fields yang perlu dirapikan lebih dulu",
      severity: missingProfiles > 0 ? "danger" : "good",
    },
    {
      label: "Stale >90d",
      value: String(staleProfiles),
      description: "Profil lama yang berisiko menurunkan trust data",
      severity: staleProfiles > 0 ? "warning" : "good",
    },
  ];

  const supportMetrics: AdminMetric[] = [
    { label: "Companies", value: String(dq.company?.total ?? 0), description: "Total profil direktori", severity: "info" },
    {
      label: "Funding rounds",
      value: String(dq.counts?.funding ?? 0),
      description: `${dq.counts?.funding_amount ?? 0} dengan nominal`,
      severity: "muted",
    },
    {
      label: "News events",
      value: String(dq.counts?.news ?? 0),
      description: `${raw.cost?.total_calls ?? 0} panggilan agent tercatat`,
      severity: "muted",
    },
  ];

  const quality: AdminSection = {
    eyebrow: "Directory quality",
    title: "Snapshot kualitas data",
    description: "Prioritaskan field inti kosong dan profil yang sudah stale.",
    items: (dq.missing ?? []).map((row) => {
      const missingFields = [
        !row.sector && "sector",
        !row.location && "location",
        !row.founded_year && "founded_year",
        !row.website && "website",
      ].filter(Boolean) as string[];
      return { title: row.name, description: `missing: ${missingFields.join(", ")}`, severity: "danger" as const };
    }),
  };

  const moderation: AdminSection = {
    eyebrow: "Moderation",
    title: "Queue terbaru",
    description: "Submission baru yang menunggu tindakan operator.",
    items: (dq.submissions ?? []).map((row) => ({ title: row.reference, description: row.kind, severity: "warning" as const })),
  };

  const activity: AdminSection = {
    eyebrow: "Activity",
    title: "Aktivitas terbaru",
    description: "Jejak action terakhir untuk monitoring cepat.",
    items: (raw.activity ?? []).slice(0, 10).map((item) => ({ title: item.action, description: item.detail })),
  };

  const pf = raw.portfolio;
  const portfolio: AdminSection = {
    eyebrow: "Portfolio",
    title: "Venture holdco",
    description: "Status, budget, dan revenue tiap venture yang sedang/sempat berjalan.",
    items: (pf?.list ?? []).map((v) => ({
      title: v.idea || v.id_short,
      description: `type: ${v.type || "?"} · status: ${v.status || "?"} · revenue: ${formatRupiah(v.revenue)} · spent: ${formatRupiah(v.budget_spent)}`,
      severity: VENTURE_STATUS_SEVERITY[v.status] ?? "muted",
      meta: [`id: ${v.id_short}`],
    })),
  };

  return {
    metrics,
    quality,
    moderation,
    activity,
    portfolio,
    supportMetrics,
    summary: {
      autoRunning,
      pendingSubmissions,
      missingProfiles,
      staleProfiles,
      totalCalls: raw.cost?.total_calls ?? 0,
      totalCostUsd: raw.cost?.total ?? 0,
    },
  };
}

// --- Admin Stats (Phase 2: Insight Dashboard) ---

export async function getAdminStats(): Promise<AdminStatsData> {
  const result = await getBackendAdminJson<AdminStatsData>("/api/v1/admin/stats");
  return unwrap(result, {
    counts: { companies: 0, founders: 0, investors: 0, lists: 0, submissions: 0, funding_rounds: 0, news_events: 0 },
    sectors: [],
    locations: [],
    statuses: [],
    funding_timeline: [],
    news_timeline: [],
    ingestion: { articles_total: 0, articles_processed: 0, articles_failed: 0, events_found: 0, success_rate: 0 },
    sources: [],
    cost: { total: 0, total_calls: 0 },
    portfolio: { active: 0, killed: 0, scaling: 0, live: 0, building: 0, spawned: 0, list: [], revenue_rp: 0, spend_rp: 0, net_rp: 0, stale_kpi: 0 },
    auto: { running: false },
    ingest: { running: false },
    activity: [],
  });
}

// --- Ingestion ---

interface IngestionRaw {
  runs: { rows: Record<string, unknown>[]; page: number; has_next: boolean; total: number };
  articles: { rows: Record<string, unknown>[]; page: number; has_next: boolean; total: number };
  errors: { rows: Record<string, unknown>[]; page: number; has_next: boolean; total: number };
}

function formatTimestamp(value: unknown): string {
  const seconds = typeof value === "number" ? value : Number(value);
  if (!value || Number.isNaN(seconds)) return "Waktu tidak tercatat";
  return new Date(seconds * 1000).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function formatRunDuration(startedAt: unknown, finishedAt: unknown): string {
  const start = typeof startedAt === "number" ? startedAt : Number(startedAt);
  if (!startedAt || Number.isNaN(start)) return "—";
  if (finishedAt === null || finishedAt === undefined || finishedAt === "") return "sedang berjalan";
  const end = typeof finishedAt === "number" ? finishedAt : Number(finishedAt);
  if (Number.isNaN(end)) return "—";
  const totalSeconds = Math.max(0, Math.round(end - start));
  if (totalSeconds < 60) return `${totalSeconds}s`;
  return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
}

function runRowToItem(row: Record<string, unknown>) {
  const errorsCount = typeof row.errors === "number" ? row.errors : parseInt(String(row.errors ?? "0"), 10) || 0;
  const duration = formatRunDuration(row.started_at, row.finished_at);
  const isRunning = duration === "sedang berjalan";
  const id = String(row.id ?? "");
  const description = [
    `articles_seen: ${row.articles_seen ?? 0}`,
    `articles_processed: ${row.articles_processed ?? 0}`,
    `articles_filtered: ${row.articles_filtered ?? 0}`,
    `events_found: ${row.events_found ?? 0}`,
    `companies_touched: ${row.companies_touched ?? 0}`,
    `errors: ${errorsCount}`,
  ].join(" · ");
  const severity = errorsCount > 0 ? ("danger" as const) : isRunning ? ("info" as const) : ("good" as const);
  const meta = [
    `durasi: ${duration}`,
    id ? `id: ${id.slice(0, 8)}` : "id: —",
    `status: ${isRunning ? "running" : (row.status || "done")}`,
    `finished: ${row.finished_at ?? ""}`,
  ];
  return { title: formatTimestamp(row.started_at), description, severity, meta };
}

function rowToItem(row: Record<string, unknown>, fields: string[], timestampField?: string) {
  const pairs = fields.map((field) => `${field}: ${row[field] ?? ""}`);
  const primary = pairs[0] ?? "";
  const rawSecondary = pairs.slice(1).join(" · ");
  const secondary = rawSecondary.length > 200 ? rawSecondary.slice(0, 197) + "…" : rawSecondary;
  const errorsCount = typeof row.errors === "number" ? row.errors : parseInt(String(row.errors ?? "0"), 10) || 0;
  const severity = errorsCount > 0
    ? ("danger" as const)
    : /status: failed|error:\s*\S/.test(secondary)
      ? ("danger" as const)
      : /status: published|events:\s*[1-9]/.test(secondary)
        ? ("good" as const)
        : ("warning" as const);
  const meta: string[] = [];
  if (timestampField) meta.push(`waktu: ${formatTimestamp(row[timestampField])}`);
  if (errorsCount > 0) meta.push(`${errorsCount} error${errorsCount > 1 ? "s" : ""}`);
  return { title: primary, description: secondary, severity, meta: meta.length ? meta : undefined };
}

export async function getIngestionFromJson(): Promise<AdminIngestionData> {
  const result = await getBackendAdminJson<IngestionRaw>("/api/v1/admin/ingestion");
  const raw = unwrap(result, null as unknown as IngestionRaw);
  if (!raw) return { sections: [], totals: { runs: 0, articles: 0, errors: 0 } };

  const specs: { title: string; fields: string[]; timestampField?: string; data: IngestionRaw["runs"] }[] = [
    { title: "Runs", fields: ["id", "articles_seen", "articles_processed", "events_found", "errors"], data: raw.runs },
    { title: "Articles", fields: ["status", "source", "title", "url", "events_found", "error"], timestampField: "discovered_at", data: raw.articles },
    { title: "Errors", fields: ["stage", "source", "article_url", "message"], timestampField: "occurred_at", data: raw.errors },
  ];

  const sections: AdminSection[] = specs.map(({ title, fields, timestampField, data }) => {
    const items = (data?.rows ?? []).map((row) => (title === "Runs" ? runRowToItem(row) : rowToItem(row, fields, timestampField)));
    // Preserve backend order (started_at DESC) for Runs; sort by severity for Articles/Errors
    const sorted = title === "Runs" ? items : [...items].sort((a, b) => {
      const order: Record<string, number> = { info: 0, danger: 1, warning: 2, good: 3, muted: 4 };
      return (order[a.severity ?? "muted"] ?? 4) - (order[b.severity ?? "muted"] ?? 4);
    });
    return {
      eyebrow: title,
      title,
      items: sorted,
    };
  });

  return {
    sections,
    totals: {
      runs: raw.runs.total ?? (raw.runs.rows?.length ?? 0),
      articles: raw.articles.total ?? (raw.articles.rows?.length ?? 0),
      errors: raw.errors.total ?? (raw.errors.rows?.length ?? 0),
    },
  };
}

export async function getIngestionFullData(): Promise<AdminIngestionFullData> {
  const basic = await getIngestionFromJson();
  // Fetch enhanced details from the backend
  const detailsResult = await getBackendAdminJson<{ details: AdminIngestionDetails }>(
    "/api/v1/admin/ingestion?include_details=true",
  );
  const details = detailsResult.ok ? detailsResult.data?.details : undefined;
  return { sections: basic.sections, details, totals: basic.totals };
}

// ── Data Tables (Phase 4) ──

export async function getAdminTableData<T = Record<string, unknown>>(
  table: AdminTableName,
  params?: { page?: number; per_page?: number; search?: string; sort_by?: string; order?: string },
): Promise<AdminTableData<T>> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.per_page) sp.set("per_page", String(params.per_page));
  if (params?.search) sp.set("search", params.search);
  if (params?.sort_by) sp.set("sort_by", params.sort_by);
  if (params?.order) sp.set("order", params.order);
  const qs = sp.toString();
  const result = await getBackendAdminJson<AdminTableData<T>>(
    `/api/v1/admin/tables/${table}${qs ? `?${qs}` : ""}`,
  );
  return unwrap(result, {
    rows: [],
    page: 1,
    per_page: 25,
    total: 0,
    has_next: false,
    sort_by: params?.sort_by ?? "name",
    order: params?.order ?? "asc",
  });
}

export async function updateAdminTableRow<T = Record<string, unknown>>(
  table: AdminTableName,
  rowId: string,
  updates: Record<string, unknown>,
): Promise<{ ok: boolean; data?: T; message?: string }> {
  const { ok, data, message } = await postBackendAdminJson(
    `/api/v1/admin/tables/${table}/${rowId}`,
    updates,
  );
  return { ok, data: data as T | undefined, message: message as string | undefined };
}

// --- Data quality ---

interface DataQualityRaw {
  missing: { id: string; name: string; missing_fields: string[] }[];
  duplicates: {
    name_a: string;
    name_b: string;
    similarity: number;
    company_id_a: string;
    company_id_b: string;
    company_a?: {
      id?: string;
      name?: string;
      sector?: string;
      location?: string;
      founded_year?: string;
      status?: string;
      website?: string;
    };
    company_b?: {
      id?: string;
      name?: string;
      sector?: string;
      location?: string;
      founded_year?: string;
      status?: string;
      website?: string;
    };
  }[];
  conflicts: { company_id: string; company_name: string; announced_date: string; variants: number }[];
  stale: { id: string; name: string; last_updated_at: number }[];
  source_issues: { entity_type: string; label: string; url: string }[];
  failures: { source: string; stage: string; label: string; message: string }[];
}

export async function getDataQualityFromJson(): Promise<AdminDataQualityData> {
  const result = await getBackendAdminJson<DataQualityRaw>("/api/v1/admin/data-quality");
  const raw = unwrap(result, null as unknown as DataQualityRaw);
  if (!raw) return { metrics: [], sections: [] };

  const metrics: AdminMetric[] = [
    { label: "Missing core fields", value: String(raw.missing?.length ?? 0), description: "Company dengan field inti kosong", severity: "danger" },
    { label: "Duplicate candidates", value: String(raw.duplicates?.length ?? 0), description: "Heuristik nama mirip", severity: "warning" },
    { label: "Funding conflicts", value: String(raw.conflicts?.length ?? 0), description: "Round bentrok", severity: "warning" },
    {
      label: "Source URL issues",
      value: String(raw.source_issues?.length ?? 0),
      description: "Dead-link candidate",
      severity: (raw.source_issues?.length ?? 0) > 0 ? "warning" : "good",
    },
  ];

  const sections: AdminSection[] = [
    {
      eyebrow: "Duplicate candidates",
      title: "Auto-detected",
      description: "Urut berdasarkan confidence tertinggi. Gunakan threshold lebih tinggi untuk hasil yang lebih aman.",
      items: (raw.duplicates ?? [])
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 20)
        .map((row) => ({
          title: `${row.name_a} ↔ ${row.name_b}`,
          description: `${Math.round(row.similarity * 100)}% mirip`,
          meta: [row.company_id_a, row.company_id_b],
          severity: row.similarity >= 0.9 ? "danger" : row.similarity >= 0.85 ? "warning" : "good",
          compare: {
            left: {
              id: row.company_id_a,
              name: row.company_a?.name || row.name_a,
              sector: row.company_a?.sector || "",
              location: row.company_a?.location || "",
              foundedYear: row.company_a?.founded_year || "",
              status: row.company_a?.status || "",
              website: row.company_a?.website || "",
            },
            right: {
              id: row.company_id_b,
              name: row.company_b?.name || row.name_b,
              sector: row.company_b?.sector || "",
              location: row.company_b?.location || "",
              foundedYear: row.company_b?.founded_year || "",
              status: row.company_b?.status || "",
              website: row.company_b?.website || "",
            },
          },
          actions: [
            { label: "A", href: `/companies/${row.company_id_a}` },
            { label: "B", href: `/companies/${row.company_id_b}` },
          ],
        })),
    },
    {
      eyebrow: "Missing fields",
      title: "Core company fields",
      items: (raw.missing ?? [])
        .sort((a, b) => b.missing_fields.length - a.missing_fields.length)
        .map((row) => ({
          title: row.name,
          description: row.missing_fields.join(", "),
          severity: "danger",
          meta: [`${row.missing_fields.length} field kosong`],
          actions: [{ label: "Lihat", href: `/companies/${row.id}` }],
        })),
    },
    {
      eyebrow: "Funding conflicts",
      title: "Round bentrok",
      items: (raw.conflicts ?? [])
        .sort((a, b) => b.variants - a.variants)
        .map((row) => ({
          title: row.company_name,
          description: `${row.announced_date || "?"} · ${row.variants} varian`,
          severity: "warning",
          actions: [{ label: "Lihat", href: `/companies/${row.company_id}` }],
        })),
    },
    {
      eyebrow: "Stale profiles",
      title: "> 90 hari",
      items: (raw.stale ?? [])
        .sort((a, b) => (a.last_updated_at ?? 0) - (b.last_updated_at ?? 0))
        .map((row) => ({
          title: row.name,
          description: freshness(row.last_updated_at),
          severity: "warning",
          actions: [{ label: "Lihat", href: `/companies/${row.id}` }],
        })),
    },
    {
      eyebrow: "Source URL issues",
      title: "Dead-link",
      items: (raw.source_issues ?? []).map((row) => ({
        title: `${row.entity_type} · ${row.label}`,
        description: row.url.slice(0, 60),
        severity: "warning",
        actions: row.url.startsWith("http") ? [{ label: "Cek URL", href: row.url }] : undefined,
      })),
    },
    {
      eyebrow: "Extraction failures",
      title: "Error terbaru",
      items: (raw.failures ?? []).slice(0, 20).map((row) => ({
        title: `${row.source} · ${row.stage}`,
        description: row.label,
        meta: [row.message?.slice(0, 150)],
        severity: "danger",
      })),
    },
  ];

  return { metrics, sections };
}

// --- Moderation ---

interface SubmissionRaw {
  reference: string;
  status: string;
  kind: string;
  entity_id?: string;
  source_url: string;
  created_at: number;
  payload: Record<string, unknown>;
  payload_json: string;
}

export async function getModerationQueueFromJson(
  params?: { status?: string; kind?: string; search?: string; page?: number },
): Promise<{ items: AdminModerationDetail[]; total: number; page: number; has_next: boolean }> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.kind) sp.set("kind", params.kind);
  if (params?.search) sp.set("search", params.search);
  if (params?.page) sp.set("page", String(params.page));
  const qs = sp.toString();
  const result = await getBackendAdminJson<any>(`/api/v1/admin/moderation${qs ? `?${qs}` : ""}`);
  // Support both old format (array) and new format ({rows: [...], ...})
  const data = unwrap(result, []);
  const isWrapped = !Array.isArray(data) && data?.rows;
  const raw: SubmissionRaw[] = Array.isArray(data) ? data : (data?.rows ?? []);
  const total = isWrapped ? (data.total ?? raw.length) : raw.length;
  const page = isWrapped ? (data.page ?? 1) : 1;
  const has_next = isWrapped ? (data.has_next ?? false) : false;
  const items = raw.map((row) => ({
    reference: row.reference,
    status: row.status,
    kind: row.kind,
    sourceContext: row.source_url,
    sourceMeta: [`${row.kind} · entity ${row.entity_id || "baru"}`, `created ${freshness(row.created_at)}`],
    facts: Object.entries(row.payload ?? {}).map(([key, value]) => ({ key, value: String(value) })),
    factsSummary: Object.entries(row.payload ?? {}).length
      ? Object.entries(row.payload)
        .map(([key, value]) => `${key}: ${String(value).slice(0, 80)}`)
        .slice(0, 3)
        .join(" · ") + (Object.entries(row.payload).length > 3 ? " …" : "")
      : "Payload kosong.",
    payloadJson: row.payload_json ?? "{}",
  }));
  return { items, total, page, has_next };
}

export async function getModerationFromJson(): Promise<AdminModerationDetail | null> {
  const { items } = await getModerationQueueFromJson();
  return items[0] ?? null;
}

// --- System ---

interface SystemRaw {
  health: { database: string; auto: { running: boolean; pid?: number }; schema_version: number };
  files: { name: string; exists: boolean; size: number; modified_at: number | null }[];
  backups: { name: string; size: number; modified_at: number | null }[];
}

export async function getSystemFromJson(): Promise<AdminSystemData> {
  const result = await getBackendAdminJson<SystemRaw>("/api/v1/admin/system");
  const raw = unwrap(result, null as unknown as SystemRaw);
  if (!raw) return { metrics: [], sections: [] };

  const metrics: AdminMetric[] = [
    { label: "Database", value: raw.health.database, description: `Schema version ${raw.health.schema_version}`, severity: raw.health.database === "ok" ? "good" : "danger" },
    {
      label: "Auto loop",
      value: raw.health.auto?.running ? "running" : "idle",
      description: raw.health.auto?.pid ? `PID ${raw.health.auto.pid}` : "Tidak ada proses aktif",
      severity: raw.health.auto?.running ? "good" : "warning",
    },
    {
      label: "Backups",
      value: String(raw.backups?.length ?? 0),
      description: "Snapshot terbaru di folder `backups/`",
      severity: (raw.backups?.length ?? 0) > 0 ? "good" : "warning",
    },
  ];

  const sections: AdminSection[] = [
    {
      eyebrow: "Backup",
      title: "Backup database manual",
      description: "Buat snapshot lokal sebelum operasi berisiko atau audit data besar.",
      items: (raw.backups ?? []).map((row) => ({
        title: row.name,
        description: `${row.size} bytes · ${freshness(row.modified_at)}`,
        severity: "good",
      })),
    },
    {
      eyebrow: "Operational files",
      title: "Status file penting",
      description: "Pastikan artefak inti ada dan diperbarui sesuai aktivitas sistem.",
      items: (raw.files ?? []).map((row) => ({
        title: row.name,
        description: row.exists ? `${row.size} bytes · ${freshness(row.modified_at)}` : "belum ada",
        severity: row.exists ? "good" : "danger",
      })),
    },
  ];

  return { metrics, sections };
}
