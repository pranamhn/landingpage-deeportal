"use client";

import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PipelineActionForm() {
  const router = useRouter();
  const [task, setTask] = useState("");
  const [mode, setMode] = useState("full");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!task.trim()) {
      setMessage("Task tidak boleh kosong.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("task", task);
      form.set("mode", mode);
      const response = await fetch("/api/v1/admin/pipeline", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setMessage(payload.message || "Gagal menjalankan pipeline.");
        return;
      }
      setMessage("Pipeline berhasil dijalankan.");
      setTask("");
      router.refresh();
    } catch {
      setMessage("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-bold text-gray-700">Task orchestrator</label>
        <AdminInput
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Contoh: review quality queue dan rapikan template admin"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-gray-700">Mode pipeline</label>
        <AdminSelect value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="full">full</option>
          <option value="analyze">analyze</option>
          <option value="plan_execute">plan_execute</option>
          <option value="execute_verify">execute_verify</option>
          <option value="parallel">parallel</option>
        </AdminSelect>
      </div>
      <AdminButton type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? "Menjalankan..." : "Run pipeline"}
      </AdminButton>
      {message ? (
        <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {message}
        </p>
      ) : null}
    </form>
  );
}
