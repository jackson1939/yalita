import { Card, CardHeader, Badge } from "@/components/ui";
import { RepaymentProgress } from "./RepaymentProgress";
import { formatUSDC, formatAnnualRateBps, formatDate, daysUntil } from "@/lib/utils";
import type { LoanResponse } from "@/lib/api";

interface LoanCardProps {
  loan: LoanResponse;
  compact?: boolean;
}

const STATUS = {
  ACTIVE: { label: "Activo", variant: "success" as const },
  REPAID: { label: "Saldado", variant: "default" as const },
  OVERDUE: { label: "Vencido", variant: "danger" as const },
  DEFAULTED: { label: "En mora", variant: "danger" as const },
};

export function LoanCard({ loan, compact = false }: LoanCardProps) {
  const principal = BigInt(loan.principal);
  const totalDue = BigInt(loan.totalDue);
  const paid = BigInt(loan.paidAmount);
  const remaining = totalDue - paid;
  const days = daysUntil(loan.dueTimestamp);
  const status = STATUS[loan.status];

  return (
    <Card hoverable>
      <CardHeader>
        <div>
          <p className="text-xl font-black text-white">{formatUSDC(principal)}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {formatAnnualRateBps(loan.annualRateBps)} · {loan.durationDays} días
          </p>
        </div>
        <Badge variant={status.variant} size="sm">{status.label}</Badge>
      </CardHeader>

      {!compact && (
        <>
          <RepaymentProgress paidAmount={paid} totalDue={totalDue} />
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div>
              <p className="text-xs text-neutral-500">Pagado</p>
              <p className="text-sm font-bold text-white">{formatUSDC(paid)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Pendiente</p>
              <p className="text-sm font-bold text-white">{formatUSDC(remaining)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">{loan.status === "ACTIVE" ? "Vence en" : "Venció el"}</p>
              <p className={`text-sm font-bold ${loan.status === "ACTIVE" && days < 7 ? "text-red-400" : "text-white"}`}>
                {loan.status === "ACTIVE" ? `${days}d` : formatDate(loan.dueTimestamp)}
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
