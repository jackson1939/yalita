"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useScore } from "@/hooks";
import { Card, Button, Badge } from "@/components/ui";
import { PageHeader } from "@/components/shared/PageHeader";
import { getScoreTier, SCORE } from "@yalita/shared";
import { formatAnnualRateBps, calculateEstimatedRate, calculateCreditLimit } from "@/lib/utils";

export default function CreditoPage() {
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}` | undefined;
  const { data: scoreData } = useScore(address);

  const score = scoreData?.score ?? null;
  const tier = score ? getScoreTier(score) : null;
  const rateBps = score ? calculateEstimatedRate(score) : null;
  const limitUsd = score ? calculateCreditLimit(score) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title="Crédito" description="Tu acceso a crédito justo basado en tu DPI Score." />

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-neutral-500">Tu Score</p>
          <p className="text-3xl font-black mt-1" style={{ color: tier?.color ?? "#6b7280" }}>{score ?? "—"}</p>
          {tier && <Badge variant="custom" color={tier.color} size="sm" className="mt-1">{tier.label}</Badge>}
        </Card>
        <Card>
          <p className="text-xs text-neutral-500">Tasa estimada</p>
          <p className="text-3xl font-black text-white mt-1">{rateBps ? formatAnnualRateBps(rateBps) : "—"}</p>
          <p className="text-xs text-neutral-600 mt-1">vs 180% del informal</p>
        </Card>
        <Card variant="accent">
          <p className="text-xs text-neutral-500">Límite disponible</p>
          <p className="text-3xl font-black text-quipu-500 mt-1">{limitUsd > 0 ? `$${limitUsd.toLocaleString()}` : "—"}</p>
          <p className="text-xs text-neutral-600 mt-1">USDC en Avalanche</p>
        </Card>
      </div>

      {score && score >= SCORE.CREDIT_FLOOR ? (
        <Link href="/credito/solicitar">
          <Button variant="primary" size="lg" fullWidth>Solicitar crédito ahora →</Button>
        </Link>
      ) : (
        <Card padding="lg" className="text-center space-y-3">
          <p className="text-neutral-400">Necesitás un Score mínimo de 450 para acceder a crédito.</p>
          <Link href="/onboarding/conectar" className="inline-block text-quipu-500 hover:underline text-sm">
            Mejorar mi Score →
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-300">Cómo funciona</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: "⚡", title: "Aprobación instantánea", description: "Sin papeles. Tu score aprueba en segundos." },
            { icon: "💰", title: "Tasa justa según tu score", description: "Score alto = tasa baja. Desde 12% anual." },
            { icon: "🔄", title: "Repago automático", description: "Un % de tus cobros QR va directo al pool." },
            { icon: "📈", title: "Tu score mejora pagando", description: "Cada repago a tiempo abre mejores condiciones." },
          ].map((item) => (
            <Card key={item.title} variant="ghost" padding="sm">
              <span className="text-2xl">{item.icon}</span>
              <p className="font-semibold text-sm text-white mt-2">{item.title}</p>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/credito/historial" className="text-sm text-neutral-500 hover:text-white">
          Ver historial de créditos →
        </Link>
      </div>
    </div>
  );
}
