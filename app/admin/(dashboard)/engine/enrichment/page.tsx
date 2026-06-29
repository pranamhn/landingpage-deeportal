"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { adminCardClass, adminButtonVariantMap } from "@/components/admin/ui/adminTheme";
import { AdminPill } from "@/components/admin/ui/AdminPill";
import { cn } from "@/lib/cn";

interface ServiceState {
  running: boolean;
  pid: number | null;
}

interface EnrichmentStatus {
  companies: ServiceState;
  investors: ServiceState;
  people: ServiceState;
}

const SERVICE_LABELS: { key: keyof EnrichmentStatus; name: string; which: string }[] = [
  { key: "companies", name: "Companies", which: "companies" },
  { key: "investors", name: "Investors", which: "investors" },
  { key: "people", name: "Founders", which: "people" },
];

export default function AdminEnrichmentPage() {
  const [status, setStatus] = useState<EnrichmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const resp = await fetch("/api/v1/admin/enrichment/status");
      const json = await resp.json();
      if (json.success) {
        setStatus(json.data);
        setError(null);
      } else {
        setError(json.message || "Gagal mengambil status enrichment.");
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleAction = async (which: string, action: "start" | "stop") => {
    setActionPending(which);
    try {
      const resp = await fetch(`/api/v1/admin/enrichment/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ which }),
      });
      const json = await resp.json();
      if (json.success) {
        await fetchStatus();
      } else {
        alert(json.message || `Gagal ${action} enrichment.`);
      }
    } catch {
      alert("Gagal terhubung ke server.");
    }
    setActionPending(null);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-3 w-28 rounded-full bg-gray-200" />
        <div className="h-8 w-48 rounded-xl bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl border border-gray-200 bg-gray-50" />
          ))}
        </div>
      </div>
    );
  }

  const services = status
    ? SERVICE_LABELS.map((l) => ({ ...l, state: status[l.key] }))
    : [];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Engine Control"
        title="Enrichment"
        description="Backfill incomplete profiles — enrich companies, investors, and founders with missing data."
        pills={[
          {
            label: services.some((s) => s.state?.running) ? "Enrichment running" : "All idle",
            severity: services.some((s) => s.state?.running) ? "warning" : "info",
          },
        ]}
      />
      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((svc) => {
          const running = svc.state?.running ?? false;
          return (
            <div key={svc.which} className={cn(adminCardClass, running && "border-amber-300 bg-amber-50/50")}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">{svc.name}</h3>
                <AdminPill severity={running ? "warning" : "muted"}>
                  {running ? "Running" : "Idle"}
                </AdminPill>
              </div>
              {running && svc.state?.pid && (
                <p className="text-xs text-gray-500 mb-3">PID: {svc.state.pid}</p>
              )}
              <button
                type="button"
                disabled={actionPending === svc.which}
                onClick={() => handleAction(svc.which, running ? "stop" : "start")}
                className={cn(
                  "inline-flex min-h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition disabled:opacity-60",
                  running
                    ? "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                    : adminButtonVariantMap.primary,
                )}
              >
                {actionPending === svc.which ? "..." : running ? "Stop" : "Run Now"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
