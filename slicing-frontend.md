# Slicing Frontend — DeePortal

Dokumentasi pemisahan frontend menjadi 2 repository.

---

## Struktur Repo

```
┌──────────────────────────────────┐
│  landingpage-deeportal           │
│  (Public Website)                │
│  Port: 3000                      │
│                                  │
│  app/                            │
│  ├── (marketing)/   Landing page │
│  ├── about/         About us     │
│  ├── content/       Content      │
│  ├── login/         Login        │
│  ├── newsletter/    Newsletter   │
│  ├── profile/       Profile      │
│  ├── register/      Register     │
│  ├── submissions/   Submissions  │
│  └── submit/        Submit       │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  frontend-deeportal              │
│  (Admin Dashboard)               │
│  Port: 3001                      │
│                                  │
│  app/                            │
│  ├── admin/          Admin panel │
│  │   ├── (dashboard)/ Overview   │
│  │   ├── data/        Data mgmt  │
│  │   ├── engine/      Engine     │
│  │   ├── ingestion/   Ingestion  │
│  │   ├── moderation/  Moderation │
│  │   ├── system/      System     │
│  │   └── login/       Admin auth │
│  ├── api/            API routes  │
│  └── page.tsx → redirect /admin  │
└──────────────────────────────────┘
```

---

## Shared Code (Kedua Repo)

Kedua repo memiliki copy dari komponen/lib yang sama:

```
components/       UI components (shared)
lib/              Library (api client, utils)
types/            TypeScript types
hooks/            Custom hooks
```

**Sync strategy**: Jika ada perubahan di shared code, update di kedua repo.

---

## Cara Development

### Landing Page
```bash
cd landingpage-deeportal
npm install
npm run dev
# → http://localhost:3000
```

### Admin Dashboard
```bash
cd frontend-deeportal
npm install
npm run dev
# → http://localhost:3001
```

---

## Git Repos

| Repo | Remote |
|------|--------|
| landingpage-deeportal | `github.com/Satu-Digital/landingpage-deeportal` |
| frontend-deeportal | `github.com/Satu-Digital/frontend-deeportal` |

---

## Timeline Pemisahan

- **2026-06-29**: Pemisahan dilakukan
  - Copy `frontend-deeportal` → `landingpage-deeportal`
  - landingpage: hapus `/admin`
  - frontend: hapus public pages, tambah redirect `/` → `/admin`

---

## Catatan

- Kode tidak diubah — hanya dipindahkan (sesuai instruksi)
- `app/api/admin/*` dihapus dari landingpage (hanya untuk admin dashboard)
- Kedua repo build bersih (`npx tsc --noEmit` OK)
- Shared components/lib perlu di-sync manual jika ada perubahan

---

## Adjustments yang Perlu Dicek

| Area | Status | Keterangan |
|------|--------|------------|
| **CORS backend** | ✅ OK | `localhost:3000` dan `localhost:3001` sudah di-allow |
| **API base URL** | ✅ OK | Kedua repo pakai `HOLDCO_BACKEND_ORIGIN` (port 8080) |
| **Admin API routes** | ✅ Fixed | `/api/admin/*` dipindah ke frontend-deeportal |
| **Auth session** | ✅ OK | Shared `AuthProvider`, cookie-based |
| **Navigation links** | ✅ OK | Tidak ada hardcoded link antar repo |
