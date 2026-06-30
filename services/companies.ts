import api from "@/services/apiClient";
import { handleApiError } from "@/lib/api/handleApiError";
import type { ApiResult } from "@/types/api";
import type { CommunityHub, Company, CompanySearchPayload } from "@/types/company";

function toFailure(error: unknown) {
  const result = handleApiError(error);
  return { success: false as const, message: String(result.message ?? "Server error"), error: result.error };
}

export async function searchCompanies(params: Record<string, string>): Promise<ApiResult<CompanySearchPayload>> {
  try {
    const resp = await api.get("/v1/companies", { params });
    return { success: true, data: { data: resp.data?.data ?? [], count: resp.data?.count ?? 0, page: resp.data?.page ?? 1 } };
  } catch (e) { return toFailure(e); }
}

export async function getCompany(slug: string): Promise<ApiResult<Company>> {
  try {
    const resp = await api.get(`/v1/companies/${slug}`);
    return { success: true, data: resp.data?.data as Company };
  } catch (e) { return toFailure(e); }
}

export async function getSimilarCompanies(slug: string): Promise<ApiResult<Company[]>> {
  try {
    const resp = await api.get(`/v1/companies/${slug}/similar`);
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}

export async function getTrendingCompanies(): Promise<ApiResult<Company[]>> {
  try {
    const resp = await api.get("/v1/companies/trending");
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}

export async function getFeaturedCompanies(): Promise<ApiResult<Company[]>> {
  try {
    const resp = await api.get("/v1/companies/featured");
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}

export async function getCompanyFacets(): Promise<ApiResult<{ sectors: { sector: string; count: number }[] }>> {
  try {
    const resp = await api.get("/v1/companies/facets");
    return { success: true, data: resp.data?.data };
  } catch (e) { return toFailure(e); }
}

export async function compareCompanies(slugs: string[]): Promise<ApiResult<Company[]>> {
  try {
    const resp = await api.get("/v1/companies/compare", { params: { ids: slugs.join(",") } });
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}

export async function getCommunityHubs(limit = 50, page = 1): Promise<ApiResult<CommunityHub[]>> {
  try {
    const resp = await api.get("/v1/community-hubs", { params: { limit, page } });
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}
