import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rect" | "circle";
}

export function Skeleton({ variant = "rect", className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-white/6",
        variant === "circle" && "rounded-full",
        variant === "text" && "rounded h-4",
        variant === "rect" && "rounded-xl",
        className
      )}
      {...props}
    />
  );
}

export function ScoreCardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-24" />
        <Skeleton variant="text" className="w-16" />
      </div>
      <div className="flex justify-center">
        <Skeleton variant="circle" className="w-36 h-36" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
      <Skeleton variant="text" className="w-20" />
      <Skeleton variant="text" className="w-28 h-7" />
      <Skeleton variant="text" className="w-16 h-3" />
    </div>
  );
}
