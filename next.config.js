import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  async redirects() {
    return [
      // /about sekarang punya page.tsx asli (app/about/page.tsx) — arahnya
      // dibalik dari sebelumnya supaya link/bookmark lama ke /content/about
      // tetap jalan, bukan 404.
      { source: "/content/about", destination: "/about", permanent: true },
      { source: "/methodology", destination: "/content/methodology", permanent: true },
      { source: "/sources", destination: "/content/sources", permanent: true },
      { source: "/privacy", destination: "/content/privacy", permanent: true },
      { source: "/terms", destination: "/content/terms", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;
