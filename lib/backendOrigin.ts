/** Backend origin — safe for both server and client components. */
export const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? process.env.HOLDCO_BACKEND_ORIGIN ?? "http://127.0.0.1:8080";
