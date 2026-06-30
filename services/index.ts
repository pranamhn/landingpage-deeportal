import api from "@/services/apiClient";
import { handleApiError } from "@/lib/api/handleApiError";
import type { ApiResult } from "@/types/api";

function toFailure(error: unknown) {
  const result = handleApiError(error);
  return { success: false as const, message: String(result.message ?? "Server error"), error: result.error };
}

export async function getNews(page = 1): Promise<ApiResult<{ rows: any[]; total: number; page: number; has_next: boolean }>> {
  try {
    const resp = await api.get("/v1/news", { params: { page, limit: 21 } });
    return { success: true, data: resp.data?.data };
  } catch (e) { return toFailure(e); }
}

export async function getPeople(limit = 50, page = 1): Promise<ApiResult<any[]>> {
  try {
    const resp = await api.get("/v1/people", { params: { limit, page } });
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}

export async function getPerson(id: string): Promise<ApiResult<any>> {
  try {
    const resp = await api.get(`/v1/people/${id}`);
    return { success: true, data: resp.data?.data };
  } catch (e) { return toFailure(e); }
}

export async function getStats(): Promise<ApiResult<{ companies: number; funding_rounds: number; investors: number; people: number; last_updated_at: number | null }>> {
  try {
    const resp = await api.get("/v1/stats");
    return { success: true, data: resp.data?.data };
  } catch (e) { return toFailure(e); }
}

export async function getAcquisitions(limit = 25, page = 1): Promise<ApiResult<any[]>> {
  try {
    const resp = await api.get("/v1/acquisitions", { params: { limit, page } });
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}

export async function getLists(): Promise<ApiResult<any[]>> {
  try {
    const resp = await api.get("/v1/lists");
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}

export async function getList(id: string): Promise<ApiResult<any>> {
  try {
    const resp = await api.get(`/v1/lists/${id}`);
    return { success: true, data: resp.data?.data };
  } catch (e) { return toFailure(e); }
}

export async function globalSearch(query: string, limit = 8): Promise<ApiResult<{ companies: any[]; investors: any[]; people: any[] }>> {
  try {
    const resp = await api.get("/v1/search", { params: { q: query, limit } });
    return { success: true, data: resp.data?.data ?? { companies: [], investors: [], people: [] } };
  } catch (e) { return toFailure(e); }
}
