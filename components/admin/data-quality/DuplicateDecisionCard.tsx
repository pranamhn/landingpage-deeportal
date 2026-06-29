"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminPill } from "@/components/admin/ui/AdminPill";
import { cn } from "@/lib/cn";
import type { AdminCompareProfile, AdminSeverity } from "@/types/admin";
import { adminGhostControlClass } from "@/components/admin/ui/adminTheme";

export function DuplicateDecisionCard({
  leftProfile,
  rightProfile,
  similarityLabel,
  severity,
}: {
  leftProfile: AdminCompareProfile;
  rightProfile: AdminCompareProfile;
  similarityLabel: string;
  severity: AdminSeverity;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"a" | "b" | "skip" | null>(null);
  const [message, setMessage] = useState("");
  const [skipped, setSkipped] = useState(false);

  async function submitMerge(primaryId: string, duplicateId: string, choice: "a" | "b") {
    setLoading(choice);
    setMessage("");
    try {
      const response = await fetch("/api/v1/admin/data-quality/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary_id: primaryId, duplicate_id: duplicateId }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setMessage(payload.message || "Gagal menjalankan keputusan merge.");
        return;
      }
      setMessage(choice === "a" ? "Profil A dipertahankan, profil B digabung." : "Profil B dipertahankan, profil A digabung.");
      router.refresh();
    } catch {
      setMessage("Gagal terhubung ke server.");
    } finally {
      setLoading(null);
    }
  }

  function facts(profile: AdminCompareProfile) {
    return [
      { label: "Sektor", value: profile.sector || "—" },
      { label: "Lokasi", value: profile.location || "—" },
      { label: "Berdiri", value: profile.foundedYear || "—" },
      { label: "Status", value: profile.status || "—" },
      { label: "Website", value: profile.website || "—", full: true },
    ];
  }

  if (skipped) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Candidate duplicate</h3>
            <AdminPill severity={severity}>{similarityLabel}</AdminPill>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Tentukan profil yang dipertahankan, atau skip jika keduanya memang entitas berbeda.
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Profil A */}
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/30">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">Profil A</span>
            <Link href={`/companies/${leftProfile.id}`} className={adminGhostControlClass}>
              Lihat profil A
            </Link>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{leftProfile.name}</h4>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {facts(leftProfile).map((fact) => (
              <div
                key={`left-${fact.label}`}
                className={cn(
                  "rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800",
                  fact.full ? "sm:col-span-2" : "",
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">{fact.label}</p>
                <p className="mt-1 break-all text-sm text-gray-800 dark:text-gray-200">{fact.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Akan menyimpan profil A dan menggabungkan profil B ke dalamnya.</p>
        </div>

        {/* Profil B */}
        <div className="rounded-2xl border border-accent-200 bg-accent-50 p-4 dark:border-accent-800 dark:bg-accent-900/30">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-accent-600 dark:text-accent-400">Profil B</span>
            <Link href={`/companies/${rightProfile.id}`} className={adminGhostControlClass}>
              Lihat profil B
            </Link>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{rightProfile.name}</h4>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {facts(rightProfile).map((fact) => (
              <div
                key={`right-${fact.label}`}
                className={cn(
                  "rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800",
                  fact.full ? "sm:col-span-2" : "",
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">{fact.label}</p>
                <p className="mt-1 break-all text-sm text-gray-800 dark:text-gray-200">{fact.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Akan menyimpan profil B dan menggabungkan profil A ke dalamnya.</p>
        </div>
      </div>

      {/* Decision Panel */}
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Ambil keputusan</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pilih profil yang dipertahankan, atau skip jika memang berbeda.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <AdminButton
              variant="ghost"
              disabled={loading !== null}
              onClick={() => submitMerge(leftProfile.id, rightProfile.id, "a")}
              className="border-brand-400/30 bg-brand-400/12 text-gray-900 hover:border-brand-200/40 hover:bg-brand-400/18 dark:text-gray-100 dark:hover:bg-brand-400/20 sm:min-w-32"
            >
              {loading === "a" ? "Menyimpan..." : "Pilih A"}
            </AdminButton>
            <AdminButton
              variant="ghost"
              disabled={loading !== null}
              onClick={() => submitMerge(rightProfile.id, leftProfile.id, "b")}
              className="border-violet-400/30 bg-violet-400/12 text-violet-100 hover:border-violet-300/40 hover:bg-violet-400/18 dark:hover:bg-violet-400/20 sm:min-w-32"
            >
              {loading === "b" ? "Menyimpan..." : "Pilih B"}
            </AdminButton>
            <AdminButton
              variant="ghost"
              disabled={loading !== null}
              onClick={async () => {
                setLoading("skip");
                setMessage("");
                try {
                  const response = await fetch("/api/v1/admin/data-quality/skip", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ company_id_a: leftProfile.id, company_id_b: rightProfile.id }),
                  });
                  const payload = await response.json();
                  if (!response.ok || !payload.success) {
                    setMessage(payload.message || "Gagal menandai candidate sebagai beda perusahaan.");
                    return;
                  }
                  setSkipped(true);
                  router.refresh();
                } catch {
                  setMessage("Gagal terhubung ke server.");
                } finally {
                  setLoading(null);
                }
              }}
              className={cn("border-gray-200 sm:min-w-32 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700")}
            >
              {loading === "skip" ? "Menyimpan..." : "Skip"}
            </AdminButton>
          </div>
        </div>
      </div>

      {message ? <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p> : null}
    </div>
  );
}
