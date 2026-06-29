/**
 * Unified API Proxy Configuration
 * Part of Deeportal — frontend-deeportal
 *
 * Unifies both backends under single /api/v1/* gateway
 *
 * Before (two proxies):
 *   /api/*          → Flask :8080
 *   /v1/swarm/*     → Express :5002
 *
 * After (unified):
 *   /api/v1/companies/*  → Flask :8080
 *   /api/v1/population/* → Flask :8080
 *   /api/v1/swarm/*      → Express :5002
 *   /api/v1/admin/*      → Flask :8080
 *
 * To apply: update next.config.js rewrites() with this configuration
 */

const API_PROXY_CONFIG = {
  // Flask backend (company data, admin, population)
  flask: {
    origin: process.env.HOLDCO_BACKEND_ORIGIN || "http://127.0.0.1:8080",
    paths: [
      "/api/v1/companies",
      "/api/v1/investors",
      "/api/v1/funding",
      "/api/v1/search",
      "/api/v1/trends",
      "/api/v1/submissions",
      "/api/v1/population",
      "/api/v1/admin",
      "/api/v1/auth",
    ],
  },
  // Swarm backend (AI predictions)
  swarm: {
    origin: process.env.NEXT_PUBLIC_SWARM_ORIGIN || "http://127.0.0.1:5002",
    paths: [
      "/api/v1/swarm/projects",
      "/api/v1/swarm/simulation",
      "/api/v1/swarm/report",
      "/api/v1/swarm/notifications",
      "/api/v1/swarm/admin",
      "/api/v1/swarm/enterprise",
      "/api/v1/swarm/replay",
      "/api/v1/swarm/playground",
      "/api/v1/swarm/marketplace",
      "/api/v1/swarm/population",
    ],
  },
};

// Usage in next.config.js:
// async rewrites() {
//   return [
//     ...API_PROXY_CONFIG.flask.paths.map(path => ({
//       source: `${path}/:path*`,
//       destination: `${API_PROXY_CONFIG.flask.origin}${path}/:path*`,
//     })),
//     ...API_PROXY_CONFIG.swarm.paths.map(path => ({
//       source: `${path}/:path*`,
//       destination: `${API_PROXY_CONFIG.swarm.origin}/api/swarm${path.replace('/api/v1/swarm', '')}/:path*`,
//     })),
//   ];
// }

export default API_PROXY_CONFIG;
