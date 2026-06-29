# 4_FRONTEND_AGENT.md (Instruksi & Kontrak Kerja Agent Frontend)

Berkas ini adalah panduan dan batas instruksi bagi AI Coding Assistant (seperti Antigravity/Codex) yang bekerja di sisi **Frontend** pada proyek **Holdco Orchestrator**. 

Anda harus mematuhi aturan cakupan (*scope*), petunjuk migrasi Next.js, dan kontrak penanganan error berikut tanpa pengecualian.

---

## 1. Aturan Cakupan & Batas Modifikasi (Scope Boundaries)
* **HANYA EDIT BERKAS FRONTEND**: Anda hanya diizinkan untuk membuat, memodifikasi, dan menghapus berkas di dalam direktori Next.js (misalnya direktori `./frontend` atau `./dashboard` yang ditunjuk).
* **DILARANG MENGUBAH BACKEND**: Anda **tidak boleh** memodifikasi berkas logika backend di dalam folder `holdco/` (logika bisnis holding, ingesti data, evaluasi KPI) maupun logika database di `orchestrator/` (kecuali berkas konfigurasi API publik atau template statis lama yang akan didelegasikan).
* **Konsumsi API**: Seluruh interaksi data dilakukan dengan memanggil HTTP REST API JSON yang disediakan oleh backend Flask (port `8080`).

---

## 2. Visi Migrasi: Next.js (SEO-Friendly)
Tugas utama Anda adalah memindahkan antarmuka web statis/Jinja2 Flask lama ke dalam aplikasi **Next.js** modern dengan fokus penuh pada keramahan mesin pencari (SEO-Friendly).

### Spesifikasi Teknologi Frontend:
* **Framework**: Next.js (versi terbaru, direkomendasikan menggunakan App Router).
* **Bahasa**: TypeScript (untuk keandalan tipe data).
* **Styling**: Tailwind CSS (atau Vanilla CSS sesuai desain sistem).
* **State Management**: React Context, Zustand, atau state lokal jika sederhana.

---

## 3. Panduan Implementasi SEO & SSR
Setiap profil startup, VC, dan berita harus terindeks sempurna di Google:

1. **Rendering Server-Side (SSR) & Static Generation (SSG)**:
   * Gunakan `Server Components` Next.js secara default untuk mengambil data startup dari backend API. Halaman detail startup (`/companies/[slug]`) dan investor (`/investors/[slug]`) harus dirender di server agar mesin perayap (crawler) Google langsung mendapatkan HTML utuh yang sudah berisi data riil.
2. **Metadata Dinamis (Next.js Metadata API)**:
   * Generate tag judul (*title tag*) dan deskripsi meta (*meta description*) secara dinamis berdasarkan data startup yang diambil.
   * Contoh judul halaman detail: `[Nama Startup] - Pendanaan, Investor, & Berita Terbaru | Crunchbase Mini Indonesia`.
   * Pasang Open Graph (OG) tags dan Twitter Card meta secara dinamis agar tautan yang dibagikan ke media sosial memuat logo startup, judul, dan deskripsi yang rapi.
3. **Data Terstruktur (Structured Data - JSON-LD)**:
   * Sisipkan skema JSON-LD `Organization` pada setiap halaman profil startup untuk membantu Google memahami data badan hukum, industri, founder, dan tautan sosial media startup tersebut.
4. **HTML5 Semantik & Navigasi**:
   * Gunakan elemen semantik: `<header>`, `<main>`, `<article>`, `<section>`, <footer>, dan `<aside>`.
   * Gunakan komponen `<Link>` bawaan Next.js untuk menjaga navigasi internal tetap cepat dan SEO-friendly.
5. **Sitemap & Robots.txt**:
   * Generate berkas `sitemap.xml` dinamis di Next.js yang mengambil seluruh slug startup terdaftar dari backend secara berkala.

---

## 4. Pemetaan Route Halaman yang Harus Dibuat
Pindahkan dan poles halaman Jinja2 Flask lama ke Next.js dengan route berikut:
* `GET /` : Landing page modern dengan statistik total startup, riwayat pendanaan kumulatif, dan kurasi berita tren.
* `GET /companies` : Pencarian dan penyaringan startup (berdasarkan nama, sektor, lokasi, dan stage pendanaan) dilengkapi *pagination*.
* `GET /companies/[slug]` : Flagship detail page (profil utama startup, linimasa pendanaan terurut kronologis, daftar investor, dan kronologi berita).
* `GET /investors/[slug]` : Profil lengkap VC/Angel Investor beserta daftar portofolio startup yang mereka danai.
* `GET /lists` : Kurasi daftar startup buatan komunitas/operator.
* `GET /lists/[id]` : Isi detail kurasi daftar startup tertentu.
* `GET /compare` : Antarmuka visual perbandingan metrics startup (maksimal 4 entitas).

---

## 5. Kontrak Integrasi API (Backend Flask)
Backend Flask menyediakan endpoint JSON berikut (konsumsi di server Next.js Anda):
* `GET /api/companies?q=&sector=&location=&page=` $\rightarrow$ Mengembalikan daftar startup terfilter.
* `GET /api/companies/[slug_or_id]` $\rightarrow$ Detail lengkap profil startup, riwayat funding, dan news event.
* `GET /api/investors/[slug_or_id]` $\rightarrow$ Profil investor beserta portofolio startup miliknya.
* `GET /api/lists` $\rightarrow$ Mendapatkan seluruh daftar kurasi.
* `GET /api/lists/[id]` $\rightarrow$ Mendapatkan isi startup dalam list tertentu.

