import apiClient from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";
import type { ApiFailure, ApiResult } from "@/types/api";
import type { CreateSubmissionPayload, CreateSubmissionResult, Submission } from "@/types/submission";

function toFailure(error: unknown): ApiFailure {
  const result = handleApiError(error);
  return { success: false, message: String(result.message ?? "Terjadi kesalahan pada server"), error: result.error };
}

export async function createSubmission(payload: CreateSubmissionPayload): Promise<ApiResult<CreateSubmissionResult>> {
  try {
    const resp = await apiClient.post("/v1/submissions", payload);
    return { success: true, data: resp.data?.data as CreateSubmissionResult };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function getSubmission(reference: string): Promise<ApiResult<Submission>> {
  try {
    const resp = await apiClient.get(`/v1/submissions/${reference}`);
    return { success: true, data: resp.data?.data as Submission };
  } catch (error: unknown) {
    return toFailure(error);
  }
}
