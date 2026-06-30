import api from "@/services/apiClient";
import { handleApiError } from "@/lib/api/handleApiError";
import type { ApiResult } from "@/types/api";
import type { Investor } from "@/types/investor";

function toFailure(error: unknown) {
  const result = handleApiError(error);
  return { success: false as const, message: String(result.message ?? "Server error"), error: result.error };
}

export async function getInvestors(limit = 50, page = 1): Promise<ApiResult<Investor[]>> {
  try {
    const resp = await api.get("/v1/investors", { params: { limit, page } });
    return { success: true, data: resp.data?.data ?? [] };
  } catch (e) { return toFailure(e); }
}

export async function getInvestor(slug: string): Promise<ApiResult<Investor>> {
  try {
    const resp = await api.get(`/v1/investors/${slug}`);
    return { success: true, data: resp.data?.data as Investor };
  } catch (e) { return toFailure(e); }
}
