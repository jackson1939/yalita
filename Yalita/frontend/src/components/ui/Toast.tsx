"use client";

import { useEffect } from "react";
import { useToastStore, type Toast } from "@/stores";
import { cn } from "@/lib/utils";

const ICONS: Record<Toast["type"], string> = { success: "✓", error: "✕", warning: "!", info: "i" };
const STYLES: Record<Toast["type"], string> = {
  success: "bg-quipu-500/20 border-quipu-500/40 text-quipu-500",
  error: "bg-red-500/20 border-red-500/40 text-red-400",
  warning: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
  info: "bg-blue-500/20 border-blue-500/40 text-blue-400",
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast, dismiss]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 min-w-72 max-w-sm p-4 rounded-xl border shadow-xl bg-neutral-900 animate-fade-up",
        STYLES[toast.type]
      )}
      role="alert"
    >
      <span className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-px border",
        STYLES[toast.type]
      )}>
        {ICONS[toast.type]}
      </span>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-sm font-semibold text-white">{toast.title}</p>}
        {toast.message && <p className="text-xs text-neutral-400 mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => dismiss(toast.id)}
        className="text-neutral-600 hover:text-white transition-colors flex-shrink-0"
        aria-label="Cerrar"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 items-end pointer-events-none">
      <div className="contents pointer-events-auto">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
      </div>
    </div>
  );
}
