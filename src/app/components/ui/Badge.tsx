import React from "react";
import { cn } from "./cn";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--neutral-100)] text-[var(--neutral-700)] border-[var(--neutral-200)]",
  success: "bg-[#edf8f0] text-[var(--color-success)] border-[#d6f0de]",
  warning: "bg-[#fff6e8] text-[var(--color-warning)] border-[#fde6c2]",
  danger: "bg-[#fff0ec] text-[var(--color-danger)] border-[#ffd9ce]",
  info: "bg-[#edf4ff] text-[var(--color-info)] border-[#d7e7ff]",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs font-semibold",
        badgeVariantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
