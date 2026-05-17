"use client";

import { useLoanHistory } from "@/hooks";
import { LoanCard } from "@/components/credit/LoanCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Spinner } from "@/components/ui";

export default function HistorialPage() {
  const { data: loans, isLoading } = useLoanHistory();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Historial de créditos"
        description="Todos tus préstamos registrados on-chain en Avalanche."
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !loans?.length ? (
        <EmptyState
          icon="📋"
          title="Aún no tenés créditos"
          description="Cuando solicités tu primer crédito, aparecerá aquí."
          action={{ label: "Solicitar mi primer crédito", href: "/credito/solicitar" }}
        />
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => <LoanCard key={loan.id} loan={loan} />)}
        </div>
      )}
    </div>
  );
}
