import { cookies } from "next/headers";

const BACKEND_ORIGIN = process.env.HOLDCO_BACKEND_ORIGIN ?? "http://127.0.0.1:8080";
const ADMIN_SESSION_COOKIE = "holdco_admin_session";

export async function getStoredAdminSession() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
}

export async function setStoredAdminSession(sessionValue: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
}

export async function clearStoredAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

// ── JSON admin API (/api/v1/admin/*) ──

function extractSessionPair(setCookie: string | null) {
  if (!setCookie) return "";
  const match = setCookie.match(/session=[^;]+/);
  return match?.[0] ?? "";
}

export async function backendAdminLoginJson(username: string, password: string) {
  const response = await fetch(`${BACKEND_ORIGIN}/api/v1/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });
  const sessionValue = extractSessionPair(response.headers.get("set-cookie"));
  const payload = await response.json().catch(() => ({ success: false, message: "Respons backend tidak valid." }));
  return { ok: response.status === 200 && payload.success === true, sessionValue, status: response.status, message: payload.message };
}

export async function backendAdminLogoutJson() {
  await fetchAdminJson("/api/v1/admin/auth/logout", { method: "POST" });
}

export async function fetchAdminJson(path: string, init?: RequestInit) {
  const sessionValue = await getStoredAdminSession();
  let response: Response;
  try {
    response = await fetch(`${BACKEND_ORIGIN}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
        ...(sessionValue ? { Cookie: sessionValue } : {}),
      },
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, payload: { success: false, message: "Backend tidak dapat dijangkau. Coba lagi nanti." } };
  }
  const payload = await response.json().catch(() => ({ success: false, message: "Respons backend tidak valid." }));
  return { ok: response.ok && payload.success === true, status: response.status, payload };
}

export async function getBackendAdminJson<T>(path: string): Promise<{ ok: boolean; data: T | null; message?: string }> {
  const { ok, payload } = await fetchAdminJson(path);
  return { ok, data: ok ? (payload.data as T) : null, message: payload.message };
}

export async function postBackendAdminJson(path: string, body: Record<string, unknown>) {
  const { ok, status, payload } = await fetchAdminJson(path, { method: "POST", body: JSON.stringify(body) });
  return { ok, status, data: payload.data, message: payload.message };
}
