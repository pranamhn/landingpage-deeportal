import { cn } from "@/lib/cn";
import { adminButtonVariantMap, adminControlClass } from "./adminTheme";

export function AdminButton({
  children,
  className,
  disabled,
  type = "button",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof adminButtonVariantMap;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(adminControlClass, adminButtonVariantMap[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
