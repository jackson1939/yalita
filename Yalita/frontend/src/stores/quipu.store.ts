import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  WalletTransaction,
  ScoreEvent,
  ActiveLoan,
  PastLoan,
  usdcToBs,
  bsToUsdc,
} from "@/types/quipu.types";

// ── Credit limit tiers (matches LendingPool.sol logic) ──────────────────────
function calcCreditLimitBs(score: number): number {
  if (score >= 750) return 8000;
  if (score >= 680) return 6000;
  if (score >= 600) return 4000;
  if (score >= 500) return 2000;
  return 1000;
}

// ── State interface ──────────────────────────────────────────────────────────
interface QuipuState {
  // Identity
  userId: string;
  userName: string;
  userPhone: string;
  isCiVerified: boolean;

  // Wallet
  balanceUsdc: number;
  transactions: WalletTransaction[];

  // Score
  score: number;
  scoreHistory: ScoreEvent[];
  isScoreLoaded: boolean;
  dataSource: "external" | "internal" | "hybrid";

  // Credit
  activeLoan: ActiveLoan | null;
  loanHistory: PastLoan[];

  // ── Computed ──────────────────────────────────────────────────────────────
  getBalanceBs: () => number;
  getCreditLimitBs: () => number;
  getAvailableCreditBs: () => number;

  // ── Identity actions ──────────────────────────────────────────────────────
  setUserName: (name: string) => void;
  setUserPhone: (phone: string) => void;
  verifyCi: () => void;

  // ── Score actions ─────────────────────────────────────────────────────────
  setScore: (score: number) => void;
  setScoreLoaded: (loaded: boolean) => void;
  setDataSource: (source: "external" | "internal" | "hybrid") => void;

  // ── Wallet actions ────────────────────────────────────────────────────────
  receiveLoan: (principalBs: number, termMonths: number) => void;
  receiveQRPayment: (amountBs: number, merchant?: string) => void;
  payInstallment: (amountBs?: number) => void;

  // Legacy compat
  setActiveLoan: (loan: ActiveLoan) => void;

  // ── Reset ─────────────────────────────────────────────────────────────────
  reset: () => void;
}

const INITIAL_STATE = {
  userId: "user_mock",
  userName: "María Choque",
  userPhone: "",
  isCiVerified: false,
  balanceUsdc: 0,
  transactions: [] as WalletTransaction[],
  score: 680,
  scoreHistory: [] as ScoreEvent[],
  isScoreLoaded: false,
  dataSource: "external" as const,
  activeLoan: null as ActiveLoan | null,
  loanHistory: [] as PastLoan[],
};

