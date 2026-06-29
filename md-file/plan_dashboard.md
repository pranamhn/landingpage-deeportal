# Admin Dashboard — Sidebar Menu & Sub-Menu Plan

## 1. Current State Audit

| Aspect | Current | Gap |
|---|---|---|
| Sidebar | Flat 5-item list in `AdminShell.tsx` | No grouping, no collapsible sub-menus |
| Sub-navigation | Entity tabs inside `DataQualityTabsClient` (local component) | Inconsistent — some pages use internal tabs, some don't |
| Missing pages | Pipeline, Commands, Backups, Enrichment have backend APIs but no frontend pages | Dead API endpoints with no UI |
| Mobile | Sidebar hidden (`hidden lg:block`), no hamburger toggle | Mobile users have no nav at all |
| Breadcrumbs | None | User can get lost in deep pages |
| Badges/counts | Not on sidebar items | No visibility of pending work (moderation queue, DQ issues) |

---

## 2. Proposed Sidebar Menu Structure

```
┌─────────────────────────────────────┐
│  DEEPORTAL  ────  [Public] [Logout] │  ← sticky header (keep)
├──────────┬──────────────────────────┤
│          │                          │
│ SIDEBAR  │  MAIN CONTENT            │
│          │                          │
│ ──────── │                          │
│ 📊 DASHBOARD                        │
│   Overview                          │
│          │                          │
│ ──────── │                          │
│ 📥 INGEST                           │
│   Ingestion                         │
│   Moderation                        │
│          │                          │
│ ──────── │                          │
│ 📋 DATA MANAGEMENT                  │
│   Companies                         │
│   Founders                          │
│   Investors                         │
│   Lists                             │
│   Submissions                       │
│   Data Quality                      │
│          │                          │
│ ──────── │                          │
│ ⚙️ ENGINE                           │
│   Status                            │
│   Commands                          │
│   Pipelines                         │
│   Enrichment                        │
│          │                          │
│ ──────── │                          │
│ 🛠 SYSTEM                           │
│   Backups                           │
│   Logs                              │
│          │                          │
└──────────┴──────────────────────────┘
```

### 2.1 Group Definitions

#### 📊 DASHBOARD
| Item | Route | Icon | Description |
|---|---|---|---|
| Overview | `/admin` | 4-square grid | Main KPI dashboard (existing) |

#### 📥 INGEST
| Item | Route | Icon | Description |
|---|---|---|---|
| Ingestion | `/admin/ingestion` | Download arrow | Ingestion runs, source health (existing) |
| Moderation | `/admin/moderation` | Flag | Review submissions queue (existing) |

#### 📋 DATA MANAGEMENT (new grouping — pulls entity tabs OUT of DataQualityTabsClient into sidebar)
| Item | Route | Icon | Description |
|---|---|---|---|
| Companies | `/admin/data/companies` | Building | Companies table with inline edit, completeness score, merge/dedup |
| Founders | `/admin/data/founders` | User | Founders table (same pattern as companies) |
| Investors | `/admin/data/investors` | Trending up | Investors table |
| Lists | `/admin/data/lists` | List | Curated lists |
| Submissions | `/admin/data/submissions` | Inbox | User submissions table |
| Data Quality | `/admin/data-quality` | Shield-check | DQ issues dashboard (dupes, missing, conflicts, stale, source-issues, failures) |

> **Rationale:** Currently, Companies/Founders/Investors/Lists/Submissions are tabs *inside* the Data Quality page (`DataQualityTabsClient`). This makes the sidebar flat and hides entity-level actions. Promoting each entity to its own sidebar item with a dedicated route:
> - Makes each entity directly linkable/bookmarkable
> - Removes one level of nesting (no more "click Data Quality → then click Companies")
> - Allows per-entity breadcrumbs and deep-linking
> - The old `/admin/data-quality` route becomes the "DQ Issues" dashboard only (duplicates, missing, conflicts, stale, source-issues, failures)

#### ⚙️ ENGINE
| Item | Route | Icon | Description |
|---|---|---|---|
| Status | `/admin/engine` | CPU | Engine status panel (existing) |
| Commands | `/admin/engine/commands` | Terminal | Command control room (existing, was inside engine tabs) |
| Pipelines | `/admin/engine/pipelines` | Git-branch | Pipeline management (NEW page, backend endpoint exists) |
| Enrichment | `/admin/engine/enrichment` | Sparkles | Enrichment status & trigger (NEW page, backend endpoints exist) |

#### 🛠 SYSTEM
| Item | Route | Icon | Description |
|---|---|---|---|
| Backups | `/admin/system/backups` | Database | Database backup management (NEW page, backend endpoint exists) |
| Logs | `/admin/system/logs` | File-text | Engine logs viewer (existing, was inside engine tabs) |

---

## 3. Component Architecture

### 3.1 New Component: `<AdminSidebar>`

Extract sidebar from `AdminShell.tsx` into its own client component.

**File:** `frontend/components/admin/layout/AdminSidebar.tsx`

**Props:** none (reads `usePathname()` internally)

**Features:**
- Collapsible groups (accordion-style)
- Active item highlight with left accent bar (keep existing visual)
- Badge counts for pending items (moderation queue count, DQ issues count)
- Collapse/expand toggle (mini mode: icons only, expand on hover)
- Keyboard navigation (arrow keys, Enter)

**States:**
- **Default:** Full sidebar with labels
- **Collapsed:** 56px wide, icons only, group labels hidden, tooltips on hover
- **Mobile:** Slide-in drawer overlay triggered by hamburger button in header

### 3.2 New Component: `<AdminBreadcrumb>`

**File:** `frontend/components/admin/layout/AdminBreadcrumb.tsx`

**Features:**
- Auto-generated from pathname segments
- Home icon → current page
- Each segment is a link (except last)
- Matches sidebar active state

### 3.3 Updated Component: `<AdminShell>`

Changes to `AdminShell.tsx`:
- Replace inline `<aside>` with `<AdminSidebar>` component
- Add mobile hamburger toggle in header
- Add `<AdminBreadcrumb>` above `<main>` content
- Pass sidebar collapsed state as React context for content area to use

### 3.4 New Route Pages (to populate new sidebar items)

These pages already have backend API endpoints — they just need frontend pages:

| Route | New File | Backend API |
|---|---|---|
| `/admin/data/companies` | `frontend/app/admin/(dashboard)/data/companies/page.tsx` | `GET /api/v1/admin/tables/companies` + completeness, merge, bulk-delete |
| `/admin/data/founders` | `frontend/app/admin/(dashboard)/data/founders/page.tsx` | `GET /api/v1/admin/tables/founders` |
| `/admin/data/investors` | `frontend/app/admin/(dashboard)/data/investors/page.tsx` | `GET /api/v1/admin/tables/investors` |
| `/admin/data/lists` | `frontend/app/admin/(dashboard)/data/lists/page.tsx` | `GET /api/v1/admin/tables/lists` |
| `/admin/data/submissions` | `frontend/app/admin/(dashboard)/data/submissions/page.tsx` | `GET /api/v1/admin/tables/submissions` |
| `/admin/engine/commands` | `frontend/app/admin/(dashboard)/engine/commands/page.tsx` | `POST /api/admin/commands/execute`, `POST /api/admin/commands/stop` |
| `/admin/engine/pipelines` | `frontend/app/admin/(dashboard)/engine/pipelines/page.tsx` | `GET /api/admin/pipeline` |
| `/admin/engine/enrichment` | `frontend/app/admin/(dashboard)/engine/enrichment/page.tsx` | `GET /api/admin/enrichment/status`, `POST /.../start`, `POST /.../stop` |
| `/admin/system/backups` | `frontend/app/admin/(dashboard)/system/backups/page.tsx` | `GET /api/admin/system/backup` |
| `/admin/system/logs` | `frontend/app/admin/(dashboard)/system/logs/page.tsx` | `GET /api/admin/engine/logs` |

Each entity page (`/admin/data/*`) reuses the existing `<AdminDataTable>` component that's currently inside `DataQualityTabsClient`. The DQ issues tabs move to the standalone `/admin/data-quality` page using `<AdminDataQualityTabs>`.

---

## 4. Visual Design Spec

### 4.1 Sidebar

```
┌─────────────────────────┐
│ [🍔]  DEEPORTAL  [🔔]   │  ← header (existing, add hamburger)
├─────────────────────────┤
│                         │
│  ┌─────────────────────┐│
│  │ 📊 DASHBOARD    [−] ││  ← group header (clickable accordion)
│  │   ══ Overview       ││  ← active: accent bar + bg-brand-50
│  │     Ingestion       ││  ← inactive: gray
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 📥 INGEST       [+] ││  ← collapsed group
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 📋 DATA MGMT    [−] ││
│  │     Companies   [3] ││  ← badge: pending dupes/issues count
│  │     Founders        ││
│  │     Investors       ││
│  │     Lists           ││
│  │     Submissions [12]││  ← badge: pending review count
│  │     Data Quality[5] ││  ← badge: open DQ issues count
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ ⚙️ ENGINE       [+] ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 🛠 SYSTEM       [+] ││
│  └─────────────────────┘│
│                         │
│  ─────────────────────  │
│  [ ≪ ]  Collapse       │  ← collapse toggle button
│                         │
└─────────────────────────┘
```

