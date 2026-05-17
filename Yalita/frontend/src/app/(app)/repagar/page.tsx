"use client";

import { useState } from "react";
import { useActiveLoan, useRepayLoan } from "@/hooks";
import { Card, Slider, Button, Badge, Spinner } from "@/components/ui";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { RepaymentProgress } from "@/components/credit/RepaymentProgress";
import { formatUSDC, daysUntil, formatDate } from "@/lib/utils";

export default function RepagarPage() {
  const { data: loan, isLoading } = useActiveLoan();
  const [amount, setAmount] = useState(100);
  const repay = useRepayLoan();

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (!loan) {
    return (
      <EmptyState
        icon="✅"
        title="No tenés préstamos activos"
        description="Cuando solicités un crédito, podrás repagarlo desde acá."
        action={{ label: "Solicitar crédito", href: "/credito/solicitar" }}
      />
    );
  }

  const remaining = BigInt(loan.totalDue) - BigInt(loan.paidAmount);
  const days = daysUntil(loan.dueTimestamp);
  const maxRepayUsd = Number(remaining) / 1e6;

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <PageHeader title="Repagar préstamo" description="Cada pago mejora tu Score Yalita automáticamente." />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-400">Préstamo activo</h3>
          <Badge variant="success" size="sm">Activo</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Pendiente</p>
            <p className="text-xl font-black text-white">{formatUSDC(remaining)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Vence en</p>
            <p className={`text-xl font-black ${days < 14 ? "text-red-400" : "text-white"}`}>{days}d</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Fecha</p>
            <p className="text-sm font-bold text-white">{formatDate(loan.dueTimestamp)}</p>
          </div>
        </div>
        <RepaymentProgress paidAmount={BigInt(loan.paidAmount)} totalDue={BigInt(loan.totalDue)} />
      </Card>

      <Card>
        <h3 className="font-semibold text-white mb-4">Pagar ahora</h3>
        <div className="space-y-4">
          <Slider
            label="Monto a pagar"
            value={amount} min={10} max={Math.min(maxRepayUsd, 5000)} step={10}
            format={(v) => `$${v}`}
            onChange={setAmount}
          />
          <div className="grid grid-cols-3 gap-2">
            {[25, 50, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount(Math.round(maxRepayUsd * (pct / 100)))}
                className="text-xs py-1.5 rounded-lg border border-white/10 text-neutral-400 hover:border-quipu-500/40 hover:text-quipu-500 transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
          <Button
            variant="primary" size="lg" fullWidth
            loading={repay.isPending}
            onClick={() => repay.mutate({ amountUsd: amount, source: "MANUAL" })}
          >
            Pagar ${amount} USDC →
          </Button>
        </div>
      </Card>

      <Card variant="accent" padding="sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-quipu-500">🔄</span>
          <h4 className="text-sm font-semibold text-white">Repago automático activado</h4>
        </div>
        <p className="text-xs text-neutral-400">
          El 8% de cada cobro QR que recibas se aplica automáticamente a este préstamo.
        </p>
      </Card>
    </div>
  );
}
