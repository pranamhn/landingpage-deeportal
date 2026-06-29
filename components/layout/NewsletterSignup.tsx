"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { subscribeNewsletter } from "@/lib/api/newsletterService";

export default function NewsletterSignup({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const dark = variant === "dark";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    const result = await subscribeNewsletter(email.trim());
    if (result.success) {
      setStatus("done");
      setMessage("Thanks! Check your inbox each week for the latest funding roundup.");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(result.message || "Subscription failed, please try again.");
    }
  }

  if (status === "done") {
    return <p className={cn("text-sm", dark ? "text-success-50" : "text-success-600")}>{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <p className={cn("text-sm", dark ? "text-white/70" : "text-gray-600")}>
        Weekly funding roundup, free, straight to your inbox.
      </p>
      <div className="flex gap-2">
        {dark ? (
          // Input/Button (components/ui) hardcode light-mode border/ring colors;
          // cn() here is a plain joiner (no tailwind-merge), so passing override
          // utility classes for the SAME property would compete unpredictably
          // with the base component's own classes. Raw element instead — full
          // control, no specificity fight.
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="w-full flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
          />
        ) : (
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="flex-1"
          />
        )}
        <Button type="submit" size="sm" disabled={status === "loading"}>
          {status === "loading" ? "..." : "Subscribe"}
        </Button>
      </div>
      {status === "error" && (
        <p className={cn("text-xs", dark ? "text-danger-50" : "text-danger-600")}>{message}</p>
      )}
    </form>
  );
}
