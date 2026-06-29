"use client";

import { useState } from "react";

export default function EmbedBadgeCallout({ companySlug }: { companySlug: string }) {
  const [copied, setCopied] = useState(false);
  const badgeSrc = `/api/v1/companies/${companySlug}/badge.svg`;

  const handleCopy = async () => {
    const origin = window.location.origin;
    const profileUrl = `${origin}/companies/${companySlug}`;
    const badgeUrl = `${origin}${badgeSrc}`;
    const snippet = `<a href="${profileUrl}" target="_blank" rel="noopener"><img src="${badgeUrl}" alt="View on DeePortal.ai" width="220" height="40" /></a>`;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeSrc} alt="DeePortal.ai badge preview" width={220} height={40} className="rounded" />
        <div>
          <p className="eyebrow">Embed</p>
          <p className="mt-1 text-sm text-muted">Add this badge to your own website, linked back to your profile here.</p>
        </div>
      </div>
      <button onClick={handleCopy} className="shrink-0 text-sm font-semibold text-brand-600 hover:underline">
        {copied ? "Copied ✓" : "Copy embed code"}
      </button>
    </div>
  );
}
