import apiClient from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";

export interface ApiKey {
  id: string;
  label: string;
  plan: string;
  quota_daily: number;
  created_at: number;
  last_used_at: number | null;
  is_revoked: number;
}

export async function getApiKeys() {
  try {
    const resp = await apiClient.get("/v1/api-keys");
    return resp.data as { success: true; data: ApiKey[] };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function createApiKey(label: string) {
  try {
    // Quota ditentukan server-side berdasarkan plan (default "free") — lihat
    // orchestrator/routes/api_routes.py create_api_key().
    const resp = await apiClient.post("/v1/api-keys", { label });
    return resp.data as { success: true; data: { id: string; key: string } };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function revokeApiKey(id: string) {
  try {
    const resp = await apiClient.post(`/v1/api-keys/${id}/revoke`);
    return resp.data as { success: boolean };
  } catch (error: any) {
    return handleApiError(error);
  }
}
