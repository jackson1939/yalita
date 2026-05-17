import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "custom";
type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: string;
  dot?: boolean;
}

const VARIANTS: Record<Exclude<BadgeVariant, "custom">, string> = {
  default: "bg-white/8 text-neutral-300 border-white/10",
  success: "bg-quipu-500/15 text-quipu-500 border-quipu-500/20",
  warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  danger: "bg-red-500/15 text-red-400 border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const SIZES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  variant = "default", size = "sm", color, dot = false, className, children, ...props
}: BadgeProps) {
  const custom = variant === "custom" && color
    ? { backgroundColor: `${color}1A`, color, borderColor: `${color}30` }
    : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full border",
        variant !== "custom" && VARIANTS[variant as Exclude<BadgeVariant, "custom">],
        SIZES[size],
        className
      )}
      style={custom}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full" style={color ? { backgroundColor: color } : undefined} />
      )}
      {children}
    </span>
  );
}
