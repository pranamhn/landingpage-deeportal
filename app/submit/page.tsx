"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createSubmission } from "@/lib/api/submissionsService";
import type { SubmissionKind } from "@/types/submission";

const KIND_OPTIONS: { value: SubmissionKind; label: string }[] = [
  { value: "company", label: "New data (company, funding, acquisition, person)" },
  { value: "correction", label: "Correction to existing data" },
  { value: "claim", label: "Claim this profile as mine" },
];

const REVIEW_STEPS = [
  { step: "01", title: "You submit", body: "A source link is required — every fact on DeePortal must trace back to where it came from." },
  { step: "02", title: "Operator reviews", body: "A person checks the source against what you submitted before anything goes live. No auto-publish." },
  { step: "03", title: "Published or rejected", body: "Approved data appears on the relevant profile. You can track status with your reference number." },
];

function SubmitForm() {
  const searchParams = useSearchParams();
  const initialKind = (searchParams.get("kind") as SubmissionKind) || "company";

  const [kind, setKind] = useState<SubmissionKind>(KIND_OPTIONS.some((o) => o.value === initialKind) ? initialKind : "company");
  const [entityId, setEntityId] = useState(searchParams.get("entity_id") || "");
  const [sourceUrl, setSourceUrl] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  const needsEntity = kind === "correction" || kind === "claim";
  const needsClaimFields = kind === "claim";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await createSubmission({
      kind,
      source_url: sourceUrl,
      entity_id: entityId.trim() || undefined,
      email: email.trim() || undefined,
      relationship: relationship.trim() || undefined,
      name: name.trim() || undefined,
      detail: detail.trim() || undefined,
    });
    setSubmitting(false);
    if (result.success) {
      setReference(result.data.reference);
    } else {
      setError(result.message);
    }
  }

  if (reference) {
    return (
      <Card className="text-center">
        <p className="eyebrow">Submitted</p>
        <h1 className="mt-2 font-display text-heading-card font-bold">Your submission is being reviewed</h1>
        <p className="mt-2 text-sm text-muted">Reference: <span className="font-semibold text-gray-900">{reference}</span></p>
        <Link href={`/submissions/${reference}`} className="mt-4 inline-block text-brand-600 hover:underline">View submission status →</Link>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p>}

      <div>
        <p className="eyebrow mb-2">What are you submitting</p>
        <Select value={kind} onChange={(e) => setKind(e.target.value as SubmissionKind)}>
          {KIND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      <div className="border-t border-black/5 pt-5">
        <label className="mb-1 block text-sm font-semibold text-gray-900">
          Entity slug or ID {needsEntity ? "" : "(optional)"}
        </label>
        <Input
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="e.g.: gojek"
          required={needsEntity}
        />
        <p className="mt-1 text-xs text-muted">The slug appears in the profile URL, e.g. deeportal.ai/companies/<strong>gojek</strong>.</p>
      </div>

      {needsClaimFields && (
        <div className="grid gap-4 border-t border-black/5 pt-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-900">Your email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-900">Your relationship to this entity</label>
            <Input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g.: founder, employee, official representative"
              required
            />
          </div>
        </div>
      )}

      <div className="border-t border-black/5 pt-5">
        <label className="mb-1 block text-sm font-semibold text-gray-900">Source link</label>
        <Input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
          required
        />
        <p className="mt-1 text-xs text-muted">Required — a news article, press release, or official page that backs up the data. No source, no fact.</p>
      </div>

      <div className="border-t border-black/5 pt-5">
        <label className="mb-1 block text-sm font-semibold text-gray-900">Name (optional)</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name of the company/person in question" />
      </div>

      <div className="border-t border-black/5 pt-5">
        <label className="mb-1 block text-sm font-semibold text-gray-900">Message</label>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          required
          rows={4}
          placeholder="Describe the data you'd like to submit — what changed, what's missing, or what's wrong."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <Button type="submit" fullWidth disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
    </form>
  );
}

export default function SubmitPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow mb-2">Contribute data</p>
        <h1 className="font-display text-display-page font-bold">Submit or correct data</h1>
        <p className="mt-2 max-w-prose text-muted">
          Add a company, funding round, or person we&apos;re missing — or flag something that&apos;s
          wrong. Every submission is reviewed by an operator against its source before it goes live.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Suspense fallback={null}>
          <SubmitForm />
        </Suspense>

        <div className="space-y-4">
          <div className="card">
            <p className="eyebrow mb-3">How review works</p>
            <div className="space-y-3">
              {REVIEW_STEPS.map((s) => (
                <div key={s.step} className="flex gap-3">
                  <span className="font-display text-lg font-extrabold text-brand-200">{s.step}</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{s.title}</h3>
                    <p className="text-xs text-muted">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-gradient-to-br from-brand-50 to-accent-50">
            <h3 className="font-display text-sm font-bold text-gray-900">Good source examples</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              <li>• News article announcing a funding round or acquisition</li>
              <li>• Official press release or company blog post</li>
              <li>• LinkedIn/company page confirming a role or title</li>
              <li>• Government registry or filing</li>
            </ul>
            <Link href="/content/methodology" className="mt-3 inline-block text-xs font-semibold text-brand-600 hover:underline">
              How we verify data →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
