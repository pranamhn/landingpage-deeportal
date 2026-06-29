"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="py-16 text-center">
      <h1 className="font-display text-heading-card font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted">The service is experiencing a temporary disruption. Please try again.</p>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </Card>
  );
}
