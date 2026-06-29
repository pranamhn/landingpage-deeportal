export type SubmissionKind = "company" | "correction" | "claim";

export interface CreateSubmissionPayload {
  kind: SubmissionKind;
  source_url: string;
  entity_id?: string;
  email?: string;
  relationship?: string;
  name?: string;
  detail?: string;
}

export interface CreateSubmissionResult {
  id: string;
  reference: string;
  status: string;
}

export interface Submission {
  reference: string;
  kind: SubmissionKind;
  status: "submitted" | "under_review" | "accepted" | "needs_info" | "rejected";
  created_at: number;
  reviewed_at: number | null;
  review_note: string | null;
  payload: Record<string, string>;
}
