import { cn } from "@/lib/cn";
import { adminSurfaceClass } from "./adminTheme";

export function AdminPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        adminSurfaceClass,
        "p-5",
        className,
      )}
    >
      {children}
    </article>
  );
}
