"use client";

import { useState } from "react";

export function PayloadSection({ payloadJson }: { payloadJson: string }) {
  const [open, setOpen] = useState(false);

  if (!payloadJson || payloadJson === "{}") return null;

  let formatted: string;
  try {
    formatted = JSON.stringify(JSON.parse(payloadJson), null, 2);
  } catch {
    formatted = payloadJson;
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
      >
        {open ? "Sembunyikan" : "Lihat"} raw JSON
        <span className="text-[10px]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <pre className="mt-3 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700 max-h-64">
          {formatted}
        </pre>
      )}
    </div>
  );
}
