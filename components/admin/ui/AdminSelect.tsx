import { cn } from "@/lib/cn";
import { adminSelectClass } from "./adminTheme";

export function AdminSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(adminSelectClass, className)}>
      {children}
    </select>
  );
}
