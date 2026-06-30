import axios from "axios";
import { normalizeHost } from "@/lib/client-host";

const baseURL = process.env.NEXT_PUBLIC_AUTH_API_URL;

const apiAuth = axios.create({
  baseURL: baseURL,
  headers: { 
    "Content-Type": "application/json",
    "X-Account-Type": "fms_company",
   },
});

// 🔹 Request Interceptor: Attach Authorization Token
apiAuth.interceptors.request.use(
  async (config) => {
    // KONDISI 1: SERVER SIDE (Server Actions / SSR)
    if (typeof window === "undefined") {
      const { cookies, headers } = await import("next/headers");
      const cookieStore = await cookies();
      const headerStore = await headers();

      // Ambil Token
      const token = cookieStore.get("app_token")?.value;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Ambil Host (Pengganti getClientForwardHost di Server)
      // Next.js menyimpan host asli di header 'host' atau 'x-forwarded-host'
      const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
      if (host) {
        
        config.headers["X-Forwarded-Host"] = normalizeHost(host); // Normalisasi host;
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

      const { origin } = window.location;
      if (origin) {
        config.headers["X-Forwarded-Host"] = origin;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response Interceptor: Handle 402 and Redirect to Logout
apiAuth.interceptors.response.use(
 
  (response) => response, // Pass successful responses
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      console.error("Session expired or unauthorized. Redirecting to logout...");
      //window.location.href = "/auth/login"; // ✅ Use window.location to redirect
    }
    return Promise.reject(error);
  }
);

export default apiAuth;
