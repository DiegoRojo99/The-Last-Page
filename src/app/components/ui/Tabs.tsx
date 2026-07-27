"use client";

import React from "react";
import { cn } from "./cn";

export interface TabItem<T extends string> {
  label: string;
  value: T;
  badgeCount?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ items, value, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="inline-flex min-w-full gap-2 rounded-[var(--radius-lg)] bg-[var(--neutral-100)] p-1">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold transition-all duration-[var(--motion-fast)] ease-[var(--motion-ease)]",
                active
                  ? "bg-[var(--color-paper)] text-[var(--neutral-900)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--neutral-600)] hover:text-[var(--neutral-800)]",
              )}
            >
              {item.label}
              {typeof item.badgeCount === "number" ? (
                <span className="rounded-[var(--radius-pill)] bg-[var(--neutral-200)] px-2 py-0.5 text-xs">
                  {item.badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
