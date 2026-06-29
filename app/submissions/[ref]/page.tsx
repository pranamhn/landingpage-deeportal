import Link from "next/link";
import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { getSubmission } from "@/lib/api/submissionsService";

type Props = { params: Promise<{ ref: string }> };

export const metadata: Metadata = { title: "Submission Status — Deeportal" };

const STATUS_LABEL: Record<string, string> = {
  submitted: "Awaiting review",
  under_review: "Under review",
  accepted: "Accepted",
  needs_info: "Needs more info",
  rejected: "Rejected",
};

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  submitted: "neutral",
  under_review: "warning",
  accepted: "success",
  needs_info: "warning",
  rejected: "danger",
};

const KIND_LABEL: Record<string, string> = {
  company: "New data",
  correction: "Data correction",
  claim: "Profile claim",
};

export default async function SubmissionStatusPage({ params }: Props) {
  const { ref } = await params;
  const result = await getSubmission(ref);

  if (!result.success || !result.data) {
    return (
      <Card className="mx-auto max-w-lg py-16 text-center">
        <h1 className="font-display text-heading-card font-bold">Submission not found</h1>
        <p className="mt-2 text-muted">Reference <strong>{ref}</strong> doesn't exist or was mistyped.</p>
        <Link href="/submit" className="mt-4 inline-block text-brand-600 hover:underline">← Back to form</Link>
      </Card>
    );
  }

  const submission = result.data;

  return (
    <div className="mx-auto max-w-lg">
      <section className="mb-8">
        <h1 className="font-display text-display-page font-bold">Submission status</h1>
        <p className="mt-2 text-sm text-muted">Reference: {submission.reference}</p>
      </section>
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{KIND_LABEL[submission.kind] || submission.kind}</span>
          <Badge variant={STATUS_VARIANT[submission.status] || "neutral"}>{STATUS_LABEL[submission.status] || submission.status}</Badge>
        </div>
        {submission.payload?.name && (
          <div>
            <span className="text-xs uppercase tracking-wide text-muted">Name</span>
            <p className="mt-0.5 text-sm">{submission.payload.name}</p>
          </div>
        )}
        {submission.payload?.detail && (
          <div>
            <span className="text-xs uppercase tracking-wide text-muted">Message</span>
            <p className="mt-0.5 text-sm">{submission.payload.detail}</p>
          </div>
        )}
        {submission.review_note && (
          <div>
            <span className="text-xs uppercase tracking-wide text-muted">Reviewer notes</span>
            <p className="mt-0.5 text-sm">{submission.review_note}</p>
          </div>
        )}
      </Card>
      <Link href="/submit" className="mt-4 inline-block text-sm text-brand-600 hover:underline">← Submit other data</Link>
    </div>
  );
}
