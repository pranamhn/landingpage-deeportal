"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { getWatchlist, removeFromWatchlist } from "@/lib/api/watchlistService";
import { getSavedSearches, deleteSavedSearch, type SavedSearch } from "@/lib/api/savedSearchesService";
import { getApiKeys, createApiKey, revokeApiKey, type ApiKey } from "@/lib/api/apiKeysService";
import OwnedCompaniesSection from "@/components/OwnedCompaniesSection";
import Card from "@/components/ui/Card";
import Button, { buttonClassName } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyPlain, setNewKeyPlain] = useState("");

  const refresh = () => {
    getWatchlist().then((r) => r.success && setWatchlist(r.data));
    getSavedSearches().then((r) => r.success && setSearches(r.data));
    getApiKeys().then((r) => r.success && setApiKeys(r.data));
  };

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated]);

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <Card className="py-16 text-center">
        <h1 className="font-display text-heading-card font-bold">Log in to view your profile</h1>
        <Link href="/login" className={buttonClassName({ className: "mt-4 inline-flex" })}>Log in</Link>
      </Card>
    );
  }

  const handleRemoveWatch = async (companyId: string) => {
    await removeFromWatchlist(companyId);
    setWatchlist((w) => w.filter((c) => c.id !== companyId));
  };

  const handleDeleteSearch = async (id: string) => {
    await deleteSavedSearch(id);
    setSearches((s) => s.filter((x) => x.id !== id));
  };

  const handleCreateKey = async () => {
    if (!newKeyLabel.trim()) return;
    const result = await createApiKey(newKeyLabel.trim());
    if (result.success) {
      setNewKeyPlain(result.data.key);
      setNewKeyLabel("");
      getApiKeys().then((r) => r.success && setApiKeys(r.data));
    }
  };

  const handleRevokeKey = async (id: string) => {
    await revokeApiKey(id);
    getApiKeys().then((r) => r.success && setApiKeys(r.data));
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="font-display text-display-page font-bold">{user?.name}</h1>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>

      <OwnedCompaniesSection />

      <section>
        <h2 className="mb-3 font-display text-heading-section font-bold">Watchlist</h2>
        <Card className="space-y-2">
          {watchlist.length > 0 ? (
            watchlist.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <a href={`/companies/${c.slug}`} className="font-semibold hover:text-brand-600">{c.name}</a>
                  {c.has_update && (
                    <Badge variant="success" title="New funding activity since you last checked">🔔 New</Badge>
                  )}
                </div>
                <Button variant="danger" onClick={() => handleRemoveWatch(c.id)}>Remove</Button>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted">No companies in your watchlist yet.</p>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-display text-heading-section font-bold">Saved Searches</h2>
        <Card className="space-y-2">
          {searches.length > 0 ? (
            searches.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50">
                <a href={`/companies?${new URLSearchParams(s.query_params).toString()}`} className="font-semibold hover:text-brand-600">{s.name}</a>
                <Button variant="danger" onClick={() => handleDeleteSearch(s.id)}>Remove</Button>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted">No saved searches yet.</p>
          )}
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-heading-section font-bold">API Keys</h2>
          <Link href="/pricing" className="text-sm font-semibold text-brand-600 hover:underline">Need a higher quota? →</Link>
        </div>
        <Card className="space-y-3">
          {newKeyPlain && (
            <div className="rounded-lg bg-warning-50 p-3 text-sm">
              <p className="font-semibold text-warning-600">Save this key now — it won't be shown again:</p>
              <code className="mt-1 block break-all rounded bg-white px-2 py-1 text-xs">{newKeyPlain}</code>
            </div>
          )}
          <div className="flex gap-2">
            <Input value={newKeyLabel} onChange={(e) => setNewKeyLabel(e.target.value)} placeholder="Key label (e.g. backend script)" className="flex-1" />
            <Button onClick={handleCreateKey}>Create Key</Button>
          </div>
          <div className="space-y-2">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <div>
                  <span className="font-semibold">{k.label || "(no label)"}</span>
                  <Badge variant={k.plan === "free" ? "neutral" : "brand"} className="ml-2 capitalize">{k.plan}</Badge>
                  <span className="ml-2 text-xs text-muted">quota {k.quota_daily}/day</span>
                  {k.is_revoked ? <Badge variant="danger" className="ml-2">Revoked</Badge> : null}
                </div>
                {!k.is_revoked && <Button variant="danger" onClick={() => handleRevokeKey(k.id)}>Revoke</Button>}
              </div>
            ))}
            {apiKeys.length === 0 && <p className="py-6 text-center text-sm text-muted">No API keys yet.</p>}
          </div>
        </Card>
      </section>
    </div>
  );
}
