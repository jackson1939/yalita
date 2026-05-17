// ─── Yalita WALLET TYPES ───
// All amounts stored in USDC internally, displayed as Bs externally
// Exchange rate: 1 USD = 6.96 Bs (official Bolivia rate)

export const EXCHANGE_RATE = 6.96;

export function usdcToBs(usdc: number): number {
  return Math.round(usdc * EXCHANGE_RATE * 100) / 100;
}

export function bsToUsdc(bs: number): number {
  return Math.round((bs / EXCHANGE_RATE) * 1000000) / 1000000;
}

export interface WalletTransaction {
  id: string;
  type: "loan_received" | "qr_received" | "loan_payment" | "qr_sent";
  amountUsdc: number;
  amountBs: number;
  description: string;
  merchant?: string;
  timestamp: Date;
  scoreImpact?: number;
}

export interface ScoreEvent {
  delta: number;
  reason: string;
  timestamp: Date;
}

export interface ActiveLoan {
  loanId: string;
  principalUsdc: number;
  principalBs: number;
  totalPayableUsdc: number;
  totalPayableBs: number;
  monthlyPaymentUsdc: number;
  monthlyPaymentBs: number;
  termMonths: number;
  paidInstallments: number;
  paidTowardsNextUsdc: number;
  status: "active" | "paid" | "overdue";
  createdAt: Date;
}

export interface PastLoan {
  loanId: string;
  principalBs: number;
  totalPaidBs: number;
  termMonths: number;
  completedAt: Date;
}
