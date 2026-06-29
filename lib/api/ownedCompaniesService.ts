import apiClient from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";
import type { ApiFailure, ApiResult } from "@/types/api";

export interface OwnedCompany {
  id: string;
  name: string;
  slug: string;
  granted_at: number;
}

function toFailure(error: unknown): ApiFailure {
  const result = handleApiError(error);
  return { success: false, message: String(result.message ?? "Terjadi kesalahan pada server"), error: result.error };
}

export async function getOwnedCompanies(): Promise<ApiResult<OwnedCompany[]>> {
  try {
    const resp = await apiClient.get("/v1/profile/owned-companies");
    return { success: true, data: (resp.data?.data ?? []) as OwnedCompany[] };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function updateOwnedCompany(
  companyId: string,
  fields: { description?: string; website?: string; logo_url?: string; social_links?: string },
): Promise<ApiResult<null>> {
  try {
    await apiClient.patch(`/v1/companies/${companyId}/manage`, fields);
    return { success: true, data: null };
  } catch (error: unknown) {
    return toFailure(error);
  }
}
