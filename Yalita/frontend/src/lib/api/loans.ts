import { api } from "./client";

export interface LoanResponse {
  id: string;
  walletAddress: string;
  principal: string;       // bigint serializado
  totalDue: string;
  paidAmount: string;
  annualRateBps: number;
  durationDays: number;
  dueTimestamp: string;
  status: "ACTIVE" | "REPAID" | "OVERDUE" | "DEFAULTED";
  txHash: string | null;
  createdAt: string;
}

export interface LoanQuote {
  annualRateBps: number;
  totalDue: string;
  monthlyPayment: string;
  originationFee: string;
}

export const loansApi = {
  active: () => api.get<LoanResponse | null>("/loans/active"),
  history: () => api.get<LoanResponse[]>("/loans/history"),

  quote: (params: { address: string; principalUsdc: bigint; days: number }) =>
    api.get<LoanQuote>(
      `/loans/quote?address=${params.address}&principal=${params.principalUsdc}&days=${params.days}`,
      { skipAuth: true }
    ),

  request: (params: { principalUsd: number; durationDays: number }) =>
    api.post<LoanResponse>("/loans/request", params),

  repay: (params: { amountUsd: number; source?: "MANUAL" | "AUTO_QR" }) =>
    api.post<{ txHash: string; newStatus: string }>("/loans/repay", params),
};
