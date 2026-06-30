# Performance Fixes Checklist — DeePortal
Date: 2026-06-30

## Backend (deeportal-backend-go)

### Query Optimization
- [x] LIMIT 50 on funding rounds in GetCompanyDetail()
- [x] LIMIT 30 on news events in GetCompanyDetail()
- [x] Batch investor query: N queries → 1 query per company detail
- [x] Trending: N+1 GetCompanyDetail() → single CompanySummary batch query
- [x] Company detail: ~56 queries → 8 queries total

### HTTP Layer
- [x] Gzip compression (fiber/middleware/compress)
- [x] Cache-Control: public, max-age=30, stale-while-revalidate=300 on all GET 200
- [x] All list endpoints capped at max 100

### Bug Fix
- [x] Missing /v1/people/:id endpoint → founders detail pages now work

## Frontend (landingpage-deeportal)

### Network / Caching
- [x] Google Fonts → next/font/google (self-hosted, non-blocking)
- [x] Backend API preconnect hint in HTML head
- [x] FilterPanel facets: cached 1 hour (unstable_cache)
- [x] ISR: revalidate=3600 on companies/[slug] and investors/[slug]
- [x] generateStaticParams: companies 50→500, investors 50→200

### Bundle / JavaScript
- [x] socket.io-client (IngestNotifier): lazy-loaded with next/dynamic (ssr: false)
- [x] Removes ~60KB gzipped from initial bundle

### Pagination — all ≤ 20
- [x] Companies: 24 → 20
- [x] Investors: 30 → 20
- [x] Funding: 25 → 20
- [x] Founders: 30 → 20
- [x] Acquisitions: 25 → 20
- [x] Community hubs: 100 → 20

### UI / UX
- [x] loading.tsx skeleton for companies/[slug]
- [x] Duplicate React key bug in FundingTimeline.tsx fixed
- [x] tailwind fontFamily.display uses CSS variable for next/font

## Impact Summary

| Metric | Before | After |
|--------|--------|-------|
| Company detail DB queries | ~56 | 8 |
| Company detail payload | 500KB-2MB | ~50-150KB (gzipped) |
| Trending queries | ~7000 | ~N scoring + 1 batch |
| Initial JS bundle | +60KB (socket.io) | Lazy loaded |
| Google Fonts | Blocking CDN | Self-hosted, swap |
| API responses | No cache | 30s + SWR 5min |
| FilterPanel facets | Every navigation | 1h cache |
| Static pages | 50 companies | 500 + ISR |
