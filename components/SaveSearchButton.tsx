"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import { saveSearch } from "@/lib/api/savedSearchesService";
import Button from "@/components/ui/Button";

export default function SaveSearchButton({ params }: { params: Record<string, string> }) {
  const { isAuthenticated, loading } = useAuth();
  const [saved, setSaved] = useState(false);

  if (loading || !isAuthenticated) return null;

  const handleSave = async () => {
    const name = window.prompt("Name for this search:");
    if (!name?.trim()) return;
    const result = await saveSearch(name.trim(), params);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <Button variant="ghost" onClick={handleSave}>
      {saved ? "Saved ✓" : "Save this search"}
    </Button>
  );
}
