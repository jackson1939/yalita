import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "accent" | "ghost" | "danger";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
}

const VARIANTS: Record<CardVariant, string> = {
  default: "bg-white/[0.03] border border-white/8",
  accent: "bg-quipu-500/5 border border-quipu-500/20",
  ghost: "bg-transparent border border-white/5",
  danger: "bg-red-500/5 border border-red-500/20",
};

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", hoverable = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl transition-colors duration-200",
        VARIANTS[variant],
        PADDING[padding],
        hoverable && "hover:border-white/15 cursor-pointer",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-medium text-neutral-400", className)} {...props} />;
}

export function CardDivider() {
  return <div className="border-t border-white/5 -mx-6 my-4" />;
}