*Catatan: Pastikan Anda menangani status error API (404 Not Found, 500 Server Error) secara anggun menggunakan `error.tsx` bawaan Next.js dan sediakan halaman skeleton loader (`loading.tsx`).*

---

## 6. Standar Penanganan Error API (Error Handling Contract)

Untuk menjamin kestabilan aplikasi, Anda **wajib** menangani setiap error respon API dengan standar yang seragam. Backend akan selalu mengembalikan format error JSON sebagai berikut saat terjadi kegagalan:
```json
{
  "success": false,
  "code": 400,
  "message": "Pesan kesalahan detail dari backend"
}
```

### 6.1 Utilitas Penanganan Error (`utils/handleApiError.tsx`)
Buat berkas utilitas penanganan error di `@/utils/handleApiError.tsx`. Utilitas ini mendeteksi status unauthorized (401) untuk logout paksa, mengekstrak pesan kesalahan dari respons API secara dinamis, menampilkan notifikasi alert, dan mengembalikan objek error terstandardisasi:

```typescript
import { alertManager } from "./alertManager"; // Pastikan Anda memiliki alertManager/toast manager

/**
 * Mengani error respon dari panggilan API secara otomatis.
 *
 * @param error - Objek error yang ditangkap dari catch block.
 * @param successStatus - Kode status HTTP sukses yang diharapkan (default: 200).
 * @param customMessage - Pesan kustom opsional jika tidak ada pesan dari API.
 * @returns Objek terstandar { success: false, message: string, error: any }
 */
export function handleApiError(
  error: any,
  successStatus: number = 200,
  customMessage?: string
) {
  // 1. Auto-Redirect ke Login jika Unauthorized (401)
  if (error.response?.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"; // Redirect ke halaman login Next.js
    }
    return {
      success: false,
      message: "Sesi Anda telah berakhir. Silakan login kembali.",
      error: error
    };
  }

  // 2. Ekstraksi Pesan Error secara Dinamis
  let errorMessage =
    error?.response?.data?.message || 
    error?.response?.data?.error ||
    error?.message ||
    customMessage ||
    "Terjadi kesalahan pada server";

  // Jika pesan bertipe objek (misal error proxy), konversi ke string
  if (typeof errorMessage === "object" && errorMessage !== null) {
    if ('message' in errorMessage) {
      errorMessage = String(errorMessage.message);
    } else {
      errorMessage = JSON.stringify(errorMessage);
    }
  } else {
    errorMessage = String(errorMessage);
  }

  // 3. Tampilkan Alert otomatis ke Pengguna jika status bukan sukses
  if (error?.response?.status !== successStatus && error?.status !== successStatus) {
    let alertType: "danger" | "warning" | "info" = "danger";

    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      alertType = "danger";
    } else if (error?.response?.status >= 500) {
      alertType = "danger";
    } else {
      alertType = "warning";
    }

    // Panggil alert/toast system Anda
    if (alertManager) {
      alertManager.addAlert(alertType, "Error", errorMessage);
    }
  }

  // 4. Kembalikan respons terstruktur agar tidak merusak UI komponen
  return {
    success: false,
    message: errorMessage,
    error: error
  };
}
```

### 6.2 Contoh Implementasi Layanan API (`services/companiesService.ts`)
Gunakan blok `try-catch` di tingkat pemanggilan *service* API dan teruskan error ke `handleApiError` untuk di-resolve sebelum diakses oleh halaman/komponen React:

```typescript
import api from "@/services/apiClient"; // Axios client terkonfigurasi
import { handleApiError } from "@/utils/handleApiError";

export interface Company {
  id: string;
  name: string;
  slug: string;
  sector: string;
  location: string;
  // ...
}

export async function getCompanyDetail(slug: string): Promise<{ success: boolean; data?: Company; message?: string }> {
  try {
    const response = await api.get(`/api/companies/${slug}`);
    
    // Pastikan mengembalikan data berformat sukses
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    // Tangani error secara otomatis dan kembalikan objek terstandardisasi
    return handleApiError(error);
  }
}
```

---

## 7. Mekanisme Otentikasi Proyek (Authentication Architecture)

Perlu dipahami bahwa backend Flask saat ini **tidak menggunakan token JWT/Bearer** (`authToken`) di sisi klien publik secara bawaan. Berikut adalah mekanisme otentikasi nyata yang harus diimplementasikan oleh frontend Next.js:

1. **Sesi Pengguna Publik (Watchlist, Profil, Custom List)**:
   * Menggunakan **Flask Session Cookies** (`session['user_id']`).
   * **Instruksi Frontend**: Setiap panggilan API dari Next.js ke backend Flask wajib menyertakan kredensial kuki. Jika menggunakan Axios, atur `withCredentials: true`. Jika menggunakan Fetch API, atur `credentials: "include"`.
2. **Dashboard Internal (/admin)**:
   * Menggunakan **HTTP Basic Authentication** (melalui kredensial dasar yang dipetakan di backend).
   * **Instruksi Frontend**: Gunakan header `Authorization: Basic <base64(username:password)>` untuk mengakses API berawalan `/admin/*`.
3. **Akses Data API Publik**:
   * Menggunakan **API Keys** (`api_key`).
   * **Instruksi Frontend**: Kirimkan kunci API melalui header atau parameter query jika mengakses endpoint integrasi publik.

