"use client";

import React, { useEffect } from "react";
import { cn } from "./cn";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, title, onClose, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "surface-elevated w-full max-w-2xl animate-fade-up overflow-hidden",
          className,
        )}
      >
        {title ? (
          <div className="border-b border-[var(--neutral-200)] px-5 py-4">
            <h2 className="text-2xl">{title}</h2>
          </div>
        ) : null}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
