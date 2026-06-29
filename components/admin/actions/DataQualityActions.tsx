"use client";

import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DuplicateScanForm() {
  const router = useRouter();
  const [threshold, setThreshold] = useState("0.84");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        try {
          const form = new FormData();
          form.set("threshold", threshold);
          const response = await fetch("/api/v1/admin/data-quality/scan-dupes", { method: "POST", body: form });
          const payload = await response.json();
          if (!response.ok || !payload.success) {
            setMessage(payload.message || "Gagal scan duplicates.");
            return;
          }
          setMessage("Duplicate scan berhasil dijalankan.");
          router.refresh();
        } catch {
          setMessage("Gagal terhubung ke server.");
        } finally {
          setLoading(false);
        }
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <AdminInput
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
        className="w-28 px-3 py-2"
      />
      <AdminButton type="submit" disabled={loading} className="px-4 py-2">
        {loading ? "Scan..." : "Scan duplicates"}
      </AdminButton>
      {message ? <p className="basis-full text-sm text-gray-700">{message}</p> : null}
    </form>
  );
}

export function ManualMergeForm() {
  const router = useRouter();
  const [primaryId, setPrimaryId] = useState("");
  const [duplicateId, setDuplicateId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        try {
          const form = new FormData();
          form.set("primary_id", primaryId);
          form.set("duplicate_id", duplicateId);
          const response = await fetch("/api/v1/admin/data-quality/merge", { method: "POST", body: form });
          const payload = await response.json();
          if (!response.ok || !payload.success) {
            setMessage(payload.message || "Gagal merge duplicate.");
            return;
          }
          setMessage("Merge duplicate berhasil dijalankan.");
          setPrimaryId("");
          setDuplicateId("");
          router.refresh();
        } catch {
          setMessage("Gagal terhubung ke server.");
        } finally {
          setLoading(false);
        }
      }}
      className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
    >
      <AdminInput
        value={primaryId}
        onChange={(e) => setPrimaryId(e.target.value)}
        placeholder="primary_id"
      />
      <AdminInput
        value={duplicateId}
        onChange={(e) => setDuplicateId(e.target.value)}
        placeholder="duplicate_id"
      />
      <AdminButton type="submit" variant="success" disabled={loading}>
        {loading ? "Merge..." : "Merge manual"}
      </AdminButton>
      {message ? <p className="md:col-span-3 text-sm text-gray-700">{message}</p> : null}
    </form>
  );
}