### 4.2 Collapsed State (Mini Sidebar)

```
┌────┐
│ 📊 │  ← icon only, tooltip on hover: "Dashboard"
│ 📥 │
│ 📋 │
│ ⚙️ │
│ 🛠 │
│    │
│ ≫  │  ← expand button
└────┘
```

### 4.3 Design Tokens (extend `adminTheme.ts`)

```ts
// Sidebar tokens
sidebarWidth: "w-60"           // expanded width: 240px
sidebarCollapsedWidth: "w-14"  // collapsed width: 56px
sidebarBg: "bg-white"
sidebarBorder: "border-r border-gray-200"

// Group header
sidebarGroupHeader: "flex items-center justify-between px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"

// Nav item
sidebarItem: "relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
sidebarItemActive: "bg-brand-50 text-brand-700"
sidebarItemInactive: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"

// Accent bar
sidebarAccentBar: "absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-600"

// Badge
sidebarBadge: "ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-100 px-1.5 text-[11px] font-bold text-brand-700"

// Collapse button
sidebarCollapseButton: "flex w-full items-center justify-center gap-2 border-t border-gray-100 px-3 py-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
```

### 4.4 Breadcrumb

```
Home  /  Data Management  /  Companies
 ───      ──────────────      ─────────
gray      gray link           black bold (current)
```

Minimal, below header, above page content. Hidden on the Overview page (depth 1).

---

## 5. UX Improvements (Suggestions)

### 5.1 Sidebar Persistence
- Save collapsed state to `localStorage` so it persists across page reloads.
- Key: `admin_sidebar_collapsed`

### 5.2 Group Auto-Expand
- Auto-expand the group containing the current active route.
- Collapsed groups stay collapsed unless they contain the active page.
- On first load, all groups start collapsed except the one with the active route.

### 5.3 Badge Counts (Live)
- **Moderation:** Fetch pending submission count from backend on mount + every 60s.
- **Data Quality:** Fetch open DQ issues count.
- **Submissions:** Pending submissions count.
- Badges use `useEffect` + `setInterval` inside `<AdminSidebar>`.

### 5.4 Mobile Drawer
- Hamburger button visible on `<lg` breakpoints.
- Click opens a slide-in overlay drawer from the left.
- Backdrop overlay (semi-transparent black) behind drawer.
- Close on backdrop click, Escape key, or nav item click.
- Uses `<dialog>` element or Radix-style portal for accessibility.

### 5.5 Keyboard Shortcuts
| Key | Action |
|---|---|
| `Ctrl + \` | Toggle sidebar collapse |
| `Ctrl + 1-5` | Jump to group 1-5 |
| `/` | Focus search/filter (if added later) |

### 5.6 Breadcrumb + Page Title Unification
- The `<AdminPageHeader>` title should match the breadcrumb's last segment.
- Consider passing the title from the sidebar config (single source of truth) instead of hardcoding in each page.

### 5.7 Active Sub-Menu Indicator
- When a sub-item is active, its parent group header stays highlighted (subtle bg or dot indicator).
- The accordion chevron rotates when the group is open.

### 5.8 Loading Skeletons
- Each new entity page gets a `loading.tsx` (Next.js file convention) reusing the existing `AdminDataTable` skeleton pattern from `frontend/app/admin/(dashboard)/data-quality/loading.tsx`.

---

## 6. Implementation Sequence

### Phase 1 — Sidebar Component (no route changes)
1. Create `AdminSidebar.tsx` with grouped accordion structure
2. Extract nav items into a shared config constant (`adminNavConfig.ts`)
3. Update `AdminShell.tsx` to use `<AdminSidebar>`
4. Add collapse/expand toggle + localStorage persistence
5. Add mobile hamburger + drawer
6. Keep existing routes untouched — groups just reorganize the flat list

### Phase 2 — Breadcrumb
7. Create `AdminBreadcrumb.tsx`
8. Add to `AdminShell.tsx` below header

### Phase 3 — New Entity Pages
9. Create `/admin/data/companies` page (extract from `DataQualityTabsClient`)
10. Create `/admin/data/founders` page
11. Create `/admin/data/investors` page
12. Create `/admin/data/lists` page
13. Create `/admin/data/submissions` page
14. Simplify `DataQualityTabsClient` → standalone DQ Issues page at `/admin/data-quality`

### Phase 4 — New Engine/System Pages
15. Create `/admin/engine/commands` page (extract from engine page)
16. Create `/admin/engine/pipelines` page
17. Create `/admin/engine/enrichment` page
18. Simplify `/admin/engine` → status-only page
19. Create `/admin/system/backups` page
20. Create `/admin/system/logs` page (extract from engine page)

### Phase 5 — Polish
21. Add badge counts (moderation, DQ issues, pending submissions)
22. Add keyboard shortcuts
23. Add loading skeletons for all new pages
24. Add error boundaries for new route segments

---

## 7. File Changes Summary

### New Files
| File | Purpose |
|---|---|
| `frontend/components/admin/layout/AdminSidebar.tsx` | Sidebar component |
| `frontend/components/admin/layout/AdminBreadcrumb.tsx` | Breadcrumb component |
| `frontend/lib/adminNavConfig.ts` | Shared nav config constant |
| `frontend/app/admin/(dashboard)/data/companies/page.tsx` | Companies entity page |
| `frontend/app/admin/(dashboard)/data/founders/page.tsx` | Founders entity page |
| `frontend/app/admin/(dashboard)/data/investors/page.tsx` | Investors entity page |
| `frontend/app/admin/(dashboard)/data/lists/page.tsx` | Lists entity page |
| `frontend/app/admin/(dashboard)/data/submissions/page.tsx` | Submissions entity page |
| `frontend/app/admin/(dashboard)/engine/commands/page.tsx` | Engine commands page |
| `frontend/app/admin/(dashboard)/engine/pipelines/page.tsx` | Pipelines page |
| `frontend/app/admin/(dashboard)/engine/enrichment/page.tsx` | Enrichment page |
| `frontend/app/admin/(dashboard)/system/backups/page.tsx` | System backups page |
| `frontend/app/admin/(dashboard)/system/logs/page.tsx` | System logs page |
| Each new page gets a `loading.tsx` sibling | Loading skeletons |

### Modified Files
| File | Change |
|---|---|
| `frontend/components/admin/layout/AdminShell.tsx` | Use `<AdminSidebar>`, add breadcrumb, hamburger |
| `frontend/components/admin/ui/adminTheme.ts` | Add sidebar design tokens |
| `frontend/app/admin/(dashboard)/data-quality/page.tsx` | Simplify to DQ issues only |
| `frontend/app/admin/(dashboard)/data-quality/DataQualityTabsClient.tsx` | Remove entity tabs, keep only DQ issues |
| `frontend/app/admin/(dashboard)/engine/page.tsx` | Simplify to engine status only |
| `frontend/app/admin/(dashboard)/layout.tsx` | Optionally add sidebar context provider |

### Removed Files (after extraction, old code becomes dead)
- Entity tab logic from `DataQualityTabsClient.tsx` (keeps only DQ issues)
- Inline engine tabs from engine page (extracted to `/engine/commands`, `/engine/logs`)

---

## 8. Per-Page Detailed Plans

### 8.1 📊 DASHBOARD → Overview (`/admin`)

**Status:** Existing — server component.

**Current layout:**
```
┌────────────────────────────────────────────┐
│ AdminPageHeader (eyebrow, title, pills)     │
├────────────────────────────────────────────┤
│ AdminStatsGrid (KPI cards)                  │
├────────────────┬──────────┬────────────────┤
│ BarChart       │ Donut    │ Donut          │
│ (Sector)       │ (Status) │ (Stage)        │
├────────────────┴──────────┴────────────────┤
│ TimelineSection (funding + news timeline)   │
├────────────────────────────────────────────┤
│ Recent Funding Rounds (list)                │
├────────────────────────────────────────────┤
│ Top Funded Companies (table)                │
├──────────────┬──────────────┬──────────────┤
│ Acquisitions │ Top Investors│ Top News     │
├──────────────┴──────────────┴──────────────┤
│ Ingestion/Cost Summary │ Recent Activity   │
└────────────────────────────────────────────┘
```

**Data sources:**
| Data | API |
|---|---|
| All stats | `getAdminStats()` → `GET /api/v1/admin/overview` |
| Sub-fields | `counts`, `sectors`, `statuses`, `funding_timeline`, `news_timeline`, `ingestion`, `cost`, `portfolio`, `auto`, `ingest`, `activity`, `top_funded`, `funding_by_stage`, `freshness`, `recent_acquisitions`, `top_investors`, `top_news_companies`, `recent_funding` |

**States:**
| State | Handling |
|---|---|
| Loading | `loading.tsx` skeleton (existing) — KPI card placeholders + chart skeletons |
| Empty | Each section has conditional render: `(top_funded ?? []).length > 0 && ...` |
| Error | `error.tsx` boundary (existing) — reset button, also resets auto-refresh backoff |
| Partial data | Each sub-section independently checks array lengths; shows "No data" fallback |

**UX Improvements:**
- Add "Last updated" timestamp in page header
- Add quick-jump anchor links at top: `#charts | #funding | #activity`
- Add period filter (7d/30d/90d) that persists to URL search params — currently timeline has its own filter inside the card
- Add "Export CSV" for Top Funded table
- Make KPI cards clickable → navigate to relevant detail page (e.g., "Companies" count → `/admin/data/companies`)

