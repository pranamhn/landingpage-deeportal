import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import IngestNotifier from "@/components/IngestNotifier";
import ServiceWorkerCleanup from "@/components/ServiceWorkerCleanup";

export const metadata: Metadata = {
  title: "Asia Startup Directory",
  description: "Asia startup directory. Browse company profiles, funding history, investors, and news — every fact backed by a source.",
  openGraph: {
    title: "DeePortal.ai",
    description: "Asia startup directory with verifiable sources.",
    type: "website",
    siteName: "DeePortal.ai",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const isAdmin = headersList.get("x-is-admin") === "1";

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..600&family=Plus+Jakarta+Sans:wght@500..700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="flex min-h-screen flex-col">
        <ServiceWorkerCleanup />
        <IngestNotifier />
        {isAdmin ? (
          <AuthProvider>{children}</AuthProvider>
        ) : (
          <AuthProvider>
            <SiteHeader />
            <main className="mx-auto box-border w-full max-w-[1220px] flex-1 px-4 py-8">{children}</main>
            <SiteFooter />
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
