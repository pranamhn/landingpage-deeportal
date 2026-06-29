import apiClient from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";

export async function subscribeNewsletter(email: string) {
  try {
    const resp = await apiClient.post("/v1/newsletter/subscribe", { email });
    return resp.data as { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function unsubscribeNewsletter(id: string) {
  try {
    const resp = await apiClient.post("/v1/newsletter/unsubscribe", { id });
    return resp.data as { success: true; data: { already_unsubscribed: boolean } };
  } catch (error: any) {
    return handleApiError(error);
  }
}
