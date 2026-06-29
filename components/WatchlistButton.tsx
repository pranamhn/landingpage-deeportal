"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/api/watchlistService";

export default function WatchlistButton({ companyId }: { companyId: string }) {
  const { isAuthenticated, loading } = useAuth();
  const [watched, setWatched] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    getWatchlist().then((result) => {
      if (result.success) setWatched(result.data.some((c: any) => c.id === companyId));
    });
  }, [isAuthenticated, companyId]);

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <a href="/login" className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-muted hover:bg-gray-200">
        + Watchlist
      </a>
    );
  }

  const toggle = async () => {
    setBusy(true);
    const result = watched ? await removeFromWatchlist(companyId) : await addToWatchlist(companyId);
    if (result.success) setWatched(!watched);
    setBusy(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold disabled:opacity-50 ${
        watched ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-gray-100 text-muted hover:bg-gray-200"
      }`}
    >
      {watched ? "✓ Watchlist" : "+ Watchlist"}
    </button>
  );
}
