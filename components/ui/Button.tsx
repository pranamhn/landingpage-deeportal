import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const BASE = "inline-flex items-center justify-center font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "rounded-lg bg-brand-600 text-white hover:bg-brand-700",
  secondary: "rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50",
  outline: "rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50",
  ghost: "text-brand-600 hover:underline",
  danger: "text-danger-600 hover:underline",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
};

const SIZED_VARIANTS = new Set<ButtonVariant>(["primary", "secondary", "outline"]);

export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(BASE, VARIANT_CLASSES[variant], SIZED_VARIANTS.has(variant) && SIZE_CLASSES[size], fullWidth && "w-full", className);
}

export default function Button({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClassName({ variant, size, fullWidth, className })} {...props} />;
}
