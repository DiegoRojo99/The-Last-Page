"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "./cn";

type ToastVariant = "success" | "warning" | "error" | "info";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const variantClasses: Record<ToastVariant, string> = {
  success: "border-[#d6f0de] bg-[#edf8f0] text-[var(--color-success)]",
  warning: "border-[#fde6c2] bg-[#fff6e8] text-[var(--color-warning)]",
  error: "border-[#ffd9ce] bg-[#fff0ec] text-[var(--color-danger)]",
  info: "border-[#d7e7ff] bg-[#edf4ff] text-[var(--color-info)]",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "animate-fade-up rounded-[var(--radius-md)] border p-3 shadow-[var(--shadow-md)]",
              variantClasses[toast.variant],
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs opacity-90">{toast.description}</p>
                ) : null}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="rounded px-1 text-xs opacity-70 transition-opacity hover:opacity-100"
                aria-label="Dismiss notification"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
