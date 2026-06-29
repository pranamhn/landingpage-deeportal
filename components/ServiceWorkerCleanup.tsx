"use client";

import { useEffect } from "react";

/** Tidak ada service worker di codebase ini — kalau browser masih punya satu
 * teregistrasi dari versi situs sebelumnya, fetch handler lama itu gagal
 * terus (404/CORS ke origin yang sudah berubah) dan spam "Uncaught (in
 * promise)" di console. Bersihkan sekali di client supaya browser visitor
 * lama tidak terus-terusan menjalankan worker mati ini. */
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  }, []);

  return null;
}
