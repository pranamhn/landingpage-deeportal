import apiClient from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export async function getCurrentUser() {
  try {
    const resp = await apiClient.get("/v1/auth/me");
    return resp.data as { success: true; data: AuthUser | null };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function login(email: string, password: string) {
  try {
    const resp = await apiClient.post("/v1/auth/login", { email, password });
    return resp.data as { success: true; data: AuthUser };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function register(email: string, password: string, display_name: string) {
  try {
    const resp = await apiClient.post("/v1/auth/register", { email, password, display_name });
    return resp.data as { success: true; data: AuthUser };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function logout() {
  try {
    const resp = await apiClient.post("/v1/auth/logout");
    return resp.data as { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}
