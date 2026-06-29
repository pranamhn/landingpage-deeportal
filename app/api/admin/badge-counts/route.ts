import { NextResponse } from "next/server";
import { getBackendAdminJson } from "@/lib/adminBackend";

/** rules/plan_dashboard.md §10 Phase 5.1 — agregator KHUSUS sidebar badge,
 * tidak ada endpoint backend baru: reuse /admin/moderation (total = jumlah
 * pending) dan /admin/data-quality (jumlah item lintas 6 section) yang
 * sudah ada. Gagal aman: kalau salah satu/keduanya gagal (mis. admin role
 * tidak punya akses moderation), balas count 0 utk bagian itu saja, bukan
 * 500 — badge yang tidak akurat sebentar jauh lebih baik daripada sidebar
 * ikut error karena badge count gagal fetch. */
export async function GET() {
  const [moderation, dataQuality] = await Promise.all([
    getBackendAdminJson<{ total: number }>("/api/v1/admin/moderation?status=pending&page=1"),
    getBackendAdminJson<Record<string, unknown[]>>("/api/v1/admin/data-quality"),
  ]);

  const moderationCount = moderation.data?.total ?? 0;
  const dataQualityCount = dataQuality.data
    ? ["missing", "duplicates", "conflicts", "stale", "source_issues", "failures"]
        .reduce((sum, key) => sum + (Array.isArray(dataQuality.data?.[key]) ? dataQuality.data[key].length : 0), 0)
    : 0;

  return NextResponse.json({
    success: true,
    data: {
      moderation: moderationCount,
      submissions: moderationCount,
      dataQuality: dataQualityCount,
    },
  });
}
