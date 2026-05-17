import { cn, formatUSDC } from "@/lib/utils";

interface RepaymentProgressProps {
  paidAmount: bigint;
  totalDue: bigint;
  showLabels?: boolean;
  className?: string;
}

export function RepaymentProgress({ paidAmount, totalDue, showLabels = true, className }: RepaymentProgressProps) {
  const pct = totalDue === 0n ? 0 : Number((paidAmount * 100n) / totalDue);

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabels && (
        <div className="flex justify-between text-xs text-neutral-500">
          <span>Progreso</span>
          <span className="font-medium text-white">{pct}%</span>
        </div>
      )}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700",
            pct >= 100 ? "bg-quipu-500" : pct >= 50 ? "bg-quipu-500/80" : "bg-quipu-500/60"
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-neutral-600">
          <span>{formatUSDC(paidAmount)}</span>
          <span>{formatUSDC(totalDue)}</span>
        </div>
      )}
    </div>
  );
}
