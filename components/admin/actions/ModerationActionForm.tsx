"use client";

import { AdminActionRow } from "@/components/admin/layout/AdminActionRow";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { AdminPill } from "@/components/admin/ui/AdminPill";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ModerationActionForm({ reference }: { reference: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("under_review");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("reference", reference);
      form.set("status", status);
      form.set("note", note);
      const response = await fetch("/api/v1/admin/moderation", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setMessage(payload.message || "Gagal menyimpan review.");
        return;
      }
      setMessage("Review moderation berhasil disimpan.");
      router.refresh();
    } catch {
      setMessage("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <AdminPill severity="info">Decision panel</AdminPill>
        <span className="text-xs font-medium text-gray-500">Ref {reference}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-[0.9fr_1.2fr]">
      <AdminSelect
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="under_review">under_review</option>
        <option value="accepted">accepted</option>
        <option value="needs_info">needs_info</option>
        <option value="rejected">rejected</option>
      </AdminSelect>
      <AdminInput
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Catatan untuk reviewer / submitter"
      />
      </div>

      <AdminActionRow>
      <AdminButton
        type="submit"
        variant={status === "rejected" ? "danger" : status === "accepted" ? "success" : "primary"}
        disabled={loading}
      >
        {loading ? "Menyimpan..." : "Simpan review"}
      </AdminButton>
        <span className="text-xs leading-5 text-gray-500">
          Pilih status final atau tanda butuh info tambahan sebelum submission masuk ke data terpublikasi.
        </span>
      </AdminActionRow>

      {message ? (
        <AdminActionRow>
          <p className="text-sm text-gray-700">{message}</p>
        </AdminActionRow>
      ) : null}
    </form>
  );
}