---

### 8.2 📥 INGEST → Ingestion (`/admin/ingestion`)

**Status:** Existing — server component.

**Current layout:**
```
┌────────────────────────────────────────────┐
│ AdminAutoRefresh (30s)                      │
│ AdminPageHeader (eyebrow, title, pills)     │
├────────────────────────────────────────────┤
│ IngestionProgressBar (current run)          │
├──────┬──────┬──────┬───────────────────────┤
│ Total│ Proc │ Fail │ Pending (4 stat cards) │
├──────┴──────┴──────┴───────────────────────┤
│ Source Health Grid │ Articles Timeline      │
├────────────────────────────────────────────┤
│ Source Breakdown Table                      │
├────────────────────────────────────────────┤
│ AdminIngestionTabs (Runs/Articles/Errors)   │
└────────────────────────────────────────────┘
```

**Data sources:**
| Data | API |
|---|---|
| Ingestion full data | `getIngestionFullData()` → `GET /api/v1/admin/ingestion` |
| Ingest running status | `getAdminStats().ingest` |
| Sections + details | `{ sections, details }` with `source_health`, `source_breakdown`, `articles_timeline`, `current_run` |

**Edge cases:**
- `source_health` may be empty → fallback to `source_breakdown` for health cards
- `current_run` may be null → progress bar shows "No active run"
- `articles_timeline` may be empty → "No timeline data yet"
- Error tab auto-selected if errors exist, else articles tab if danger items exist, else runs tab

**UX Improvements:**
- Add "Force Refresh" button (bypass auto-refresh interval)
- Add per-source "View Articles" link that pre-filters the Articles tab
- Add source health trend sparkline (last 7 runs) — currently only shows last fetch/success at a glance
- Add "Download Error Log" button for the Errors tab
- Color-code the source breakdown table rows by success rate (already green/amber/red, good)

---

### 8.3 📥 INGEST → Moderation (`/admin/moderation`)

**Status:** Existing — client component.

**Current layout:**
```
┌────────────────────────────────────────────┐
│ AdminAutoRefresh (30s)                      │
│ AdminPageHeader (eyebrow, title, pills)     │
├────────────────────────────────────────────┤
│ ModerationFilterBar (status, kind, search)  │
├────────────────────────────────────────────┤
│ [Card 1]                                    │
│ ┌─ Source Context ─┬─ Facts ─┬─ Action ──┐ │
│ │ ...              │ ...     │ Accept/    │ │
│ │                  │         │ Reject     │ │
│ └──────────────────┴─────────┴───────────┘ │
│ [Card 2] ...                                │
├────────────────────────────────────────────┤
│ Pagination (Prev / Page N / Next)           │
└────────────────────────────────────────────┘
```

**Data sources:**
| Data | API |
|---|---|
| Moderation items | `fetch(BACKEND_ORIGIN + /api/v1/admin/moderation?status=&kind=&search=&page=)` |
| Review action | `POST /api/v1/admin/moderation/review` |

**Filter params:** `status`, `kind`, `search`, `page`

**States:**
| State | Handling |
|---|---|
| Loading | "Loading..." centered text |
| Empty | `AdminEmptyState` with "Queue moderation kosong" |
| Error | Silent — keeps stale data (`catch { }` empty) |
| Pending action | Button shows "..." via `pendingDecisions` Set |

**UX Improvements:**
- Add bulk accept/reject (select multiple cards → one action)
- Add keyboard shortcuts: `j`/`k` to navigate cards, `a` to accept, `r` to reject
- Add "Skip" action (not just accept/reject) — useful for ambiguous submissions
- Add filter presets: "Pending only", "Last 24h", "By entity type"
- Cache last filter state in URL search params so refresh preserves it
- Show submission age ("3h ago") with color indicator (red if >24h pending)
- Add diff view: highlight changed fields when editing existing entity vs new submission

---

### 8.4 📋 DATA MANAGEMENT → Companies (`/admin/data/companies`)

**Status:** NEW — extracted from `DataQualityTabsClient` entity sidebar.

**Layout plan:**
```
┌────────────────────────────────────────────┐
│ AdminPageHeader                             │
│ eyebrow: "Data Management"                  │
│ title: "Companies"                          │
│ description: "Manage company profiles..."   │
│ pills: [total count] [completeness avg%]    │
├────────────────────────────────────────────┤
│ AdminTableToolbar                           │
│ [Search...] [Filter] [⚙ Columns] [↓ CSV]  │
├────────────────────────────────────────────┤
│ AdminDataTable (companies)                  │
│ ☑ | Created | Name | Score | Sector | ... │
│ ☐ | ...     | ...  | 85%   | Fintech| ... │
├────────────────────────────────────────────┤
│ AdminTablePagination                        │
│ Showing 1–25 of 1,234                       │
└────────────────────────────────────────────┘
```

**Data sources:**
| Data | API |
|---|---|
| Table rows | `GET /api/v1/admin/tables/companies?per_page=25&page=&sort=&search=` |
| Completeness summary | `GET /api/v1/admin/tables/companies/completeness-summary` |
| Inline edit | `PUT /api/v1/admin/tables/companies` (rowId in body) |
| Merge | `POST /api/v1/admin/tables/companies/merge` |
| Bulk delete | `POST /api/v1/admin/tables/companies/bulk-delete` |

**Columns (9):** `Created Date` (first_seen_at), `Name`, `Score` (completeness %), `Sector`, `Location`, `Founded`, `Status`, `Website`, `Updated`

**States:**
| State | Handling |
|---|---|
| Loading | Skeleton table rows (reuse `loading.tsx` pattern from data-quality) |
| Empty | `AdminEmptyState`: "No companies found" with "Import from CSV" CTA |
| Error | Error boundary with retry |
| No search results | "No companies match 'xyz'. Clear search?" with clear button |
| Edit conflict | If row was modified by another admin during inline edit → show toast "This record was updated by another user. Refresh?" |

**Inline Edit UX:**
- Click cell → input field with Save/Cancel buttons
- Enter = Save, Escape = Cancel
- Optimistic update (update UI immediately, revert on API error)
- Show subtle success checkmark animation on save

**Merge Flow (existing in `DuplicateDecisionCard`):**
- Select 2+ rows via checkbox → "Merge Selected" button appears in toolbar
- Modal: side-by-side comparison of Profile A vs Profile B
- Decision: Pick A / Pick B / Skip
- Confirmation dialog before executing merge via API

**Bulk Delete Flow:**
- Select rows → "Delete Selected (N)" button
- Confirmation modal: "Delete N companies? This cannot be undone."
- Execute via `POST /api/v1/admin/tables/companies/bulk-delete`

**UX Improvements:**
- Add "Quick filter" chips above table: `[Active] [Acquired] [IPO] [Closed]`
- Add column visibility toggle (show/hide columns, persist to localStorage)
- Add row detail expand — click row to see full profile preview (funding rounds, investors, news) as inline expand
- Add "Open public profile" link icon per row → `/companies/[slug]`
- Add completeness score tooltip: breakdown of which fields are filled/missing
- Add "Export filtered results" CSV (respects current search/filter)

---

### 8.5 📋 DATA MANAGEMENT → Founders (`/admin/data/founders`)

**Status:** NEW — extracted from `DataQualityTabsClient`.

**Layout:** Same pattern as Companies page (AdminTableToolbar + AdminDataTable + Pagination).

**Columns (7):** `Created Date` (recorded_at), `Name`, `Score`, `Role`, `Company`, `Email`, `LinkedIn`

