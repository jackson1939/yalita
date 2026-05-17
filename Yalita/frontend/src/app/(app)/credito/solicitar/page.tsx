"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useScore, useLoanQuote, useRequestLoan } from "@/hooks";
import { Card, Slider, Button } from "@/components/ui";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoanComparisonTable } from "@/components/credit/LoanComparisonTable";
import { formatUSDC, formatAnnualRateBps } from "@/lib/utils";

export default function SolicitarPage() {
  const router = useRouter();
  const { user } = usePrivy();
  const { data: scoreData } = useScore(user?.wallet?.address as `0x${string}` | undefined);
  const [amount, setAmount] = useState(500);
  const [days, setDays] = useState(90);

  const { data: quote } = useLoanQuote(amount, days);
  const request = useRequestLoan();

  const principal = BigInt(amount * 1e6);

  async function handleConfirm() {
    await request.mutateAsync({ principalUsd: amount, durationDays: days });
    router.push("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <PageHeader title="Solicitar crédito" description="Ajustá el monto y el plazo. La tasa se calcula con tu Score." />

      {scoreData?.score && (
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-quipu-500/20 flex items-center justify-center text-quipu-500 font-black text-sm">
              {scoreData.score}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Tu Score: {scoreData.score}</p>
              <p className="text-xs text-neutral-500">Determina tu tasa</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="space-y-6">
          <Slider
            label="Monto del préstamo"
            value={amount} min={50} max={5000} step={50}
            format={(v) => `$${v.toLocaleString()}`}
            onChange={setAmount}
            minLabel="$50" maxLabel="$5,000"
          />
          <Slider
            label="Plazo de devolución"
            value={days} min={30} max={365} step={30}
            format={(v) => `${v} días`}
            onChange={setDays}
            minLabel="30 días" maxLabel="1 año"
          />
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-300">Comparativa de opciones</h3>
        {quote && (
          <LoanComparisonTable
            principalUsdc={principal}
            days={days}
            YalitaTotalDue={BigInt(quote.totalDue)}
            YalitaRateBps={quote.annualRateBps}
          />
        )}
      </div>

      <Card variant="accent">
        <h3 className="font-bold text-white mb-4">Resumen</h3>
        <div className="space-y-2 text-sm">
          {[
            ["Monto solicitado", formatUSDC(principal)],
            ["Interés total", quote ? formatUSDC(BigInt(quote.totalDue) - principal) : "..."],
            ["Fee de originación (1.5%)", formatUSDC((principal * 150n) / 10000n)],
            ["Tasa anual", quote ? formatAnnualRateBps(quote.annualRateBps) : "..."],
            ["Total a devolver", quote ? formatUSDC(quote.totalDue) : "..."],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-neutral-500">{label}</span>
              <span className="text-white font-medium">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button
            variant="primary" size="lg" fullWidth
            loading={request.isPending}
            disabled={!quote || request.isPending}
            onClick={handleConfirm}
          >
            Confirmar y recibir USDC →
          </Button>
          <p className="text-xs text-neutral-600 text-center mt-3">
            Al confirmar, autorizás el contrato de Yalita en Avalanche.
          </p>
        </div>
      </Card>
    </div>
  );
}
