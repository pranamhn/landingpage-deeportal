export type AdminSeverity = "good" | "warning" | "danger" | "info" | "muted";

export interface AdminMetric {
  label: string;
  value: string;
  description: string;
  severity?: AdminSeverity;
}

export interface AdminQueueItem {
  title: string;
  description: string;
  meta?: string[];
  severity?: AdminSeverity;
  actions?: { label: string; href: string }[];
  compare?: {
    left: AdminCompareProfile;
    right: AdminCompareProfile;
  };
}

export interface AdminCompareProfile {
  id: string;
  name: string;
  sector?: string;
  location?: string;
  foundedYear?: string;
  status?: string;
  website?: string;
}

export interface AdminSection {
  eyebrow: string;
  title: string;
  description?: string;
  items: AdminQueueItem[];
}

export interface AdminModerationDetail {
  reference: string;
  status: string;
  kind: string;
  sourceContext: string;
  sourceMeta: string[];
  facts: { key: string; value: string }[];
  factsSummary: string;
  payloadJson: string;
}

export interface AdminOverviewData {
  metrics: AdminMetric[];
  quality?: AdminSection;
  moderation?: AdminSection;
  activity?: AdminSection;
  portfolio?: AdminSection;
  supportMetrics?: AdminMetric[];
  summary?: {
    autoRunning: boolean;
    pendingSubmissions: number;
    missingProfiles: number;
    staleProfiles: number;
    totalCalls: number;
    totalCostUsd: number;
  };
}

export type AdminOverviewTabId =
  | "directory-quality"
  | "operator-actions"
  | "moderation"
  | "portfolio"
  | "latest-activity";

export interface AdminIngestionData {
  sections: AdminSection[];
  totals: { runs: number; articles: number; errors: number };
}

// ── Phase 3: Enhanced Ingestion Types ──

export interface AdminIngestionSourceBreakdown {
  source: string;
  total: number;
  processed: number;
  failed: number;
  pending: number;
  retryable: number;
  refetchable: number;
  last_article_at: number | null;
}

export interface AdminIngestionTimelinePoint {
  day: string;
  total: number;
  processed: number;
  failed: number;
}

export interface AdminIngestionCurrentRun {
  id: number;
  started_at: number;
  finished_at: number | null;
  articles_seen: number;
  articles_processed: number;
  articles_filtered: number;
  events_found: number;
  companies_touched: number;
  errors: number;
}

export interface AdminIngestionSourceHealth {
  name: string;
  kind: string;
  last_fetched_at: number | null;
  last_success_at: number | null;
  consecutive_failures: number;
}

// P2 source-yield review (rules/data_ingestion.md §4.1) — per-source yield/
// cost from db.get_source_metrics(), used to flag low-yield/high-cost
// sources for the operator to disable from the Sources tab.
export type AdminSourceReviewFlag = "low_yield" | "high_cost" | "low_yield_high_cost" | null;

export interface AdminIngestionSourceYield {
  source: string;
  articles_total: number;
  articles_processed: number;
  no_event: number;
  with_event: number;
  total_cost_usd: number;
  yield_rate: number;
  avg_cost_usd: number;
  cost_per_event_usd: number;
  consecutive_failures: number;
  last_success_at: number | null;
  enabled: boolean;
  review_flag: AdminSourceReviewFlag;
}

export interface AdminIngestionDetails {
  source_breakdown: AdminIngestionSourceBreakdown[];
  articles_timeline: AdminIngestionTimelinePoint[];
  current_run: AdminIngestionCurrentRun | null;
  source_health: AdminIngestionSourceHealth[];
  source_yield: AdminIngestionSourceYield[];
}

export interface AdminIngestionFullData {
  sections: AdminSection[];
  details?: AdminIngestionDetails;
  totals: { runs: number; articles: number; errors: number };
}

export interface AdminDataQualityData {
  metrics: AdminMetric[];
  sections: AdminSection[];
}

// ── Phase 4: Data Tables ──

export type AdminTableName = "companies" | "founders" | "investors" | "lists" | "submissions" | "funding_rounds" | "news_articles";