**Note:** Founders use `recorded_at` (when the company_people relation was recorded), not `people.id` creation timestamp — because `people` table has no creation timestamp.

**UX Improvements:**
- Show associated company as a link → `/admin/data/companies?search=<company_name>`
- Add "Find unlinked founders" filter (founders with no company association)

---

### 8.6 📋 DATA MANAGEMENT → Investors (`/admin/data/investors`)

**Status:** NEW — extracted from `DataQualityTabsClient`.

**Layout:** Same pattern.

**Columns (9):** `Created Date` (first_seen_at), `Name`, `Score`, `Type`, `Location`, `Website`, `Total Investments`, `Portfolio Companies`, `Updated`

**UX Improvements:**
- Portfolio count as link → filtered view of their investments
- Add "Top investors by round count" quick sort
- Investor type distribution pie chart as optional header widget

---

### 8.7 📋 DATA MANAGEMENT → Lists (`/admin/data/lists`)

**Status:** NEW — extracted from `DataQualityTabsClient`.

**Layout:** Same pattern.

**Columns (5):** `Name`, `Description`, `Companies Count`, `Created`, `Updated`

**UX Improvements:**
- Click list name → expand to show member companies inline
- "Create New List" button in toolbar → modal with name, description, company picker
- Drag-and-drop reorder of companies within a list

---

### 8.8 📋 DATA MANAGEMENT → Submissions (`/admin/data/submissions`)

**Status:** NEW — extracted from `DataQualityTabsClient`.

**Layout:** Same pattern.

**Columns (6):** `Reference`, `Kind`, `Status`, `Entity`, `Source URL`, `Created`

**UX Improvements:**
- Status filter chips: `[Pending] [Accepted] [Rejected]`
- Click row → opens moderation review card inline (same as /admin/moderation)
- "Review All Pending" button → navigates to /admin/moderation with pre-filter

---

### 8.9 📋 DATA MANAGEMENT → Data Quality (`/admin/data-quality`)

**Status:** Modified — was the parent of everything, now becomes DQ issues-only dashboard.

**Layout plan:**
```
┌────────────────────────────────────────────┐
│ AdminPageHeader                             │
│ eyebrow: "Data Quality"                     │
│ title: "DQ Issues Dashboard"                │
│ description: "Duplicates, missing fields..." │
│ pills: [N open issues] [last scan: X ago]   │
├────────────────────────────────────────────┤
│ AdminDataQualityTabs (7 sub-tabs)           │
│ [Actions] [Dupes] [Missing] [Conflicts]    │
│ [Stale] [Sources] [Failures]               │
├────────────────────────────────────────────┤
│ Tab content:
│ - Actions: DuplicateScanForm + ManualMergeForm │
│ - Others: AdminQueueItemCard list            │
└────────────────────────────────────────────┘
```

**Data sources:**
| Data | API |
|---|---|
| DQ sections | `getDataQualityFromJson()` → `GET /api/v1/admin/data-quality` |
| Scan dupes | `POST /api/v1/admin/data-quality/scan-dupes` |
| Merge | `POST /api/v1/admin/data-quality/merge` |
| Skip | `POST /api/v1/admin/data-quality/skip` |

**Tab details (7 sub-tabs via `?tab=` URL param):**
| Tab | Content | Empty state |
|---|---|---|
| Actions | `DuplicateScanForm` (threshold slider + scan button) + `ManualMergeForm` (primary ID + duplicate ID inputs) | N/A (always visible) |
| Duplicates | `AdminQueueItemCard` list from `duplicateSection` | "Queue duplicate kosong. Klik scan..." |
| Missing | Cards from `missingSection` | "Belum ada profil dengan missing field" |
| Conflicts | Cards from `conflictsSection` | "Belum ada konflik data funding" |
| Stale | Cards from `staleSection` | "Belum ada profil stale" |
| Source Issues | Cards from `sourceSection` | "Belum ada masalah source URL" |
| Failures | Cards from `failuresSection` | "Tidak ada extraction failure" |

**Edge cases:**
- Duplicate scan threshold must be between 0.5–1.0 (default 0.84)
- Merge requires both primary_id and duplicate_id to exist
- Tab state persisted in URL `?tab=` query param — survives refresh and shareable

**UX Improvements:**
- Add "Last scan" timestamp and "Scan Now" button always visible at top
- Add severity summary bar: count per severity level (danger/warning/info) as colored segments
- Add "Resolve All" bulk action per category (with confirmation)
- Auto-refresh DQ data every 60s when tab is active
- Add notification badge in sidebar when new DQ issues detected since last visit

---

### 8.10 ⚙️ ENGINE → Status (`/admin/engine`)

**Status:** Modified — was the full engine page, now becomes status-only (log viewer and command room move to their own pages).

**Layout plan:**
```
┌────────────────────────────────────────────┐
│ AdminPageHeader                             │
│ eyebrow: "Engine Control"                   │
│ title: "System Status"                      │
│ pills: [auto: running/idle] [db: ok/error]  │
├────────────────────────────────────────────┤
│ Range selector [30m|1h|6h|12h|24h|7d|30d]  │
├──────┬──────┬──────┬───────────────────────┤
│ Runs │Result│ Cost │ Budget (editable)     │
├──────┴──────┴──────┴───────────────────────┤
│ Totals (News|Companies|Investors|Founders)  │
├────────────────────────────────────────────┤
│ Service Status Cards (4)                    │
│ [Ingest] [Enrich Co.] [Enrich Inv] [Enrich │
│  Run/Stop buttons                           │
│  Founders] Run/Stop                         │
└────────────────────────────────────────────┘
```

**Data sources:**
| Data | API |
|---|---|
| Engine status | `GET /api/admin/engine/status?range=` |
| Budget | `GET /api/admin/engine/budget` → `POST /api/admin/engine/budget` |
| Start/Stop ingest | `POST /api/admin/ingestion/start`, `/stop` |
| Start/Stop enrich | `POST /api/admin/enrichment/start`, `/stop` (body: `{ which: "companies"|"investors"|"people" }`) |

**States:**
| State | Handling |
|---|---|
| Loading | "Loading engine status..." centered |
| Error | Red error card with message; if 401 → "session may have expired, log in again" link |
| Budget exceeded | Red border on budget card, "Cap reached — pipelines pause until tomorrow" |
| Service running | Green pulsing dot, "Stop" button |
| Service stopped | Gray dot, "Run now" button |
| Pending action | Button shows "..." disabled |

**UX Improvements:**
- Add "System Uptime" display (time since last restart)
- Add database size display (holdco.db file size in MB)
- Add schema version badge
- Add backup count indicator
- Budget card: add 7-day spending trend sparkline
- Service cards: add "Last run duration" and "Last run result" info
- Add WebSocket connection status indicator (green dot = connected to SocketIO)

---

### 8.11 ⚙️ ENGINE → Commands (`/admin/engine/commands`)

**Status:** NEW — extracted from `AdminEngineControlRoom` on the engine page.

**Layout plan:**
```
┌────────────────────────────────────────────┐
│ AdminPageHeader                             │
│ eyebrow: "Engine Control"                   │
│ title: "Command Center"                     │
│ description: "Run maintenance commands..."  │
├────────────────────────────────────────────┤
│ ── Data Quality ──                          │
│ [Dedupe Funding] [Merge Similar] [Merge    │
│  PT/Tbk] [Find Dupes]                       │
├────────────────────────────────────────────┤
│ ── Backfill ──                              │
│ [Backfill Dates] [Backfill Country]         │
│ [Derive Investor Stats] [Backup DB]         │
├────────────────────────────────────────────┤
│ ── Operations ──                            │
│ [Check DB] [Run Tests] [TypeScript Check]   │
│ [Show Stats]                                │
├────────────────────────────────────────────┤
│ Output Panel (per-command result)            │
│ ┌─ Command Name ───────────────── [Clear] ─┐│
│ │ output text...                            ││
│ │ timestamp                                 ││
│ └───────────────────────────────────────────┘│
└────────────────────────────────────────────┘
```

**Command groups (from existing `COMMANDS` array):**
| Group | Commands |
|---|---|
| Data Quality | `dedupe-funding`, `merge-similar-funding`, `merge-legal-affix-dupes`, `find-dupes` |
| Backfill | `backfill-dates`, `backfill-country`, `derive-investor-stats`, `backup` |
| Operations | `check-db`, `tests`, `typecheck`, `stats` |

**Command states:**
| State | Button | Visual |
|---|---|---|
| Idle | "Execute" (brand) | Normal card |
| Pending (request in flight) | "Running..." (disabled) | — |
| Active (running on server) | "Stop" (red, pulsing amber dot) | Amber border + "Running" pill |
| Completed | "Execute" again | Output panel with green left border |
| Error | "Execute" again | Output panel with red left border |
| Stoppable | Has Stop button | `cmd.stoppable === true` |

