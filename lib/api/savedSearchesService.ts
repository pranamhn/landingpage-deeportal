import apiClient from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";

export interface SavedSearch {
  id: string;
  name: string;
  query_params: Record<string, string>;
  created_at: number;
}

export async function getSavedSearches() {
  try {
    const resp = await apiClient.get("/v1/saved-searches");
    return resp.data as { success: true; data: SavedSearch[] };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function saveSearch(name: string, params: Record<string, string>) {
  try {
    const resp = await apiClient.post("/v1/saved-searches", { name, params });
    return resp.data as { success: true; data: { id: string } };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function deleteSavedSearch(id: string) {
  try {
    const resp = await apiClient.post(`/v1/saved-searches/${id}/delete`);
    return resp.data as { success: boolean };
  } catch (error: any) {
    return handleApiError(error);
  }
}
