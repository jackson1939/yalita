import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loansApi, type LoanResponse } from "@/lib/api";
import { useToast } from "./useToast";

export function useActiveLoan(enabled = true) {
  return useQuery<LoanResponse | null>({
    queryKey: ["loan-active"],
    queryFn: loansApi.active,
    enabled,
    staleTime: 15_000,
  });
}

export function useLoanHistory() {
  return useQuery<LoanResponse[]>({
    queryKey: ["loan-history"],
    queryFn: loansApi.history,
    staleTime: 30_000,
  });
}

export function useRequestLoan() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: loansApi.request,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["loan-active"] });
      void qc.invalidateQueries({ queryKey: ["loan-history"] });
      toast({ type: "success", title: "Crédito aprobado", message: "USDC enviados a tu wallet." });
    },
    onError: (err: Error) => {
      toast({ type: "error", title: "Error al solicitar", message: err.message });
    },
  });
}

export function useRepayLoan() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: loansApi.repay,
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ["loan-active"] });
      void qc.invalidateQueries({ queryKey: ["score"] });
      const msg = data.newStatus === "REPAID"
        ? "Préstamo completamente saldado 🎉"
        : "Pago registrado on-chain";
      toast({ type: "success", title: "Pago exitoso", message: msg });
    },
    onError: (err: Error) => {
      toast({ type: "error", title: "Error al pagar", message: err.message });
    },
  });
}
