import apiClient from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";
import type { ApiFailure, ApiResult } from "@/types/api";

function toFailure(error: unknown): ApiFailure {
  const result = handleApiError(error);
  return { success: false, message: String(result.message ?? "Terjadi kesalahan pada server"), error: result.error };
}

export async function joinPricingWaitlist(email: string, plan: "pro" | "enterprise", note?: string): Promise<ApiResult<null>> {
  try {
    await apiClient.post("/v1/pricing/waitlist", { email, plan, note });
    return { success: true, data: null };
  } catch (error: unknown) {
    return toFailure(error);
  }
}

export async function createPaymentCheckout(plan: "pro"): Promise<ApiResult<{ checkout_url: string }>> {
  try {
    const resp = await apiClient.post("/v1/payments/checkout", { plan });
    return { success: true, data: resp.data.data };
  } catch (error: unknown) {
    return toFailure(error);
  }
}
