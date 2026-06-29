import type { Company, FundingRound } from "./company";

export interface Investor {
  id: string;
  name: string;
  slug: string;
  type: string;
  location: string;
  website: string;
  contact_email: string | null;
  description: string;
  founded_year: string | null;
  fund_size_usd: number | null;
  stage_focus?: string | null;
  sector_focus?: string | null;
  total_investments_usd?: number | null;
  linkedin_url?: string | null;
  portfolio_count: number | null;
  funding_round_count: number | null;
  portfolio: Company[];
  funding_rounds: (FundingRound & { company_name: string; company_slug: string })[];
  investment_stats?: {
    total_rounds: number;
    avg_amount: number;
    total_amount: number;
    unique_companies: number;
    last_investment_date: string | null;
  };
  round_types?: { type: string; c: number }[];
  recent_news?: {
    title: string;
    url: string;
    published_at: string;
    company_name: string;
    company_slug: string;
  }[];
}