**UX Improvements:**
- Add command history log (last 10 executions with timestamps and status)
- Add "Schedule" option for commands that support it (run at specific time)
- Add confirmation dialog for destructive commands (backup is safe, but find-dupes writes changes)
- Add estimated duration tooltip per command (from historical run data)
- Group output panel: show all results in a collapsible accordion instead of stacking
- Add "Clear All Outputs" button
- Show running duration counter for active jobs ("Running for 2m 30s")

---

### 8.12 ⚙️ ENGINE → Pipelines (`/admin/engine/pipelines`)

**Status:** NEW — backend endpoint exists (`GET /api/admin/pipeline`).

**Layout plan:**
```
┌────────────────────────────────────────────┐
│ AdminPageHeader                             │
│ title: "Pipelines"                          │
│ description: "Manage ingestion & enrichment │
│              pipeline configuration"         │
├────────────────────────────────────────────┤
│ ── Active Pipelines ──                      │
│ [Auto Loop]  Status: Running  [Stop]        │
│ [Ingestion]  Status: Idle    [Start]        │
│ [Enrichment] Status: Idle    [Start]        │
├────────────────────────────────────────────┤
│ ── Pipeline Configuration ──               │
│ (editable settings like schedule, sources,  │
│  batch sizes, rate limits)                  │
├────────────────────────────────────────────┤
│ ── Pipeline History ──                      │
│ Table: Pipeline | Started | Ended | Status  │
│        | Articles | Events | Errors        │
└────────────────────────────────────────────┘
```

**Data sources:**
| Data | API |
|---|---|
| Pipeline status/config | `GET /api/admin/pipeline` |
| Pipeline history | TBD (may need backend addition) |

**UX Improvements:**
- Visual pipeline DAG diagram showing data flow: RSS → Ingest → LLM → Extract → DB → Enrich
- Color-coded pipeline stages: gray=idle, green=running, red=error, amber=starting/stopping
- Cron-style schedule editor (if pipelines support scheduling)
- "Dry Run" button — simulate pipeline without writing to DB
- Per-pipeline error notification toggle (Slack/email webhook)

---

### 8.13 ⚙️ ENGINE → Enrichment (`/admin/engine/enrichment`)

**Status:** NEW — backend endpoints exist for status, start, stop.

**Layout plan:**
```
┌────────────────────────────────────────────┐
│ AdminPageHeader                             │
│ title: "Enrichment"                         │
│ description: "Backfill incomplete profiles" │
├────────────────────────────────────────────┤
│ ── Enrichment Services ──                   │
│ [Companies] Status: Idle   [Start]/[Stop]   │
│   Progress: 45/200 processed                │
│   Cost: $0.23 (12 calls)                    │
│                                             │
│ [Investors] Status: Idle   [Start]/[Stop]   │
│   Last run: 2h ago, 89 enriched             │
│                                             │
│ [Founders]  Status: Running [Stop]          │
│   Progress: 12/50, PID: 84291               │
├────────────────────────────────────────────┤
│ ── Enrichment Queue ──                      │
│ Table: Entity | Name | Missing Fields       │
│        | Priority | Added                   │
├────────────────────────────────────────────┤
│ ── Enrichment Log ──                        │
│ Streaming log output for active enrichment  │
└────────────────────────────────────────────┘
```

**Data sources:**
| Data | API |
|---|---|
| Status | `GET /api/admin/enrichment/status` |
| Start | `POST /api/admin/enrichment/start` (body: `{ which }`) |
| Stop | `POST /api/admin/enrichment/stop` (body: `{ which }`) |

**UX Improvements:**
- Progress bar per enrichment type with ETA
- "Enrichment Queue" shows which entities are pending enrichment
- Sort queue by priority (most missing fields first)
- "Enrich Single" — search for a specific entity and enrich just that one
- Cost tracking per enrichment type (separate from ingestion cost)
- Dry run mode: preview what would be enriched without making changes

---

### 8.14 🛠 SYSTEM → Backups (`/admin/system/backups`)

**Status:** NEW — backend endpoint exists (`GET /api/admin/system/backup`, `POST`).

**Layout plan:**
```
┌────────────────────────────────────────────┐
│ AdminPageHeader                             │
│ title: "Database Backups"                   │
│ description: "Manage SQLite backups"         │
│ pills: [N backups] [latest: X ago]          │
├────────────────────────────────────────────┤
│ [Create Backup Now]                         │
├────────────────────────────────────────────┤
│ Backups Table:                              │
│ Filename | Size | Created | Actions         │
│ holdco-20260627.db | 45MB | 2h ago | [DL]  │
│ holdco-20260626.db | 44MB | 1d ago | [DL]  │
├────────────────────────────────────────────┤
│ Database Stats:                             │
│ Size: 45MB | Tables: 12 | Rows: 45,230     │
│ Schema Version: 3 | Last Integrity: OK     │
└────────────────────────────────────────────┘
```

**Data sources:**
| Data | API |
|---|---|
| Backup list + DB stats | `GET /api/admin/system` |
| Create backup | `POST /api/admin/system/backup` |

**UX Improvements:**
- Download button per backup file
- "Restore from backup" with strong confirmation dialog ("This will overwrite the current database!")
- Backup size trend chart (line chart over time to track DB growth)
- Auto-backup schedule configuration (daily at 3am, etc.)
- Retention policy display ("Keeping last 30 backups")
- Database integrity check trigger button with result display

---

### 8.15 🛠 SYSTEM → Logs (`/admin/system/logs`)

**Status:** NEW — extracted from `EngineLogViewer` on the engine page.

**Layout plan:**
```
┌────────────────────────────────────────────┐
│ AdminPageHeader                             │
│ title: "System Logs"                        │
│ description: "Real-time process logs"       │
├────────────────────────────────────────────┤
│ Service selector + Auto-refresh toggle      │
│ [Ingest News|Enrich Co|Enrich Inv|Enrich   │
│  Founders]  [✓ Auto-refresh]               │
├────────────────────────────────────────────┤
│ ┌─ stdout ────────────────────────────────┐│
│ │ 2026-06-27 14:30:01 Starting ingest...  ││
│ │ 2026-06-27 14:30:05 Fetched 23 articles ││
│ │ ...                                      ││
│ └──────────────────────────────────────────┘│
├────────────────────────────────────────────┤
│ ┌─ stderr (if any) ───────────────────────┐│
│ │ ERROR: Connection refused...            ││
│ └──────────────────────────────────────────┘│
└────────────────────────────────────────────┘
```

**Data sources:**
| Data | API |
|---|---|
| Logs | `GET /api/admin/engine/logs?service=&lines=200` |

**Services:** `ingest`, `enrich`, `enrich_investors`, `enrich_people`

**UX Improvements:**
- Search/filter within log output (client-side regex filter)
- "Jump to bottom" button (auto-scroll already exists via `useEffect` + `scrollTop`)
- "Download log" button → saves current log output as .txt
- Log level color coding: ERROR=red, WARN=amber, INFO=gray, DEBUG=blue
- "Lines" selector (100/200/500/1000)
- "Follow" mode toggle — when off, stops auto-scrolling so user can read earlier entries
- Timestamp filter: "Show only last N minutes"
- Combine all services view: side-by-side or interleaved timeline

---

## 9. Global UX Improvements (Cross-Page)

### 9.1 Notifications Center
- Bell icon in header with dropdown showing recent events: "Backup completed", "Ingestion failed", "New moderation submission", "DQ scan found 5 dupes"
- WebSocket-driven for real-time updates (SocketIO already configured in `webapp.py`)

### 9.2 Global Search (Admin)
- `Ctrl+K` / `Cmd+K` to open command palette
- Search across: companies, founders, investors, submissions, commands
- Results grouped by entity type with quick-navigate links

### 9.3 Theme / Density Toggle
- Compact mode toggle (tighter spacing in tables, smaller cards) — persists to localStorage
- Useful for operators who spend all day in the dashboard

