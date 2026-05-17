// ─────────────────────────────────────────────────────────────────
//  Tipos compartidos entre frontend y backend
// ─────────────────────────────────────────────────────────────────

export type Address = `0x${string}`;
export type Hex = `0x${string}`;

// ── Score ───────────────────────────────────────────────────────────

export interface ScoreData {
  score: number;          // 300-850
  updatedAt: number;      // Unix timestamp en segundos
  totalTxs: number;
  volumeBs: bigint;       // centavos de Bs
}

export interface ScoreTier {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
}

// ── Attestation ─────────────────────────────────────────────────────

export type DataSource =
  | "TIGO_MONEY"
  | "SIMPLE_BANK"
  | "BANCO_UNION"
  | "BELVO"
  | "SELF_ATTESTED";

export interface Attestation {
  proofHash: Hex;
  source: DataSource;
  user: Address;
  timestamp: number;
  txCount: number;
  totalVolumeBs: bigint;
  monthsCovered: number;
  valid: boolean;
}

// ── Loans ───────────────────────────────────────────────────────────

export type LoanStatus = "ACTIVE" | "REPAID" | "OVERDUE" | "DEFAULTED";
export type PaymentSource = "MANUAL" | "AUTO_QR";

export interface Loan {
  principal: bigint;        // USDC en 6 decimales
  totalDue: bigint;
  paidAmount: bigint;
  dueTimestamp: number;
  annualRateBps: number;
  status: LoanStatus;
}

export interface LoanQuote {
  annualRateBps: number;
  totalDue: bigint;
  monthlyPayment: bigint;
  originationFee: bigint;
  estimatedSavings: bigint; // vs prestamista informal
}

// ── User ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  walletAddress: Address;
  phoneNumber?: string;
  email?: string;
  createdAt: Date;
}

// ── Helpers (puros) ─────────────────────────────────────────────────

export function getScoreTier(score: number): ScoreTier {
  if (score >= 750) return { min: 750, max: 850, label: "Excelente", color: "#22c55e", description: "Tasa desde 12% anual. Crédito máximo." };
  if (score >= 650) return { min: 650, max: 749, label: "Bueno", color: "#84cc16", description: "Tasa desde 18% anual. Hasta $5,000." };
  if (score >= 550) return { min: 550, max: 649, label: "Regular", color: "#f59e0b", description: "Tasa desde 25% anual. Hasta $2,000." };
  if (score >= 450) return { min: 450, max: 549, label: "Bajo", color: "#ef4444", description: "Tasa desde 35% anual. Hasta $500." };
  return { min: 300, max: 449, label: "Sin acceso", color: "#6b7280", description: "Necesitás más historial verificado." };
}

export function formatBs(centavos: bigint | number): string {
  const n = typeof centavos === "bigint" ? Number(centavos) : centavos;
  return `Bs ${(n / 100).toLocaleString("es-BO", { maximumFractionDigits: 2 })}`;
}

export function formatUSDC(amount: bigint | string | number): string {
  const n = typeof amount === "bigint" ? Number(amount) : typeof amount === "string" ? Number(BigInt(amount)) : amount;
  return `$${(n / 1e6).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
