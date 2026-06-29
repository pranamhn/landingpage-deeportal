"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { unsubscribeNewsletter } from "@/lib/api/newsletterService";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) {
      setStatus("error");
      setMessage("Link tidak valid (ID subscriber tidak ditemukan).");
      return;
    }
    unsubscribeNewsletter(id).then((result) => {
      if (result.success) {
        setStatus("done");
        setMessage("Kamu sudah berhenti berlangganan newsletter mingguan.");
      } else {
        setStatus("error");
        setMessage(result.message || "Gagal memproses permintaan.");
      }
    });
  }, [id]);

  return (
    <div className="mx-auto max-w-md">
      <div className="card text-center">
        <h1 className="font-display text-heading-card font-bold">Newsletter Unsubscribe</h1>
        <p className="mt-3 text-sm text-muted">
          {status === "loading" ? "Memproses..." : message}
        </p>
      </div>
    </div>
  );
}