export interface AdminTableData<T = Record<string, unknown>> {
  rows: T[];
  page: number;
  per_page: number;
  total: number;
  has_next: boolean;
  sort_by: string;
  order: string;
}

export interface AdminTableParams {
  table: AdminTableName;
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  order?: string;
}

export interface AdminSystemData {
  metrics: AdminMetric[];
  sections: AdminSection[];
}

// ── Phase 2: Admin Stats (Insight Dashboard) ──

export interface AdminStatsCounts {
  companies: number;
  founders: number;
  investors: number;
  lists: number;
  submissions: number;
  funding_rounds: number;
  news_events: number;
}

export interface AdminStatsSector {
  sector: string;
  c: number;
}

export interface AdminStatsLocation {
  location: string;
  c: number;
}

export interface AdminStatsStatus {
  status: string;
  c: number;
}

export interface AdminStatsFundingTimeline {
  month: string;
  round_type: string;
  c: number;
}

export interface AdminStatsNewsTimeline {
  month: string;
  c: number;
}

export interface AdminStatsIngestion {
  articles_total: number;
  articles_processed: number;
  articles_failed: number;
  events_found: number;
  success_rate: number;
}

export interface AdminStatsSource {
  name: string;
  kind: string;
  last_fetched_at: number | null;
  last_success_at: number | null;
  consecutive_failures: number;
}

export interface AdminStatsActivity {
  action: string;
  detail: string;
  time: string;
}

export interface AdminStatsPortfolio {
  active: number;
  killed: number;
  scaling: number;
  live: number;
  building: number;
  spawned: number;
  list: {
    id: string;
    id_short: string;
    idea: string;
    type: string;
    status: string;
    budget_spent: number;
    revenue: number;
    created: number;
  }[];
  revenue_rp: number;
  spend_rp: number;
  net_rp: number;
  stale_kpi: number;
}

export interface AdminStatsData {
  counts: AdminStatsCounts;
  sectors: AdminStatsSector[];
  locations: AdminStatsLocation[];
  statuses: AdminStatsStatus[];
  funding_timeline: AdminStatsFundingTimeline[];
  news_timeline: AdminStatsNewsTimeline[];
  ingestion: AdminStatsIngestion;
  sources: AdminStatsSource[];
  cost: { total: number; total_calls: number };
  portfolio: AdminStatsPortfolio;
  auto: { running: boolean; pid?: number };
  ingest: { running: boolean; pid?: number };
  activity: AdminStatsActivity[];
  top_funded?: AdminStatsTopFunded[];
  funding_by_stage?: AdminStatsFundingStage[];
  freshness?: AdminStatsFreshness;
  recent_acquisitions?: AdminStatsAcquisition[];
  top_investors?: AdminStatsTopInvestor[];
  top_news_companies?: AdminStatsTopNews[];
  recent_funding?: AdminStatsFundingRound[];
}

export interface AdminStatsFundingRound {
  id: string;
  company_name: string;
  company_id: string;
  round_type: string | null;
  amount_usd: number | null;
  announced_date: string | null;
  lead_investor: string | null;
}

export interface AdminStatsTopFunded {
  id: string;
  name: string;
  sector: string | null;
  location: string | null;
  status: string | null;
  total_funding_usd: number;
  round_count: number;
}

export interface AdminStatsFundingStage {
  stage: string;
  c: number;
  total_usd: number;
}

export interface AdminStatsFreshness {
  total: number;
  updated_90d: number;
  verified_90d: number;
  pct_updated: number;
}

export interface AdminStatsAcquisition {
  id: string;
  announced_date: string | null;
  amount_usd: number | null;
  acquirer_name: string;
  acquiree_name: string;
  acquiree_id: string;
}

export interface AdminStatsTopInvestor {
  name: string;
  type: string;
  rounds_participated: number;
}

export interface AdminStatsTopNews {
  name: string;
  id: string;
  news_count: number;
}

// ── Chart component types ──

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartSeries {
  name: string;
  color: string;
  data: { label: string; value: number }[];
}
