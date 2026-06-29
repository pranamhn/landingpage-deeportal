# Shared Types Reference

> How to keep types in sync across 3 repos (Python Flask + TypeScript Express + TypeScript Next.js)

## Problem
- backend-deeportal: Python dicts (no type safety)
- backend-swarm-deeportal: TypeScript strict types (`src/types/swarm.ts`)
- frontend-deeportal: TypeScript types (`types/swarm.ts`, `types/population.ts`)
- Every API change requires manual type sync across 3 repos

## Solution: Generate from OpenAPI

```
openapi.json (single source of truth)
  │
  ├──→ TypeScript types (auto-generated)
  │     Used by: backend-swarm, frontend
  │     Tool: openapi-typescript
  │
  └──→ Python type stubs (auto-generated)
        Used by: backend-deeportal
        Tool: openapi-python-client or datamodel-code-generator
```

## Current OpenAPI specs

| File | Endpoints | Location |
|------|-----------|----------|
| `openapi.json` | 16 Flask endpoints | backend-deeportal |
| `openapi.json` | 37 Swarm endpoints | backend-swarm-deeportal |

## Quick migration path

1. Generate TypeScript types from both openapi.json files
2. Replace hand-written types with generated ones
3. CI check: regenerate types on PR, fail if drift detected
