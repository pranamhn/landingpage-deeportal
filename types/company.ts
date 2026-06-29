import type { Investor } from "./investor";

export interface Company {
  id: string;
  name: string;
  slug: string;
  sector: string;
  location: string;
  country: string | null;
  country_code: string | null;
  description: string;
  founded_year: string;
  employee_range: string | null;
  status: string;
  website: string;
  contact_email: string | null;
  funding_rounds: FundingRound[];
  news_events: NewsEvent[];
  projects: CompanyProject[];
  people: Person[];
  acquisitions: Acquisition[];
  status_history: StatusChange[];
  last_verified_at: number | null;
  last_updated_at: number | null;
  featured_until: number | null;
  total_funding_usd: number | null;
  last_round_type: string | null;
  funding_rounds_count: number | null;
  lead_investor_name: string | null;
  investor_count: number | null;
}

export interface FundingRound {
  id: string;
  round_type: string;
  amount_usd: number;
  announced_date: string;
  source_url: string;
  source_title: string;
  investors: Investor[];
}

export interface NewsEvent {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  published_at: string;
}

export interface CompanyProject {
  id: string;
  name: string;
  description: string | null;
  launched_date: string | null;
  source_url: string;
}

export interface Person {
  id: string;
  slug: string;
  name: string;
  role: string;
}

export interface Acquisition {
  id: string;
  acquirer_name: string;
  amount_usd: number;
  announced_date: string;
  source_url: string;
}

export interface StatusChange {
  status: string;
  effective_date: string;
  source_url: string;
}

export interface CompanySearchPayload {
  data: Company[];
  count: number;
  page: number;
}

export interface CommunityHub {
  id: string;
  name: string;
  slug: string;
  description: string;
  sector: string;
  location: string;
  founded_year: string | null;
  website: string | null;
}
