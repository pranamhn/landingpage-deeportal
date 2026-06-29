"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { buttonClassName } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/companies", label: "Companies" },
  { href: "/investors", label: "Investors" },
  { href: "/funding", label: "Funding" },
  { href: "/acquisitions", label: "Acquisitions" },
  { href: "/community", label: "Community" },
  { href: "/founders", label: "Founders" },
  { href: "/intelligence/trends", label: "Trends" },
  { href: "/news", label: "News" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-navy-950/10 bg-white/80 backdrop-blur">
      <nav className="mx-auto box-border flex h-16 w-full max-w-[1220px] items-center justify-between overflow-visible px-4 py-4">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-8 w-auto" />
        </Link>

        <div className="hidden items-center gap-5 text-sm font-medium lg:flex">
          <div className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
                className={isActivePath(pathname, link.href) ? "text-brand-700" : "text-gray-600 hover:text-brand-600"}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {!loading && (
            <div className="flex items-center gap-3 border-l border-navy-950/10 pl-3">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="text-gray-600 hover:text-brand-600">{user?.name}</Link>
                  <button onClick={logout} className={buttonClassName({ variant: "secondary", size: "sm" })}>Log out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className={buttonClassName({ variant: "secondary", size: "sm" })}>Log in</Link>
                  <Link href="/register" className={buttonClassName({ variant: "primary", size: "sm", className: "shadow-sm" })}>Sign up</Link>
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg border lg:hidden"
        >
          <span className="sr-only">Menu</span>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-navy-950/10 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
                className={isActivePath(pathname, link.href) ? "text-brand-600" : "text-gray-500 transition-colors hover:text-gray-900"}
              >
                {link.label}
              </Link>
            ))}
            {!loading && (
              isAuthenticated ? (
                <>
                  <Link href="/profile" className="text-gray-600 hover:text-brand-600">{user?.name}</Link>
                  <button onClick={logout} className="text-left text-gray-600 hover:text-brand-600">Log out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-brand-600">Log in</Link>
                  <Link href="/register" className="text-gray-600 hover:text-brand-600">Sign up</Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
