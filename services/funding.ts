import api from "@/services/apiClient";
import { handleApiError } from "@/lib/api/handleApiError";
import type { ApiResult } from "@/types/api";

function toFailure(error: unknown) {
  const result = handleApiError(error);
  return { success: false as const, message: String(result.message ?? "Server error"), error: result.error };
}

export async function getRecentFunding(limit = 20, page = 1, period?: { year?: string; month?: string; week?: string }): Promise<ApiResult<any[]>> {
  try {
    const resp = await api.get("/v1/funding/recent", { params: { limit, page, ...period } });
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}

export async function getFundingThisWeek(): Promise<ApiResult<any[]>> {
  try {
    const resp = await api.get("/v1/funding/this-week");
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}

export async function getFundingStats(): Promise<ApiResult<any>> {
  try {
    const resp = await api.get("/v1/funding/stats");
    return { success: true, data: resp.data?.data ?? {} };
  } catch (e) { return toFailure(e); }
}

export async function getFundingPeriodFacets(): Promise<ApiResult<{ years: number[] }>> {
  try {
    const resp = await api.get("/v1/funding/period-facets");
    return { success: true, data: resp.data?.data ?? { years: [] } };
  } catch (e) { return toFailure(e); }
}

export async function getFundingTrends(groupBy: "sector" | "country" = "sector", months = 12): Promise<ApiResult<any[]>> {
  try {
    const resp = await api.get("/v1/trends", { params: { group_by: groupBy, months } });
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}
