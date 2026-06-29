"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const FAILURE_STORAGE_KEY = "holdco_admin_refresh_failures";
const MAX_FAILURES = 5;

function getFailureCount(): number {
  if (typeof sessionStorage === "undefined") return 0;
  try {
    return parseInt(sessionStorage.getItem(FAILURE_STORAGE_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function incrementFailureCount(): number {
  if (typeof sessionStorage === "undefined") return 0;
  try {
    const next = getFailureCount() + 1;
    sessionStorage.setItem(FAILURE_STORAGE_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export function resetAutoRefreshBackoff() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(FAILURE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function AdminAutoRefresh({
  intervalMs = 30_000,
  enabled = true,
}: {
  intervalMs?: number;
  enabled?: boolean;
}) {
  const router = useRouter();
  const mounted = useRef(false);
  const failuresAtStart = useRef(getFailureCount());

  useEffect(() => {
    mounted.current = true;
    if (!enabled) return;

    // If we've already accumulated too many failures, don't start refreshing
    if (failuresAtStart.current >= MAX_FAILURES) return;

    const id = setInterval(() => {
      if (!mounted.current) return;
      const failures = incrementFailureCount();
      if (failures >= MAX_FAILURES) {
        clearInterval(id);
        return;
      }
      router.refresh();
    }, intervalMs);

    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [intervalMs, enabled, router]);

  return null;
}
