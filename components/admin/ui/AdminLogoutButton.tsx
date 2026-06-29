"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await fetch("/api/v1/admin/logout", { method: "POST" });
          router.push("/admin/login");
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
    >
      {loading ? "..." : "Logout"}
    </button>
  );
}
