import Link from "next/link";
import NewsletterSignup from "@/components/layout/NewsletterSignup";

// Companies/Investors/Funding/Acquisitions/Founders sudah ada di navbar
// (SiteHeader.tsx) — sengaja TIDAK diulang di sini, cuma yang belum ada di
// navbar/header (Pricing, Submit Data, dan halaman info) yang ditampilkan.
const PRODUCT_LINKS = [
  { href: "/compare", label: "Compare" },
  { href: "/lists", label: "Lists" },
  { href: "/pricing", label: "Pricing" },
  { href: "/submit", label: "Submit Data" },
];

const SWARM_LINKS = [
  { href: "/swarm", label: "Predictions" },
  { href: "/swarm/marketplace", label: "Marketplace" },
  { href: "/swarm/playground", label: "Playground" },
  { href: "/population", label: "Population" },
  { href: "/political", label: "Political" },
];

const INFO_LINKS = [
  { href: "/about", label: "About" },
  { href: "/content/methodology", label: "Methodology" },
  { href: "/content/sources", label: "Data Sources" },
  { href: "/content/privacy", label: "Privacy" },
  { href: "/content/governance", label: "Data Governance" },
  { href: "/content/terms", label: "Terms of Service" },
];

const SUPPORT_EMAIL = "support@deeportal.ai";

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav className="flex flex-col gap-1.5">
      <strong className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{title}</strong>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-brand-600">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-gradient-to-br from-white via-brand-50 to-accent-50 pt-8 pb-4 text-sm text-muted">
      <div className="mx-auto box-border flex w-full max-w-[1220px] flex-col gap-8 px-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="DeePortal.ai" className="h-7 w-auto" />
          <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
            A source-backed Asia startup directory, built for fast, verifiable research.
          </p>
          <div className="mt-3 rounded-xl border border-black/10 bg-white/70 p-3">
            <NewsletterSignup />
          </div>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 inline-block text-sm text-gray-600 hover:text-brand-600">
            {SUPPORT_EMAIL}
          </a>
        </div>
        <div className="grid grid-cols-3 gap-6 lg:gap-12">
          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Swarm" links={SWARM_LINKS} />
          <FooterColumn title="About" links={INFO_LINKS} />
        </div>
      </div>
      <div className="mx-auto mt-6 box-border flex w-full max-w-[1220px] flex-col gap-1.5 border-t border-black/10 px-4 pt-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} DeePortal.ai. Every fact sourced and verifiable.</span>
        <span>Built for Asia&apos;s startup ecosystem.</span>
      </div>
    </footer>
  );
}
