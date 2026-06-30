import axios from "axios";
import { getClientForwardHost, normalizeHost } from "@/lib/client-host";

const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";

const baseURL = isDev
  ? process.env.HOLDCO_BACKEND_ORIGIN + "/api" || "http://localhost:8080/api"
  : process.env.NEXT_PUBLIC_GATEWAY_API_URL || "http://localhost:9999/api";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-Account-Type": "fms_company",
  },
});

// 🔹 Proxy prefix for production (via API gateway)
api.interceptors.request.use((config) => {
  if (!isDev) {
    config.url = "/proxy/v1/service_deeportal" + (config.url || "").replace(/^\/v1/, "");
  }
  return config;
});

// 🔹 Request Interceptor: Attach Authorization Token
api.interceptors.request.use(
  async (config) => {
    // KONDISI 1: SERVER SIDE (Server Components / Server Actions)
    if (typeof window === "undefined") {
      const { cookies, headers } = await import("next/headers");
      const cookieStore = await cookies();
      const headerStore = await headers();

      // Ambil Token
      const token = cookieStore.get("app_token")?.value;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Ambil Host
      const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
      if (host) {
        config.headers["X-Forwarded-Host"] = normalizeHost(host);
      }
    }
    // KONDISI 2: CLIENT SIDE
    else {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("app_token="))
        ?.split("=")[1];

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      config.headers["X-Forwarded-Host"] = getClientForwardHost();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      if (typeof window !== "undefined") {
        if (window.location.pathname !== "/auth/logout" && window.location.pathname !== "/auth/login") {
          window.location.href = "/auth/logout";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
