import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { fetchAdminJson, getStoredAdminSession } from "@/lib/adminBackend";

export const metadata: Metadata = {
  title: "Deeportal Internal Dashboard",
  description: "Dashboard operator internal untuk ingestion, moderation, data quality, dan monitoring sistem.",
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const sessionValue = await getStoredAdminSession();
  if (!sessionValue) {
    redirect("/admin/login");
  }

  const { ok, status, payload } = await fetchAdminJson("/api/v1/admin/auth/me");

  if (!ok) {
    if (status === 401) {
      redirect("/admin/login");
    }
    return (
      <AdminShell>
        <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-6 text-amber-100">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-amber-200">Backend offline</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">Dashboard tidak tersedia</h2>
          <p className="mt-3 text-sm text-amber-100/90">
            {payload?.message || "Backend tidak dapat dijangkau. Silakan coba lagi dalam beberapa saat."}
          </p>
        </div>
      </AdminShell>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