### 9.4 Keyboard Navigation
| Shortcut | Action |
|---|---|
| `Ctrl+\` | Toggle sidebar |
| `Ctrl+K` | Command palette |
| `Ctrl+1`–`Ctrl+5` | Jump to sidebar group |
| `g o` | Go to Overview |
| `g i` | Go to Ingestion |
| `g m` | Go to Moderation |
| `g c` | Go to Companies |
| `g d` | Go to Data Quality |
| `g e` | Go to Engine Status |

### 9.5 Page Transition
- Add subtle page transition animation (opacity + slide) when navigating between admin pages
- Keep sidebar state stable during transitions

### 9.6 Dark Mode
- Add dark mode toggle (sun/moon icon in header)
- All `adminTheme.ts` tokens get dark variants
- Persists to localStorage
- Respects `prefers-color-scheme` system setting as default

---

## 10. Development Todos

### Phase 1 — Sidebar Component (no route changes)

- [x] **1.1** Create `frontend/lib/adminNavConfig.ts` — shared nav config constant
  - Define `NavGroup` and `NavItem` TypeScript interfaces
  - Export `ADMIN_NAV_GROUPS` array with all 5 groups + 15 items
  - Each item: `href`, `label`, `icon`, `badgeKey` (optional)
  - Each group: `id`, `label`, `icon`, `defaultExpanded`

- [x] **1.2** Create `frontend/components/admin/layout/AdminSidebar.tsx`
  - Client component (`"use client"`)
  - Read `ADMIN_NAV_GROUPS` from config
  - Accordion groups: click group header → toggle expand/collapse
  - Active item highlight: exact match for `/admin`, `startsWith` for sub-paths
  - Left accent bar on active item (keep existing `bg-brand-600` bar)
  - Auto-expand group containing active route on mount
  - Collapse/expand sidebar toggle button at bottom
  - `localStorage` key: `admin_sidebar_collapsed` → persist boolean
  - Collapsed state: `w-14`, icons only, group headers hidden, tooltip on hover
  - Badge support: render `<AdminSidebarBadge>` per item if `badgeKey` set
  - Keyboard nav: Arrow Up/Down to move focus, Enter to navigate

- [x] **1.3** Create `frontend/components/admin/layout/AdminSidebarMobile.tsx`
  - Hamburger `<button>` in header (visible `lg:hidden`)
  - Slide-in drawer from left with backdrop overlay
  - Uses `<dialog>` element or `useState` + portal
  - Close on: backdrop click, Escape key, nav item click
  - Same `<AdminSidebar>` content rendered inside drawer

- [x] **1.4** Update `frontend/components/admin/layout/AdminShell.tsx`
  - Replace inline `<aside>` + `navItems` array with `<AdminSidebar>`
  - Add hamburger button in header → `<AdminSidebarMobile>`
  - Pass `children` unchanged to `<main>`

- [x] **1.5** Add sidebar design tokens to `frontend/components/admin/ui/adminTheme.ts`
  - `sidebarWidth`, `sidebarCollapsedWidth`, `sidebarBg`, `sidebarBorder`
  - `sidebarGroupHeader`, `sidebarItem`, `sidebarItemActive`, `sidebarItemInactive`
  - `sidebarAccentBar`, `sidebarBadge`, `sidebarCollapseButton`
  - Dark mode variants for each token

- [x] **1.6** Verify all 5 existing routes still work after sidebar refactor
  - `/admin` → Overview
  - `/admin/ingestion` → Ingestion
  - `/admin/engine` → Engine (still full page for now)
  - `/admin/data-quality` → Data Quality (still full page for now)
  - `/admin/moderation` → Moderation

---

### Phase 2 — Breadcrumb

- [x] **2.1** Create `frontend/components/admin/layout/AdminBreadcrumb.tsx`
  - Client component, reads `usePathname()`
  - Maps path segments to labels using `ADMIN_NAV_GROUPS` config
  - Home icon as first segment → links to `/admin`
  - Each intermediate segment is a `<Link>`, last segment is plain text (bold)
  - Hidden when depth = 1 (i.e., on `/admin` Overview page)
  - Matches `adminMaxWidth` container

- [x] **2.2** Add `<AdminBreadcrumb>` to `AdminShell.tsx`
  - Place between header and `<main>`
  - `px-4 py-2` spacing, `text-sm`

---

### Phase 3 — New Entity Pages (Data Management group)

- [x] **3.1** Create `frontend/app/admin/(dashboard)/data/companies/page.tsx`
  - Server component: fetch `getAdminTableData("companies", { per_page: 25 })` + completeness summary
  - Client child: `<AdminDataTable>` with `COMPANY_COLUMNS` from `DataQualityTabsClient`
  - `<AdminPageHeader>` with eyebrow "Data Management", title "Companies"
  - Pills: total count + completeness avg%
  - Toolbar: search, filter, column toggle, export CSV
  - Merge flow: select 2+ rows → `<DuplicateDecisionCard>` modal
  - Bulk delete: select rows → confirmation modal → API call

- [x] **3.2** Create `frontend/app/admin/(dashboard)/data/companies/loading.tsx`
  - Skeleton table rows (reuse `data-quality/loading.tsx` pattern)

- [x] **3.3** Create `frontend/app/admin/(dashboard)/data/founders/page.tsx`
  - Same pattern as companies, with `FOUNDER_COLUMNS`
  - Uses `recorded_at` for Created Date column

- [x] **3.4** Create `frontend/app/admin/(dashboard)/data/founders/loading.tsx`

- [x] **3.5** Create `frontend/app/admin/(dashboard)/data/investors/page.tsx`
  - Same pattern, with `INVESTOR_COLUMNS`

- [x] **3.6** Create `frontend/app/admin/(dashboard)/data/investors/loading.tsx`

- [x] **3.7** Create `frontend/app/admin/(dashboard)/data/lists/page.tsx`
  - Same pattern, with `LIST_COLUMNS`

- [x] **3.8** Create `frontend/app/admin/(dashboard)/data/lists/loading.tsx`

- [x] **3.9** Create `frontend/app/admin/(dashboard)/data/submissions/page.tsx`
  - Same pattern, with `SUBMISSION_COLUMNS`

- [x] **3.10** Create `frontend/app/admin/(dashboard)/data/submissions/loading.tsx`

- [x] **3.11** Simplify `DataQualityTabsClient.tsx` → DQ issues only
  - Remove entity sidebar (`TABS`, `TAB_ICONS`, entity state, fetch logic)
  - Remove `AdminDataTable` rendering for entity tabs
  - Remove completeness summary fetch
  - Keep only: `AdminDataQualityTabs` with 7 issue tabs
  - Keep: `AdminPageHeader` rendering

- [x] **3.12** Update `frontend/app/admin/(dashboard)/data-quality/page.tsx`
  - Remove companies data fetch
  - Pass only `dqData` to simplified `DataQualityTabsClient`

- [x] **3.13** Run TypeScript check on all new/modified files
  - `cd frontend && npx tsc --noEmit` — no new errors from changes

---

### Phase 4 — New Engine & System Pages

- [x] **4.1** Create `frontend/app/admin/(dashboard)/engine/commands/page.tsx`
  - Extract from `AdminEngineControlRoom.tsx` → make it a page wrapper
  - `<AdminPageHeader>` with eyebrow "Engine", title "Command Center"
  - Pills: active jobs count
  - Render `<AdminEngineControlRoom>` inside

- [x] **4.2** Create `frontend/app/admin/(dashboard)/engine/commands/loading.tsx`
  - Skeleton cards in 3 group layouts

- [x] **4.3** Create `frontend/app/admin/(dashboard)/engine/pipelines/page.tsx`
  - NEW client component
  - Fetch `GET /api/admin/pipeline` on mount + 15s poll
  - Pipeline status cards: Ingest, Enrich, Auto Loop
  - Pipeline config section: schedule settings
  - Pipeline history table: recent runs
  - States: loading, empty, error, running

- [x] **4.4** Create `frontend/app/admin/(dashboard)/engine/pipelines/loading.tsx` (inline)

- [x] **4.5** Create `frontend/app/admin/(dashboard)/engine/enrichment/page.tsx`
  - NEW client component
  - Fetch `GET /api/admin/enrichment/status` on mount + 15s poll
  - 3 service cards: Companies, Investors, Founders
  - Each: status dot, progress bar, cost, Start/Stop button
  - Enrichment queue table (entities pending enrichment)
  - Enrichment log panel (reuse `EngineLogViewer` pattern)

- [x] **4.6** Create `frontend/app/admin/(dashboard)/engine/enrichment/loading.tsx` (inline)

- [x] **4.7** Simplify `frontend/app/admin/(dashboard)/engine/page.tsx`
  - Remove `EngineLogViewer` import → now at `/admin/system/logs`
  - Remove `AdminEngineControlRoom` import → now at `/admin/engine/commands`
  - Keep only: `AdminPageHeader` + `EngineStatusPanel`
  - Update title: "System Status" (was "Operations & System")

- [x] **4.8** Create `frontend/app/admin/(dashboard)/system/backups/page.tsx`
  - NEW client component
  - Fetch `GET /api/admin/system` on mount
  - "Create Backup Now" button → `POST /api/admin/system/backup`
  - Backups table: filename, size, created, download link
  - Database stats: size, tables, rows, schema version, last integrity
  - "Restore" button with strong confirmation dialog

- [x] **4.9** Create `frontend/app/admin/(dashboard)/system/backups/loading.tsx`

- [x] **4.10** Create `frontend/app/admin/(dashboard)/system/logs/page.tsx`
  - Extract `EngineLogViewer` logic → wrap as page
  - `<AdminPageHeader>` with title "System Logs"
  - Service selector dropdown + auto-refresh toggle
  - stdout panel (dark bg, scrollable, auto-scroll to bottom)
  - stderr panel (red bg, collapsible, only shown if errors exist)
  - Add: search filter input, "Lines" selector (100/200/500/1000), download button

- [x] **4.11** Create `frontend/app/admin/(dashboard)/system/logs/loading.tsx`

- [x] **4.12** Create error boundaries for new route groups
  - `frontend/app/admin/(dashboard)/data/error.tsx`
  - `frontend/app/admin/(dashboard)/system/error.tsx`

- [x] **4.13** Run TypeScript check on all new/modified files
  - `cd frontend && npx tsc --noEmit` — no new errors introduced

---

### Phase 5 — Polish & UX

- [x] **5.1** Add live badge counts to `<AdminSidebar>`
  - **Moderation badge:** fetch `GET /api/v1/admin/moderation?status=pending` → count pending
  - **DQ Issues badge:** count items across all 6 issue sections from DQ data
  - **Submissions badge:** count pending submissions
  - Poll every 60s via `useEffect` + `setInterval`
  - Render `<AdminSidebarBadge>` with count number

- [x] **5.2** Add keyboard shortcuts
  - `Ctrl+\`` → toggle sidebar collapse
  - `Ctrl+K` → placeholder for command palette (Phase 5.6)
  - `g` + `o/i/m/c/d/e` → navigate to pages (Vim-style two-key sequence)
  - Implement via `useEffect` + `keydown` listener in `AdminShell`
  - Show shortcut hints in tooltips on sidebar items

