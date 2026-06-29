import Link from "next/link";
import Card from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Card className="py-16 text-center">
      <h1 className="font-display text-heading-card font-bold">Page not found</h1>
      <p className="mt-2 text-muted">The data or page you're looking for isn't available.</p>
      <div className="mt-4 flex justify-center gap-3">
        <Link href="/" className={buttonClassName()}>Homepage</Link>
        <Link href="/companies" className={buttonClassName({ variant: "secondary" })}>Browse Companies</Link>
      </div>
    </Card>
  );
}
