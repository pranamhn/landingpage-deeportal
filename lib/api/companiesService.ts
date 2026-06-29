import apiClient from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";
import type { ApiFailure, ApiResult } from "@/types/api";
import type { CommunityHub, Company, CompanySearchPayload } from "@/types/company";
import type { Investor } from "@/types/investor";
import type { CompanyList } from "@/types/list";

function toFailure(error: unknown): ApiFailure {
  const result = handleApiError(error);
  return {
    success: false,
    message: String(result.message ?? "Terjadi kesalahan pada server"),
    error: result.error,
  };
}

export async function searchCompanies(params: Record<string, string>): Promise<ApiResult<CompanySearchPayload>> {
  try {
    const resp = await apiClient.get("/v1/companies", { params });
    return {
      success: true,
      data: {
        data: Array.isArray(resp.data?.data) ? resp.data.data : [],
        count: Number(resp.data?.count ?? 0),
        page: Number(resp.data?.page ?? 1),
      },
    };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

function withFundingSummary(company: Company): Company {
  const rounds = company.funding_rounds ?? [];
  const totalFundingUsd = rounds.reduce((sum, r) => sum + (r.amount_usd || 0), 0);
  const lastRound = [...rounds].sort((a, b) => (b.announced_date || "").localeCompare(a.announced_date || ""))[0];
  const allInvestors = rounds.flatMap((r) => (r.investors ?? []) as any[]);
  const lead = allInvestors.find((inv) => inv.is_lead) ?? allInvestors[0];
  const investorNames = new Set(allInvestors.map((inv) => inv.name));
  return {
    ...company,
    total_funding_usd: totalFundingUsd,
    funding_rounds_count: rounds.length,
    last_round_type: lastRound?.round_type ?? null,
    lead_investor_name: lead?.name ?? null,
    investor_count: investorNames.size,
  };
}

export async function getTrendingCompanies(): Promise<ApiResult<Company[]>> {
  try {
    const resp = await apiClient.get("/v1/companies/trending");
    const companies = (resp.data?.data ?? []) as Company[];
    return { success: true, data: companies.map(withFundingSummary) };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getFeaturedCompanies(): Promise<ApiResult<Company[]>> {
  try {
    // Backend sudah kirim total_funding_usd dst (sama seperti searchCompanies), jadi
    // tidak perlu withFundingSummary di sini.
    const resp = await apiClient.get("/v1/companies/featured");
    return { success: true, data: (resp.data?.data ?? []) as Company[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export interface SectorFacet {
  sector: string;
  count: number;
}

export async function getCompanyFacets(): Promise<ApiResult<{ sectors: SectorFacet[] }>> {
  try {
    const resp = await apiClient.get("/v1/companies/facets");
    return { success: true, data: resp.data?.data as { sectors: SectorFacet[] } };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export interface GlobalSearchResult {
  companies: Company[];
  investors: Investor[];
  people: any[];
}

export async function globalSearch(query: string, limit = 8): Promise<ApiResult<GlobalSearchResult>> {
  try {
    const resp = await apiClient.get("/v1/search", { params: { q: query, limit } });
    return { success: true, data: (resp.data?.data ?? { companies: [], investors: [], people: [] }) as GlobalSearchResult };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export interface FundingTrendPoint {
  month: string;
  group_key: string;
  count: number;
  total_amount_usd: number;
}

export async function getFundingTrends(groupBy: "sector" | "country" = "sector", months = 12): Promise<ApiResult<FundingTrendPoint[]>> {
  try {
    const resp = await apiClient.get("/v1/trends", { params: { group_by: groupBy, months } });
    return { success: true, data: (resp.data?.data ?? []) as FundingTrendPoint[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getSimilarCompanies(slug: string): Promise<ApiResult<Company[]>> {
  try {
    const resp = await apiClient.get(`/v1/companies/${slug}/similar`);
    return { success: true, data: (resp.data?.data ?? []) as Company[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getCompany(slug: string): Promise<ApiResult<Company>> {
  try {
    const resp = await apiClient.get(`/v1/companies/${slug}`);
    return { success: true, data: resp.data?.data as Company };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getCommunityHubs(limit = 50, page = 1): Promise<ApiResult<CommunityHub[]>> {
  try {
    const resp = await apiClient.get("/v1/community-hubs", { params: { limit, page } });
    return { success: true, data: (resp.data?.data ?? []) as CommunityHub[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function compareCompanies(slugs: string[]): Promise<ApiResult<Company[]>> {
  try {
    const resp = await apiClient.get("/v1/companies/compare", { params: { ids: slugs.join(",") } });
    return { success: true, data: (resp.data?.data ?? []) as Company[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getInvestor(slug: string): Promise<ApiResult<Investor>> {
  try {
    const resp = await apiClient.get(`/v1/investors/${slug}`);
    return { success: true, data: resp.data?.data as Investor };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getInvestors(limit = 50, page = 1): Promise<ApiResult<Investor[]>> {
  try {
    const resp = await apiClient.get("/v1/investors", { params: { limit, page } });
    return { success: true, data: (resp.data?.data ?? []) as Investor[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getLists(): Promise<ApiResult<CompanyList[]>> {
  try {
    const resp = await apiClient.get("/v1/lists");
    return { success: true, data: (resp.data?.data ?? []) as CompanyList[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getList(id: string): Promise<ApiResult<CompanyList>> {
  try {
    const resp = await apiClient.get(`/v1/lists/${id}`);
    return { success: true, data: resp.data?.data as CompanyList };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getPeople(limit = 50, page = 1): Promise<ApiResult<any[]>> {
  try {
    const resp = await apiClient.get("/v1/people", { params: { limit, page } });
    return { success: true, data: (resp.data?.data ?? []) as any[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getPerson(id: string): Promise<ApiResult<any>> {
  try {
    const resp = await apiClient.get(`/v1/people/${id}`);
    return { success: true, data: resp.data?.data as any };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getRecentFunding(
  limit = 20,
  page = 1,
  period?: { year?: string; month?: string; week?: string },
): Promise<ApiResult<any[]>> {
  try {
    const resp = await apiClient.get("/v1/funding/recent", { params: { limit, page, ...period } });
    return { success: true, data: (resp.data?.data ?? []) as any[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getFundingPeriodFacets(): Promise<ApiResult<{ years: number[] }>> {
  try {
    const resp = await apiClient.get("/v1/funding/period-facets");
    return { success: true, data: resp.data?.data ?? { years: [] } };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getFundingThisWeek(): Promise<ApiResult<any[]>> {
  try {
    const resp = await apiClient.get("/v1/funding/this-week");
    return { success: true, data: (resp.data?.data ?? []) as any[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getFundingStats(): Promise<ApiResult<any>> {
  try {
    const resp = await apiClient.get("/v1/funding/stats");
    return { success: true, data: resp.data?.data ?? {} };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getAcquisitions(limit = 25, page = 1): Promise<ApiResult<any[]>> {
  try {
    const resp = await apiClient.get("/v1/acquisitions", { params: { limit, page } });
    return { success: true, data: (resp.data?.data ?? []) as any[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}
