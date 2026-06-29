"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { AdminBrandBadge } from "@/components/admin/ui/AdminBrandBadge";
import { adminSurfaceClass, adminEyebrowClass } from "@/components/admin/ui/adminTheme";
import { cn } from "@/lib/cn";
import { adminLogin } from "@/services/adminAuthService";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setLoading(true);
    const result = await adminLogin(username, password);
    setLoading(false);
    if (!result.success) {
      setError(result.message || "Login admin gagal.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <AdminBrandBadge />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-gray-900">
            Deeportal Internal
          </h1>
          <p className="mt-1 text-sm text-gray-500">Dashboard operator</p>
        </div>

        <div className={cn(adminSurfaceClass, "p-6")}>
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-gray-500 transition hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
          >
            <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Halaman utama
          </Link>
          <p className={cn("mb-1", adminEyebrowClass)}>Admin session</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Masuk dengan akun internal untuk membuka workflow review, ingestion, dan operasi holdco.
          </p>

          {error ? (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
            >
              <svg
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              <span className="text-sm font-semibold text-rose-700">{error}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-username"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Username
              </label>
              <AdminInput
                id="admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username akun internal"
                autoComplete="username"
                required
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Password
              </label>
              <AdminInput
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
            </div>

            <AdminButton type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Memverifikasi...
                </span>
              ) : (
                "Login"
              )}
            </AdminButton>
          </form>
        </div>
      </div>
    </div>
  );
}
