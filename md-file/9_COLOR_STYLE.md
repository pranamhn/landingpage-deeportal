# Color Style Guide — DeePortal.ai

> Extracted from logo: deep navy + blue-purple gradient palette.

---

## Logo Color Extraction

| Role | Hex | RGB |
|---|---|---|
| Dark anchor (bg) | `#020831` | (2, 8, 49) |
| Median | `#0d0e44` | (13, 14, 68) |
| Mid accent | `#4d55ec` | (77, 85, 236) |
| Light anchor | `#e0def4` | (224, 222, 244) |

**Dominant clusters:** 43% deep navy `#000028`, remainder is blue-purple gradient (`#0050f0` → `#7800f0`).

---

## New Tailwind Palette (replace in `tailwind.config.ts`)

```ts
colors: {
  brand: {
    50:  "#eef0ff",   // subtle background
    100: "#dce0ff",   // hover / tag bg
    200: "#b8bfff",   // timeline border
    400: "#6b74f0",   // lighter accent
    500: "#4d55ec",   // primary (mid accent from logo)
    600: "#2e38db",   // primary hover / links
    700: "#1e27a8",   // dark accent
  },
  navy: {
    600: "#1d3a8a",   // keep (or adjust)
    700: "#0a1044",   // dark navy (matched to logo dark anchor)
    800: "#060a2e",   // deeper navy
    950: "#020831",   // darkest bg (logo anchor)
  },
  accent: {
    50:  "#f3eeff",   // purple subtle
    500: "#7800f0",   // purple accent (logo highlight)
    600: "#5a00b8",   // darker purple
  },
  surface:  "#f8f8fc",  // cool white (was #f5f5f1 warm)
  muted:    "#6b6b8a",  // cool gray text
  success:  {
    50:  "#eaf6ee",
    600: "#1d7a44",
  },
  warning:  {
    50:  "#fdf2e3",
    600: "#a3650a",
  },
  danger:   {
    50:  "#fbeaea",
    600: "#a82424",
  },
  sector:   {
    50:  "#eef0fb",
    600: "#4a4fb0",
  },
},
```

**Key changes from old palette:**
- `brand` was teal (`#0d9488`) → now blue-purple (`#4d55ec`)
- `navy.700` was `#142850` → now `#0a1044` (darker)
- `accent` was orange (`#c96a10`) → now purple (`#7800f0`)
- `surface` was warm beige (`#f5f5f1`) → now cool white (`#f8f8fc`)

---

## Page-by-Page Color Mapping

### 1. Global Shell (`SiteHeader`, `SiteFooter`, `layout.tsx`)

| Element | Old | New |
|---|---|---|
| Header bg | `bg-white/80` | `bg-white/80` (no change) |
| Header border | `border-black/10` | `border-navy-950/10` |
| Logo text (removed) | `text-navy-700` + `text-brand-600` | — |
| Footer bg | default | `bg-navy-950 text-white` |
| Links | `text-brand-600` | `text-brand-600` (auto-updated) |

### 2. Homepage / Landing

| Element | Old | New |
|---|---|---|
| Hero heading | `text-navy-700` | `text-navy-950` |
| Hero subtext | `text-muted` | `text-muted` (auto) |
| CTA buttons | `bg-brand-500` | `bg-brand-500` (auto) |
| Feature cards bg | `bg-brand-50` | `bg-brand-50` (auto) |
| Stats / badge | `text-brand-600` | `text-brand-600` (auto) |

### 3. Company List (`/companies`)

| Element | Old | New |
|---|---|---|
| Avatars | `bg-brand-100 text-brand-700` | `bg-brand-100 text-brand-700` (auto) |
| Company name hover | `group-hover:text-brand-600` | (auto) |
| Filter clear link | `text-brand-600` | (auto) |
| Empty state icon | `text-brand-500` | (auto) |
| Search focus ring | `ring-brand-500` | (auto) |

### 4. Company Detail (`/companies/[slug]`)

| Element | Old | New |
|---|---|---|
| Initial avatar | `bg-brand-100 text-brand-700` | (auto) |
| Timeline border | `border-brand-200` | (auto) |
| Tag/category badge | `bg-brand-50 text-brand-600` | (auto) |
| Source links | `hover:text-brand-600` | (auto) |
| Back link | `text-brand-600` | (auto) |
| Fact cards bg | `bg-brand-50` | (auto) |

### 5. Investors (`/investors`, `/investors/[slug]`)

| Element | Old | New |
|---|---|---|
| Investor links | `text-brand-600` | (auto) |
| Back link | `hover:text-brand-600` | (auto) |
| Website link | `text-brand-600` | (auto) |
| Portfolio count | `text-brand-600` | (auto) |

### 6. Funding Page (`/funding`)

| Element | Old | New |
|---|---|---|
| Company link | `text-brand-600` | (auto) |
| Source link hover | `hover:text-brand-600` | (auto) |

### 7. Auth Pages (`/login`, `/register`)

| Element | Old | New |
|---|---|---|
| Form accent links | `text-brand-600` | (auto) |
| Submit button | `bg-brand-500` or `bg-brand-600` | (auto) |

### 8. Admin Pages

| Element | Old | New |
|---|---|---|
| Sidebar active | `bg-brand-50 text-brand-700` | (auto) |
| Data highlight | `text-brand-600` | (auto) |
| Action buttons | `bg-brand-500` | (auto) |

### 9. Submit / Correction Forms

| Element | Old | New |
|---|---|---|
| Submit button | `bg-brand-500` | (auto) |
| Link to submit | `text-brand-600` | (auto) |

---

## Global Replacements (CSS classes)

These class names stay the same — only the tailwind config values change:

| Class | Old Value | New Value |
|---|---|---|
| `text-brand-600` | `#0f766e` (teal) | `#2e38db` (blue) |
| `text-brand-500` | `#0d9488` | `#4d55ec` |
| `bg-brand-50` | `#f0f9f8` | `#eef0ff` |
| `bg-brand-100` | `#dff5f0` | `#dce0ff` |
| `bg-brand-500` | `#0d9488` | `#4d55ec` |
| `border-brand-200` | — (new) | `#b8bfff` |
| `text-navy-700` | `#142850` | `#0a1044` |
| `text-accent-500` | `#c96a10` (orange) | `#7800f0` (purple) |
| `bg-accent-50` | `#ffe8d5` | `#f3eeff` |
| `bg-surface` | `#f5f5f1` | `#f8f8fc` |
| `text-muted` | `#627083` | `#6b6b8a` |

---

## Implementation Steps

1. Update `frontend/tailwind.config.ts` with the new palette above
2. Update `frontend/app/globals.css` if any hardcoded colors exist
3. Replace the old SVG favicon colors (no longer needed — using PNG)
4. Restart frontend dev server
5. Visual QA: check homepage, company detail, investors, admin
