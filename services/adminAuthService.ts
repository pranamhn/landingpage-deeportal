export interface AdminAuthResult {
  success: boolean;
  message?: string;
}

async function postAdminJson(path: string, body: Record<string, string>): Promise<AdminAuthResult> {
  const form = new FormData();
  for (const [key, value] of Object.entries(body)) {
    form.set(key, value);
  }
  try {
    const response = await fetch(path, { method: "POST", body: form });
    const payload = await response.json().catch(() => ({
      success: false,
      message: "Respons server tidak valid.",
    }));
    if (!response.ok) {
      return { success: false, message: payload.message || `HTTP ${response.status}` };
    }
    return { success: payload.success === true, message: payload.message };
  } catch {
    return { success: false, message: "Gagal terhubung ke server." };
  }
}

export async function adminLogin(username: string, password: string): Promise<AdminAuthResult> {
  return postAdminJson("/api/admin/login", { username, password });
}

export async function adminLogout(): Promise<AdminAuthResult> {
  return postAdminJson("/api/admin/logout", {});
}
