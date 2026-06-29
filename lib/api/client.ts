import axios from "axios";

// In the browser, "/api" goes through Next's rewrite proxy (same-origin, cookies attach
// automatically). During SSR there is no origin to resolve a relative URL against, so
// server-rendered requests must hit the backend directly.
const baseURL = typeof window === "undefined"
  ? `${process.env.BACKEND_URL || process.env.HOLDCO_BACKEND_ORIGIN || "http://127.0.0.1:8080"}/api`
  : "/api";

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export default apiClient;
