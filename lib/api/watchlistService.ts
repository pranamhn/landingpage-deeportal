import apiClient from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";
import type { Company } from "@/types/company";

export async function getWatchlist() {
  try {
    const resp = await apiClient.get("/v1/watchlist");
    return resp.data as { success: true; data: Company[] };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function addToWatchlist(company_id: string) {
  try {
    const resp = await apiClient.post("/v1/watchlist/add", { company_id });
    return resp.data as { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function removeFromWatchlist(company_id: string) {
  try {
    const resp = await apiClient.post("/v1/watchlist/remove", { company_id });
    return resp.data as { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}
