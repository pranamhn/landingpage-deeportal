"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { adminCardClass } from "@/components/admin/ui/adminTheme";
import { AdminPill } from "@/components/admin/ui/AdminPill";
import { cn } from "@/lib/cn";

interface ApiKey {
  id: string;
  user_id: string;
  username?: string;
  key: string;
  label: string;
  plan: string;
  created_at: number;
  last_used_at?: number;
  revoked_at?: string;
  quota_daily?: number;
}

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [form, setForm] = useState({ user_id: "", label: "", plan: "free" });

  const fetchKeys = async () => {
    try {
      const resp = await fetch("/api/v1/admin/api-keys");
      const json = await resp.json();
      if (json.success) setKeys(json.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleCreate = async () => {
    const resp = await fetch("/api/v1/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await resp.json();
    if (json.success) {
      setNewKey(json.data);
      setShowCreate(false);
      fetchKeys();
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke API key ini?")) return;
    await fetch(`/api/v1/admin/api-keys?id=${id}`, { method: "DELETE" });
    fetchKeys();
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-200 rounded" /><div className="h-64 bg-gray-100 rounded-xl" /></div>;

  const activeKeys = keys.filter((k) => !k.revoked_at);
  const revokedKeys = keys.filter((k) => k.revoked_at);

  return (
    <div>
      <AdminPageHeader
        eyebrow="System"
        title="API Keys"
        description="Track API key usage per user — generate, revoke, dan pantau konsumsi."
        pills={[
          { label: `${activeKeys.length} active`, severity: "good" },
          { label: `${revokedKeys.length} revoked`, severity: "muted" },
        ]}
      />

      {newKey && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/30">
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Key generated!</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-mono dark:bg-gray-800 dark:text-gray-200">{newKey.key}</code>
            <button onClick={() => navigator.clipboard.writeText(newKey.key)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Copy</button>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Simpan key ini — tidak akan ditampilkan lagi.</p>
        </div>
      )}

      <div className="mb-4">
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Generate New Key</button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-600 dark:bg-gray-800">
          <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">Generate New API Key</h4>
          <div className="space-y-3">
            <input type="text" placeholder="User ID" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200" />
            <input type="text" placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200" />
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Create</button>
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className={cn(adminCardClass)}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Label</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">User</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Plan</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Created</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Last Used</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200 font-medium">{k.label}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{k.username || k.user_id?.slice(0, 8)}</td>
                  <td className="px-4 py-2"><AdminPill severity={k.plan === "enterprise" ? "good" : k.plan === "pro" ? "info" : "muted"}>{k.plan}</AdminPill></td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">{k.created_at ? new Date(k.created_at * 1000).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">{k.last_used_at ? new Date(k.last_used_at * 1000).toLocaleDateString() : "never"}</td>
                  <td className="px-4 py-2"><AdminPill severity={k.revoked_at ? "danger" : "good"}>{k.revoked_at ? "Revoked" : "Active"}</AdminPill></td>
                  <td className="px-4 py-2">
                    {!k.revoked_at && (
                      <button onClick={() => handleRevoke(k.id)} className="text-xs font-semibold text-rose-600 hover:underline">Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No API keys yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
