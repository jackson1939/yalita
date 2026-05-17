import { formatUSDC, calculateInterest } from "@/lib/utils";
import { LOAN } from "@yalita/shared";
import { cn } from "@/lib/utils";

interface LoanComparisonTableProps {
  principalUsdc: bigint;
  days: number;
  YalitaTotalDue: bigint;
  YalitaRateBps: number;
}

export function LoanComparisonTable({ principalUsdc, days, YalitaTotalDue, YalitaRateBps }: LoanComparisonTableProps) {
  const informalTotal = principalUsdc + calculateInterest(principalUsdc, LOAN.INFORMAL_RATE_BPS, days);
  const bankTotal = principalUsdc + calculateInterest(principalUsdc, 1800, days);
  const savings = informalTotal - YalitaTotalDue;

  const rows = [
    { label: "🦈 Prestamista informal", rate: `${LOAN.INFORMAL_RATE_BPS / 100}% anual`, total: informalTotal, color: "red" },
    { label: "🏦 Banco (si te aprueban)", rate: "18% anual", total: bankTotal, color: "neutral" },
    { label: "✨ Yalita", rate: `${(YalitaRateBps / 100).toFixed(1)}% anual`, total: YalitaTotalDue, color: "green" },
  ] as const;

  const colorMap = {
    red: { text: "text-red-400", border: "border-red-500/20" },
    neutral: { text: "text-neutral-400", border: "border-white/8" },
    green: { text: "text-quipu-500", border: "border-quipu-500/30" },
  };

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const c = colorMap[row.color];
        return (
          <div key={row.label} className={cn("flex items-center justify-between bg-white/[0.02] border rounded-xl p-4", c.border)}>
            <div>
              <p className={cn("font-semibold text-sm", c.text)}>{row.label}</p>
              <p className="text-neutral-600 text-xs">{row.rate}</p>
            </div>
            <p className={cn("font-black text-lg", c.text)}>{formatUSDC(row.total)}</p>
          </div>
        );
      })}
      {savings > 0n && (
        <p className="text-center text-quipu-500 text-sm font-semibold pt-1">
          🎉 Ahorrás {formatUSDC(savings)} con Yalita vs. el prestamista
        </p>
      )}
    </div>
  );
}