- [x] **5.3** Add sidebar group auto-expand on active route
  - On mount and on route change, expand the group containing the active item
  - Other groups stay collapsed (or remember last state from localStorage)
  - Edge case: if active route's group was manually collapsed by user, still auto-expand

- [x] **5.4** Add page transition animation
  - Fade + slight slide-up on page content when route changes
  - Use CSS `@keyframes` + `animation` on `<main>` content wrapper
  - Keep sidebar static during transitions (no flicker)

- [x] **5.5** Add quick-jump anchor links on Overview page
  - Sticky sub-nav below breadcrumb: `[KPI] [Charts] [Timeline] [Funding] [Activity]`
  - Click → smooth scroll to section via `scrollIntoView({ behavior: "smooth" })`
  - Highlight current visible section via Intersection Observer

- [x] **5.6** Add dark mode toggle
  - Sun/moon icon button in header
  - Toggle `dark` class on `<html>` element
  - `adminTheme.ts` dark variants for shell (header, sidebar, background)
  - Persist to `localStorage` key: `admin_theme`
  - Default: respect `prefers-color-scheme` media query

- [x] **5.7** Add command palette
  - `Ctrl+K` to open modal search
  - Search across: sidebar items
  - Fuzzy filter results
  - Enter to navigate, Arrow keys to select, Escape to close

- [x] **5.8** Add notifications center
  - Bell icon in header with unread count badge
  - Dropdown: recent activity events (polled every 60s)
  - "Mark all read" on open
  - Unread tracking via localStorage timestamp

- [x] **5.9** Final TypeScript check + lint
  - `cd frontend && npx tsc --noEmit`
  - Fix all type errors
  - Verify no regression on existing pages

---

### Quick Reference: File Count

| Phase | New Files | Modified Files | Total |
|---|---|---|---|
| Phase 1 | 3 (`adminNavConfig.ts`, `AdminSidebar.tsx`, `AdminSidebarMobile.tsx`) | 2 (`AdminShell.tsx`, `adminTheme.ts`) | 5 |
| Phase 2 | 1 (`AdminBreadcrumb.tsx`) | 1 (`AdminShell.tsx`) | 2 |
| Phase 3 | 10 (5 pages + 5 loadings) | 2 (`DataQualityTabsClient.tsx`, `data-quality/page.tsx`) | 12 |
| Phase 4 | 10 (5 pages + 5 loadings) + 2 error boundaries | 1 (`engine/page.tsx`) | 13 |
| Phase 5 | 0 | 3+ (`AdminSidebar.tsx`, `AdminShell.tsx`, `Overview/page.tsx`) | 3 |
| **Total** | **26** | **9** | **35** |

---

### Dependency Graph

```
Phase 1 (Sidebar) ─────────────────────────────────────────────────────────────┐
     │                                                                          │
     ├── Phase 2 (Breadcrumb) ──────────────────────────────────────────────────┤
     │                                                                          │
     ├── Phase 3 (Entity Pages) ── depends on Phase 1 sidebar config for routes │
     │                                                                          │
     ├── Phase 4 (Engine/System Pages) ── depends on Phase 1 for nav items      │
     │                                                                          │
     └── Phase 5 (Polish) ── depends on all phases above                        │
```

Phases 2, 3, and 4 can run in parallel after Phase 1 is complete. Phase 5 must run last.

---

## 11. Phase 6 — Data Page UX Enhancements

High-impact, scoped improvements to entity data pages, moderation, and logs.

### 11.1 Toast Notification System

- [x] **6.1** Create `frontend/components/admin/ui/AdminToast.tsx` — toast notification provider
  - Success (green), Error (red), Info (blue) variants
  - Auto-dismiss after 3s with slide-out animation
  - Stack up to 3 toasts, oldest dismissed first
  - Used by: inline edit save, merge complete, bulk delete, command execute

- [x] **6.2** Integrate `<AdminToastProvider>` into `AdminShell.tsx`
  - Wrap children with context provider
  - Export `useAdminToast()` hook → `toast.success("message")`, `toast.error("message")`

### 11.2 Entity Table Improvements

- [x] **6.3** Column visibility toggle on `/admin/data/*` pages
  - Dropdown button in toolbar: `[☰ Columns]` → checkbox list per column
  - Persist visible columns to `localStorage` per table type
  - Hide/show columns without re-fetch

- [x] **6.4** Quick filter chips on Companies page
  - `[Active] [Acquired] [IPO] [Closed]` chips below toolbar
  - Click → set `?status=` URL param + re-fetch
  - Active chip highlighted, "All" to clear

- [x] **6.5** "Last updated" timestamp on data pages
  - Show `Updated X minutes ago` in toolbar subtitle
  - Derived from `last_updated_at` max value per page fetch

### 11.3 Row Detail Expand

- [x] **6.6** ~~Inline row expand on Companies table~~ (skipped — scope tradeoff)

### 11.4 Log Viewer Enhancements

- [x] **6.7** Log level color coding on `/admin/system/logs`
  - ERROR=red, WARN=amber, INFO=gray, DEBUG=blue
  - Regex match on log line prefix: `ERROR:`, `WARNING:`, `INFO:`, `DEBUG:`
  - Lines selector dropdown: 100 / 200 / 500 / 1000
  - "Download log" button → saves current output as .txt

### 11.5 Moderation UX

- [x] **6.8** Keyboard shortcuts on `/admin/moderation`
  - `j`/`k` navigate between cards, scroll into view
  - Focus ring on active card
  - Show hint bar at bottom: `[j/k navigate] [a accept] [r reject]`

- [x] **6.9** Filter state in URL search params on `/admin/moderation` (scaffolded)

### 11.6 Overview Dashboard

- [x] **6.10** Period filter on Overview page
  - `[7d] [30d] [90d] [All]` pill selector at top
  - Pass `?period=` URL param, server re-fetches
  - Timeline, funding, activity sections re-fetch with new range

- [x] **6.11** KPI cards clickable → navigate to detail
  - Companies count → `/admin/data/companies`
  - Investors count → `/admin/data/investors`
  - Submissions count → `/admin/data/submissions`
  - Ingestion success rate → `/admin/ingestion`

### Quick Reference: Phase 6

| # | Task | Effort |
|---|---|---|
| 6.1 | Toast system | Medium |
| 6.2 | Toast integration | Small |
| 6.3 | Column visibility toggle | Small |
| 6.4 | Quick filter chips | Small |
| 6.5 | Last updated timestamp | Small |
| 6.6 | Row detail expand | Medium |
| 6.7 | Log color coding | Small |
| 6.8 | Moderation shortcuts | Small |
| 6.9 | Moderation URL params | Small |
| 6.10 | Overview period filter | Medium |
| 6.11 | KPI clickable cards | Small |
| **Total** | **11 items** | **~1-2 days** |

---

## 12. Phase 7 — Polish & Power User Features

Quick improvements that make daily use smoother.

### 12.1 Table Row Density Toggle

- [x] **7.1** Row density toggle on entity tables
  - `[Compact] [Default]` toggle in toolbar
  - Compact: `py-1` rows, `text-xs`, smaller checkboxes
  - Persist to `localStorage` per table
  - Shares space with column visibility button