// ── Store ────────────────────────────────────────────────────────────────────
export const useQuipuStore = create<QuipuState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ── Computed ────────────────────────────────────────────────────────────
      getBalanceBs: () => usdcToBs(get().balanceUsdc),

      getCreditLimitBs: () => {
        const { score, isCiVerified } = get();
        const base = calcCreditLimitBs(score);
        return isCiVerified ? base : Math.min(base, 1500);
      },

      getAvailableCreditBs: () => {
        const { activeLoan, score, isCiVerified } = get();
        const limit = isCiVerified
          ? calcCreditLimitBs(score)
          : Math.min(calcCreditLimitBs(score), 1500);
        if (!activeLoan) return limit;
        if (
          activeLoan.status === "active" &&
          activeLoan.paidInstallments >= Math.ceil(activeLoan.termMonths / 2)
        ) {
          return Math.round(limit * 0.5);
        }
        return 0;
      },

      // ── Identity ─────────────────────────────────────────────────────────────
      setUserName: (userName) => set({ userName }),
      setUserPhone: (userPhone) => set({ userPhone }),
      verifyCi: () => set({ isCiVerified: true }),

      // ── Score ────────────────────────────────────────────────────────────────
      setScore: (score) => set({ score }),
      setScoreLoaded: (isScoreLoaded) => set({ isScoreLoaded }),
      setDataSource: (dataSource) => set({ dataSource }),

      // ── Legacy compat ─────────────────────────────────────────────────────────
      setActiveLoan: (loan) => set({ activeLoan: loan }),

      // ── Receive loan ──────────────────────────────────────────────────────────
      receiveLoan: (principalBs, termMonths) => {
        const principalUsdc = bsToUsdc(principalBs);
        const annualRate = 0.18;
        const monthlyRate = annualRate / 12;
        const totalPayableBs = Math.round(principalBs * (1 + monthlyRate * termMonths));
        const totalPayableUsdc = bsToUsdc(totalPayableBs);
        const monthlyPaymentBs = Math.round(totalPayableBs / termMonths);
        const monthlyPaymentUsdc = bsToUsdc(monthlyPaymentBs);

        const now = new Date();
        const loanId = `loan_${Date.now()}`;

        const loan: ActiveLoan = {
          loanId,
          principalUsdc,
          principalBs,
          totalPayableUsdc,
          totalPayableBs,
          monthlyPaymentUsdc,
          monthlyPaymentBs,
          termMonths,
          paidInstallments: 0,
          paidTowardsNextUsdc: 0,
          status: "active",
          createdAt: now,
        };

        const tx: WalletTransaction = {
          id: `tx_${Date.now()}_loan`,
          type: "loan_received",
          amountUsdc: principalUsdc,
          amountBs: principalBs,
          description: `Préstamo aprobado — Bs ${principalBs.toLocaleString()}`,
          timestamp: now,
          scoreImpact: -5,
        };

        const scoreEvt: ScoreEvent = {
          delta: -5,
          reason: "Nuevo préstamo recibido",
          timestamp: now,
        };

        set((s) => ({
          activeLoan: loan,
          balanceUsdc: s.balanceUsdc + principalUsdc,
          transactions: [tx, ...s.transactions],
          score: Math.max(s.score - 5, 300),
          scoreHistory: [scoreEvt, ...s.scoreHistory],
          // historial propio: cambiar dataSource a hybrid/internal
          dataSource: s.dataSource === "external" ? "hybrid" : s.dataSource,
        }));
      },

      // ── Receive QR payment ────────────────────────────────────────────────────
      receiveQRPayment: (amountBs, merchant) => {
        const amountUsdc = bsToUsdc(amountBs);
        const now = new Date();

        const tx: WalletTransaction = {
          id: `tx_${Date.now()}_qr`,
          type: "qr_received",
          amountUsdc,
          amountBs,
          description: merchant ? `Cobro de ${merchant}` : "Cobro de cliente",
          timestamp: now,
          scoreImpact: 3,
          ...(merchant !== undefined ? { merchant } : {}),
        };

        const scoreEvt: ScoreEvent = {
          delta: 3,
          reason: "Cobro QR registrado",
          timestamp: now,
        };

        set((s) => {
          let newBalance = s.balanceUsdc + amountUsdc;
          let newLoan = s.activeLoan;

          // Auto-repay 14.37% if active loan
          if (newLoan && newLoan.status === "active") {
            const autoRepayUsdc = Math.round(amountUsdc * 0.1437 * 1_000_000) / 1_000_000;
            newBalance -= autoRepayUsdc;

            let paidTowards = newLoan.paidTowardsNextUsdc + autoRepayUsdc;
            let paidInstallments = newLoan.paidInstallments;

            if (paidTowards >= newLoan.monthlyPaymentUsdc) {
              paidInstallments += 1;
              paidTowards -= newLoan.monthlyPaymentUsdc;
            }

            const isFullyPaid = paidInstallments >= newLoan.termMonths;

            newLoan = {
              ...newLoan,
              paidInstallments,
              paidTowardsNextUsdc: paidTowards,
              status: isFullyPaid ? "paid" : "active",
            };
          }

          // After enough QR payments, transition dataSource to "internal"
          const qrCount = s.transactions.filter((t) => t.type === "qr_received").length + 1;
          const newDataSource =
            qrCount >= 10 ? "internal" : qrCount >= 3 ? "hybrid" : s.dataSource;

          return {
            balanceUsdc: newBalance,
            transactions: [tx, ...s.transactions],
            score: Math.min(s.score + 3, 850),
            scoreHistory: [scoreEvt, ...s.scoreHistory],
            activeLoan: newLoan,
            dataSource: newDataSource,
          };
        });
      },

      // ── Pay installment ───────────────────────────────────────────────────────
      payInstallment: (amountBs) => {
        const { activeLoan, balanceUsdc, score } = get();
        if (!activeLoan || activeLoan.status !== "active") return;

        const payBs = amountBs ?? activeLoan.monthlyPaymentBs;
        const payUsdc = bsToUsdc(payBs);

        if (payUsdc > balanceUsdc) return;

        const now = new Date();

        let paidTowards = activeLoan.paidTowardsNextUsdc + payUsdc;
        let paidInstallments = activeLoan.paidInstallments;

        while (
          paidTowards >= activeLoan.monthlyPaymentUsdc &&
          paidInstallments < activeLoan.termMonths
        ) {
          paidInstallments += 1;
          paidTowards -= activeLoan.monthlyPaymentUsdc;
        }

        const isFullyPaid = paidInstallments >= activeLoan.termMonths;
        const scoreDelta = isFullyPaid ? 25 : 12;

        const tx: WalletTransaction = {
          id: `tx_${Date.now()}_pay`,
          type: "loan_payment",
          amountUsdc: payUsdc,
          amountBs: payBs,
          description: isFullyPaid
            ? "¡Préstamo completado! 🎉"
            : `Cuota pagada — Bs ${payBs.toLocaleString()}`,
          timestamp: now,
          scoreImpact: scoreDelta,
        };

        const scoreEvt: ScoreEvent = {
          delta: scoreDelta,
          reason: isFullyPaid ? "Préstamo pagado completamente" : "Cuota pagada",
          timestamp: now,
        };

        const newLoan: ActiveLoan = {
          ...activeLoan,
          paidInstallments,
          paidTowardsNextUsdc: paidTowards,
          status: isFullyPaid ? "paid" : "active",
        };

        const newLoanHistory: PastLoan[] = isFullyPaid
          ? [
              ...get().loanHistory,
              {
                loanId: activeLoan.loanId,
                principalBs: activeLoan.principalBs,
                totalPaidBs: activeLoan.totalPayableBs,
                termMonths: activeLoan.termMonths,
                completedAt: now,
              },
            ]
          : get().loanHistory;

        set({
          activeLoan: isFullyPaid ? null : newLoan,
          balanceUsdc: balanceUsdc - payUsdc,
          transactions: [tx, ...get().transactions],
          score: Math.min(score + scoreDelta, 850),
          scoreHistory: [scoreEvt, ...get().scoreHistory],
          loanHistory: newLoanHistory,
        });
      },

      // ── Reset ─────────────────────────────────────────────────────────────────
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: "yalita-wallet-v1",
      storage: createJSONStorage(() => {
        // SSR-safe: only use localStorage in browser
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Only persist data fields, not computed getters
      partialize: (state) => ({
        userId: state.userId,
        userName: state.userName,
        userPhone: state.userPhone,
        isCiVerified: state.isCiVerified,
        balanceUsdc: state.balanceUsdc,
        transactions: state.transactions,
        score: state.score,
        scoreHistory: state.scoreHistory,
        isScoreLoaded: state.isScoreLoaded,
        dataSource: state.dataSource,
        activeLoan: state.activeLoan,
        loanHistory: state.loanHistory,
      }),
    }
  )
);
