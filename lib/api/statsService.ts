import apiClient from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";

export interface DirectoryStats {
  companies: number;
  funding_rounds: number;
  investors: number;
  people: number;
  last_updated_at: number | null;
}

export async function getStats() {
  try {
    const resp = await apiClient.get("/v1/stats");
    return resp.data as { success: true; data: DirectoryStats };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function getRecentFunding(limit = 5) {
  try {
    const resp = await apiClient.get("/v1/funding/recent", { params: { limit } });
    return resp.data as { success: true; data: any[] };
  } catch (error: any) {
    return handleApiError(error);
  }
}
