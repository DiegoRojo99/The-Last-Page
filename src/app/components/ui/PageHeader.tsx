import React from "react";
import { cn } from "./cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <header className={cn("surface-elevated px-5 py-6 md:px-7 md:py-7", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-[var(--neutral-600)]">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}