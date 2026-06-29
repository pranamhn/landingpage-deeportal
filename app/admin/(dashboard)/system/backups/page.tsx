"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { adminCardClass, adminButtonVariantMap } from "@/components/admin/ui/adminTheme";
import { AdminPill } from "@/components/admin/ui/AdminPill";
import { cn } from "@/lib/cn";

interface BackupFile {
  name: string;
  size_mb: number;
  created: string;
}

interface SystemData {
  backups: BackupFile[];
  db_size_mb: number;
  table_count: number;
  row_count: number;
  schema_version: number | null;
  integrity?: string;
}

export default function AdminBackupsPage() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchSystem = useCallback(async () => {
    try {
      const resp = await fetch("/api/v1/admin/system");
      const json = await resp.json();
      if (json.success) {
        setData(json.data);
        setError(null);
      } else {
        setError(json.message || "Gagal mengambil data sistem.");
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSystem();
  }, [fetchSystem]);

  const handleCreateBackup = async () => {
    if (!confirm("Buat backup database baru?")) return;
    setCreating(true);
    try {
      const resp = await fetch("/api/v1/admin/system/backup", { method: "POST" });
      const json = await resp.json();
      if (json.success) {
        await fetchSystem();
      } else {
        alert(json.message || "Gagal membuat backup.");
      }
    } catch {
      alert("Gagal terhubung ke server.");
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-3 w-28 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-48 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800" />
          ))}
        </div>
        <div className="h-64 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="System"
        title="Database Backups"
        description="Manage SQLite database backups — create, download, and monitor database health."
        pills={[
          { label: `${data?.backups?.length ?? 0} backups`, severity: "info" },
          data?.integrity === "ok"
            ? { label: "Integrity OK", severity: "good" }
            : { label: "Integrity unknown", severity: "warning" },
        ]}
      />
      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
          {error}
        </div>
      )}
      {data && (
        <>
          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={cn(adminCardClass)}>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Database Size</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{data.db_size_mb} MB</p>
            </div>
            <div className={cn(adminCardClass)}>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Tables</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{data.table_count}</p>
            </div>
            <div className={cn(adminCardClass)}>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Rows</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{data.row_count?.toLocaleString()}</p>
            </div>
            <div className={cn(adminCardClass)}>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Schema Version</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">v{data.schema_version ?? "—"}</p>
            </div>
          </div>

          {/* Create Backup button */}
          <div className="mb-6">
            <button
              type="button"
              disabled={creating}
              onClick={handleCreateBackup}
              className={cn(adminButtonVariantMap.primary, "inline-flex min-h-11 items-center rounded-xl px-6 text-sm")}
            >
              {creating ? "Creating..." : "Create Backup Now"}
            </button>
          </div>

          {/* Backups Table */}
          <div className={cn(adminCardClass)}>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Backup Files</h3>
            {data.backups.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-700 dark:text-gray-500">
                      <th className="pb-2 pr-4 font-semibold">Filename</th>
                      <th className="pb-2 pr-4 font-semibold">Size</th>
                      <th className="pb-2 pr-4 font-semibold">Created</th>
                      <th className="pb-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.backups.map((b) => (
                      <tr key={b.name} className="border-b border-gray-50 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                        <td className="py-2 pr-4 font-mono text-xs text-gray-700 dark:text-gray-300">{b.name}</td>
                        <td className="py-2 pr-4 tabular-nums text-gray-600 dark:text-gray-400">{b.size_mb} MB</td>
                        <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{b.created}</td>
                        <td className="py-2">
                          <a
                            href={`/api/v1/admin/system/backup/${b.name}`}
                            className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                No backups yet. Click "Create Backup Now" to create one.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
