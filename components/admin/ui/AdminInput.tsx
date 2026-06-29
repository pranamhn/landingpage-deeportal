import { cn } from "@/lib/cn";
import { adminInputClass } from "./adminTheme";

export function AdminInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(adminInputClass, className)} />;
}
