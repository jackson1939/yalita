import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LOAN, SCORE } from "@yalita/shared/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Formateo ────────────────────────────────────────────────────────

export function formatUSDC(amount: bigint | string | number): string {
  const n =
    typeof amount === "bigint" ? Number(amount) :
    typeof amount === "string" ? Number(BigInt(amount)) : amount;
  return `$${(n / 1e6).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatAnnualRateBps(bps: number): string {
  return `${(bps / 100).toFixed(1)}% anual`;
}

export function formatBs(centavos: bigint | string | number): string {
  const n =
    typeof centavos === "bigint" ? Number(centavos) :
    typeof centavos === "string" ? Number(BigInt(centavos)) : centavos;
  return `Bs ${(n / 100).toLocaleString("es-BO", { maximumFractionDigits: 2 })}`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("es-BO", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return formatDate(date);
}

export function daysUntil(timestamp: string | Date): number {
  return Math.max(0, Math.ceil((new Date(timestamp).getTime() - Date.now()) / 86_400_000));
}

// ── Cálculos de negocio ─────────────────────────────────────────────

export function calculateEstimatedRate(score: number): number {
  if (score < SCORE.CREDIT_FLOOR) return LOAN.BASE_RATE_BPS + LOAN.MAX_SPREAD_BPS;
  const normalized = Math.max(0, Math.min(100, ((850 - score) / (850 - SCORE.CREDIT_FLOOR)) * 100));
  return Math.round(LOAN.BASE_RATE_BPS + (normalized / 100) * LOAN.MAX_SPREAD_BPS);
}

export function calculateInterest(principal: bigint, rateBps: number, days: number): bigint {
  return (principal * BigInt(rateBps) * BigInt(days)) / (10_000n * 365n);
}

export function calculateCreditLimit(score: number): number {
  if (score >= 750) return 5000;
  if (score >= 650) return 3000;
  if (score >= 550) return 2000;
  if (score >= 450) return 500;
  return 0;
}
