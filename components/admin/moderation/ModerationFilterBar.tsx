"use client";

import { useState, useCallback } from "react";
import { adminInputClass, adminSelectClass } from "@/components/admin/ui/adminTheme";
import { cn } from "@/lib/cn";

interface ModerationFilterBarProps {
  onFilter: (params: { status?: string; kind?: string; search?: string; page?: number }) => void;
  total: number;
}

export function ModerationFilterBar({ onFilter, total }: ModerationFilterBarProps) {
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");

  const apply = useCallback(() => {
    onFilter({
      status: status || undefined,
      kind: kind || undefined,
      page: 1,
    });
  }, [status, kind, onFilter]);

  return (
    <div className="mb-5 flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase text-gray-400">Status</label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            // Use setTimeout so state updates before apply
            setTimeout(() => {
              onFilter({
                status: e.target.value || undefined,
                kind: kind || undefined,
                page: 1,
              });
            }, 0);
          }}
          className={cn(adminSelectClass, "w-36")}
        >
          <option value="">All</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="needs_info">Needs Info</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase text-gray-400">Kind</label>
        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            setTimeout(() => {
              onFilter({
                status: status || undefined,
                kind: e.target.value || undefined,
                page: 1,
              });
            }, 0);
          }}
          className={cn(adminSelectClass, "w-36")}
        >
          <option value="">All</option>
          <option value="company">Company</option>
          <option value="correction">Correction</option>
          <option value="claim">Claim</option>
        </select>
      </div>
      <span className="ml-2 text-xs text-gray-500 self-end pb-2">
        {total} total submissions
      </span>
    </div>
  );
}