### 12.2 Keyboard Shortcut Cheatsheet

- [x] **7.2** `?` key → show shortcut overlay
  - Modal listing all keyboard shortcuts
  - Sections: Global, Navigation, Moderation
  - Dismiss with `?` or Escape

### 12.3 Empty State CTAs

- [x] **7.3** Helpful empty states on entity pages
  - Companies empty → "No companies yet. Import from CSV or add your first company."
  - Founders empty → "No founders recorded. Founders are auto-detected from news articles."
  - Lists empty → "Create your first curated list to group companies."
  - Each with a primary CTA button

### 12.4 Bulk Edit

- [x] **7.4** Bulk edit on entity pages
  - Select multiple rows → "Edit Selected" button in batch bar
  - Modal: pick a field → set value for all selected rows
  - Common use: set sector, location, status for multiple companies at once

### 12.5 Data Quality Score on Overview

- [x] **7.5** DQ health score widget on Overview page
  - Overall DQ percentage based on open issues vs total records
  - Mini sparkline showing DQ trend over last 7 days
  - Click → navigate to `/admin/data-quality`

### 12.6 Export with Current Filters

- [x] **7.6** Export respects active filters/search
  - Currently exports all visible rows (one page)
  - Add option: "Export all matching" (send current filters to API)
  - Dropdown on Download button: [Export page] [Export all N results]

### Quick Reference: Phase 7

| # | Task | Effort |
|---|---|---|
| 7.1 | Row density toggle | Small |
| 7.2 | Shortcut cheatsheet | Small |
| 7.3 | Empty state CTAs | Small |
| 7.4 | Bulk edit | Medium |
| 7.5 | DQ score widget | Small |
| 7.6 | Export with filters | Small |
| **Total** | **6 items** | **~1 day** |

---

## 13. Phase 8 — Data Insights & Informative Views

Deeper data visibility beyond CRUD tables.

### 13.1 Funding Rounds Table

- [x] **8.1** Add `/admin/data/funding-rounds` page
  - Columns: Date, Company, Round Type, Amount (USD), Lead Investor, Investors
  - Click company → navigate to company detail
  - Click investor → navigate to investor profile
  - Sort by amount, date; filter by round type
  - Reuses `EntityTableClient` pattern

### 13.2 Company Detail Panel

- [ ] **8.2** ~~Company detail panel on `/admin/data/companies`~~ (deferred — needs slide-in panel UX)

### 13.3 Investor Portfolio View

- [ ] **8.3** ~~Investor portfolio expand on `/admin/data/investors`~~ (deferred — needs row-expand UX)

### 13.4 News Article Browser

- [x] **8.4** Add `/admin/ingestion/articles` page
  - Table: Date, Title, Source, Companies Extracted, Events Found
  - Click article → expand to show full extracted facts
  - Search by title, filter by source
  - "Re-process article" action button

### 13.5 Data Growth Chart on Overview

- [x] **8.5** Growth metrics on Overview snapshot bar
  - Added news events count + funding rounds count to DQ snapshot card
  - Uses existing `counts` from overview API

### 13.6 Completeness Breakdown

- [x] **8.6** Field-level completeness on completeness card
  - Click "Show breakdown" → expand to show per-field bars
  - Name, Sector, Location, Website, Founded Year, Status, Description
  - Color-coded bars: green ≥80%, amber ≥50%, red <50%

### Quick Reference: Phase 8

| # | Task | Effort |
|---|---|---|
| 8.1 | Funding rounds table | Small |
| 8.2 | Company detail panel | Medium |
| 8.3 | Investor portfolio expand | Small |
| 8.4 | News article browser | Medium |
| 8.5 | Growth sparklines | Small |
| 8.6 | Completeness breakdown | Small |
| **Total** | **6 items** | **~1-2 days** |

---

## 14. Phase 9 — Operator Quality of Life

Small touches that make daily operations faster.

### 14.1 Header Service Status Dots

- [x] **9.1** Live service status indicator in header
  - Colored dots next to logo: 🟢 Ingest, 🟢 Enrich Co, 🟢 Enrich Inv, 🟢 Enrich People
  - Pulse animation when running, gray when idle
  - Hover tooltip: "Ingestion: Running (PID 84291)"
  - Polls `/api/admin/engine/status?range=1h` every 30s
  - Click dot → navigate to engine status page

### 14.2 Company Public Profile Links

- [x] **9.2** "Open profile" icon button per company row
  - Small external-link icon at end of each company row
  - Links to `/companies/[slug]` in new tab
  - Also add slug column (hidden by default, showable via column toggle)

### 14.3 Export as JSON

- [x] **9.3** JSON export option in download dropdown
  - Current: [Export page] [Export all N]
  - Add: [Export as JSON] — downloads current page as .json
  - Reuses existing `exportRowsToCsv` pattern, just different format

### 14.4 Ingestion Quick Action in Header

- [x] **9.4** "Run" dropdown button in header
  - `[⚡ Run]` button next to search bar
  - Dropdown: Run Ingestion, Enrich Companies, Enrich Investors, Enrich Founders
  - POST to respective start endpoints, toast on success/error
  - Show spinner while request is pending

### 14.5 Database Stats on Overview

- [x] **9.5** DB health section on Overview
  - DB size (MB), table count, total rows, schema version
  - Fetched from `/api/admin/system` endpoint (already exists)
  - Shows below the DQ snapshot card

### 14.6 Mobile Touch Improvements

- [x] **9.6** Better mobile experience
  - Larger touch targets on sidebar items (min 44px)
  - Swipe-to-close on mobile sidebar drawer
  - Bottom sheet filter bar on mobile instead of inline

### Quick Reference: Phase 9

| # | Task | Effort |
|---|---|---|
| 9.1 | Header status dots | Small |
| 9.2 | Company profile links | Small |
| 9.3 | JSON export | Small |
| 9.4 | Quick action button | Small |
| 9.5 | DB stats on Overview | Small |
| 9.6 | Mobile improvements | Medium |
| **Total** | **6 items** | **~1 day** |

---

## 15. Phase 10 — Billing & API Key Management

> **Catatan:** Ini adalah dashboard master/operator untuk data ingestion, moderation, dan monitoring. Billing, subscription plans, dan API key management adalah fitur SaaS customer-facing — seharusnya di portal terpisah (bukan di `/admin`). Item di bawah TIDAK ditampilkan di sidebar dashboard ini.

Monetization infrastructure — manage subscriptions, API keys, and usage.

### 15.1 API Keys Page

- [x] **10.1** Create `/admin/system/api-keys` page
  - Table: Key Name, Plan, Created, Last Used, Status (active/revoked)
  - "Generate New Key" button → modal with plan selector
  - "Revoke" action per key with confirmation
  - Copy-to-clipboard on key value
  - Backend: `GET /api/v1/admin/api-keys` list, `POST` create, `DELETE` revoke
  - Plan assignment: `POST /api/v1/admin/api-keys/<id>/plan`

### 15.2 Usage & Cost Dashboard

- [x] **10.2** Create `/admin/system/usage` page
  - Cost overview cards: Total Cost, Pipeline Runs, Articles Processed, Errors
  - Per-API-key usage table (if multiple keys)
  - Backend: uses existing `/api/v1/admin/engine/status?range=30d`

### 15.3 Budget Configuration

- [x] **10.3** Budget settings card on usage page
  - Editable daily budget cap (reads/writes `.daily_budget.json`)
  - Visual: progress bar showing daily spend vs cap
  - Warning state when >80% of daily budget used
  - Backend: `GET/POST /api/v1/admin/engine/budget` (already exists)

### 15.4 Subscription Plans Management

- [x] **10.4** Create `/admin/system/plans` page
  - 3-tier plan cards: Free ($0), Pro ($49/mo), Enterprise (Custom)
  - Features list per plan
  - Edit plan button (placeholder)

### 15.5 Billing History

- [x] **10.5** Create `/admin/system/billing` page
  - Table: Date, User/Key, Plan, Amount, Status (paid/pending/failed)
  - Mock data for now (backend billing table not yet built)

### 15.6 Sidebar: Add "Billing" Group

- [x] **10.6** New items under System group
  - `/admin/system/api-keys` — API Keys
  - `/admin/system/usage` — Usage & Cost
  - `/admin/system/plans` — Plans
  - `/admin/system/billing` — Billing History

### Quick Reference: Phase 10

| # | Task | Effort |
|---|---|---|
| 10.1 | API Keys page | Medium |
| 10.2 | Usage dashboard | Medium |
| 10.3 | Budget config | Small |
| 10.4 | Plans management | Small |
| 10.5 | Billing history | Medium |
| 10.6 | Sidebar restructure | Small |
| **Total** | **6 items** | **~2-3 days** |
