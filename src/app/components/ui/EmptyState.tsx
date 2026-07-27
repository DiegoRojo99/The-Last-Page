import React from "react";
import { cn } from "./cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "surface-paper flex flex-col items-center justify-center rounded-[var(--radius-xl)] px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 text-[var(--neutral-500)]">{icon}</div>
      ) : null}
      <h3 className="text-2xl">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-[var(--neutral-600)]">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
