"use client";

import { resetAutoRefreshBackoff } from "@/components/admin/ui/AdminAutoRefresh";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleReset = () => {
    resetAutoRefreshBackoff();
    reset();
  };

  return (
    <div className="rounded-[24px] border border-rose-400/20 bg-rose-400/10 p-6 text-rose-100">
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-rose-200">Admin error</p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">Dashboard gagal dimuat</h2>
      <p className="mt-3 text-sm text-rose-100/90">
        {error.message || "Terjadi kegagalan saat memuat data dashboard admin."}
      </p>
      <button
        type="button"
        onClick={handleReset}
        className="mt-5 rounded-xl border border-rose-200/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
      >
        Coba lagi
      </button>
    </div>
  );
}
