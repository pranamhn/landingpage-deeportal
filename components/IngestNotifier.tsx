"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface IngestUpdate {
  events_found: number;
  companies_touched: number;
  timestamp: string;
}

export default function IngestNotifier() {
  const [toast, setToast] = useState<IngestUpdate | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setToast(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    const socket = io("http://127.0.0.1:8080", {
      transports: ["websocket"],
      reconnectionDelay: 5000,
    });

    socket.on("ingest_update", (data: IngestUpdate) => {
      setToast(data);
      toastTimer.current = setTimeout(dismiss, 8000);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [dismiss]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 shadow-lg dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        <span className="text-base">🔄</span>
        <span>
          New data available —{" "}
          <strong>{toast.events_found} events</strong> from{" "}
          <strong>{toast.companies_touched} companies</strong>
        </span>
        <button
          onClick={() => window.location.reload()}
          className="ml-2 rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          Refresh
        </button>
        <button
          onClick={dismiss}
          className="ml-1 text-emerald-500 hover:text-emerald-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
