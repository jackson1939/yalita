import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leadingIcon, trailingIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 rounded-xl bg-white/5 border text-white text-sm",
              "placeholder:text-neutral-600 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-quipu-500/40 focus:border-quipu-500/60",
              error
                ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500/60"
                : "border-white/10 hover:border-white/20",
              leadingIcon ? "pl-10" : "pl-3.5",
              trailingIcon ? "pr-10" : "pr-3.5",
              className
            )}
            {...props}
          />
          {trailingIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
              {trailingIcon}
            </span>
          )}
        </div>
        {(error || hint) && (
          <p className={cn("text-xs", error ? "text-red-400" : "text-neutral-500")}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
