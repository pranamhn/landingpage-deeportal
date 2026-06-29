import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";

export default function ClaimProfileCallout({ companyName, companySlug }: { companyName: string; companySlug: string }) {
  return (
    <div className="card flex flex-col items-start gap-3 border-dashed sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="eyebrow">Is this your profile?</p>
        <p className="mt-1 text-sm text-muted">See inaccurate data for {companyName}? Claim the profile or submit a correction.</p>
      </div>
      <Link
        href={`/submit?kind=claim&entity_id=${encodeURIComponent(companySlug)}`}
        className={buttonClassName({ variant: "outline", className: "shrink-0" })}
      >
        Claim / Submit correction
      </Link>
    </div>
  );
}
