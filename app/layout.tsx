import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ServiceWorkerCleanup from "@/components/ServiceWorkerCleanup";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

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
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_BACKEND_ORIGIN || process.env.HOLDCO_BACKEND_ORIGIN || "http://127.0.0.1:8080"} />
        <link rel="preload" as="image" href="/logo.webp" fetchPriority="high" />
      </head>
      <body className={`${inter.className} ${plusJakartaSans.variable} flex min-h-screen flex-col`}>
        <ServiceWorkerCleanup />
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
