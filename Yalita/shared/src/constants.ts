// ─────────────────────────────────────────────────────────────────
//  Constantes del protocolo Yalita — fuente única de verdad
// ─────────────────────────────────────────────────────────────────

import type { Address } from "./types";

// ── Chain IDs ──────────────────────────────────────────────────────

export const CHAIN_IDS = {
  AVALANCHE_FUJI: 43113,
  AVALANCHE_MAINNET: 43114,
} as const;

// ── Direcciones de contratos por red ────────────────────────────────
// Se rellenan tras el deploy. Mantener sincronizadas con .env

interface ContractAddresses {
  scoreRegistry: Address;
  attestationRegistry: Address;
  scoringEngine: Address;
  lendingPool: Address;
  usdc: Address;
}

export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  [CHAIN_IDS.AVALANCHE_FUJI]: {
    scoreRegistry: "0x0000000000000000000000000000000000000000",
    attestationRegistry: "0x0000000000000000000000000000000000000000",
    scoringEngine: "0x0000000000000000000000000000000000000000",
    lendingPool: "0x0000000000000000000000000000000000000000",
    // USDC mock en Fuji
    usdc: "0x5425890298aed601595a70AB815c96711a31Bc65",
  },
};

// ── Parámetros del scoring ──────────────────────────────────────────

export const SCORE = {
  MIN: 300,
  MAX: 850,
  CREDIT_FLOOR: 450, // mínimo para acceder a crédito
} as const;

// ── Parámetros de lending ───────────────────────────────────────────

export const LOAN = {
  MIN_USD: 50,
  MAX_USD: 5_000,
  MIN_DAYS: 30,
  MAX_DAYS: 365,
  BASE_RATE_BPS: 800,        // 8% anual mínimo
  MAX_SPREAD_BPS: 3_000,     // 30% spread máximo
  ORIGINATION_FEE_BPS: 150,  // 1.5% al originar
  INFORMAL_RATE_BPS: 18_000, // 180% — referencia del prestamista informal
  PAWN_RATE_BPS: 9_600,      // 96% — casa de empeño
  AUTO_REPAY_PCT: 8,         // % de cada cobro QR que va al pool
} as const;

// ── Total Addressable Market ────────────────────────────────────────

export const LATAM_TAM = {
  BOLIVIA: 6_000_000,
  ARGENTINA: 7_000_000,
  PERU: 13_000_000,
  MEXICO: 50_000_000,
  TOTAL: 210_000_000,
} as const;

// ── Fuentes de datos disponibles para attestations ──────────────────

export const DATA_SOURCES = [
  {
    id: "TIGO_MONEY",
    name: "Tigo Money",
    flag: "🇧🇴",
    description: "Bolivia — Billetera móvil más usada",
    countries: ["Bolivia"],
    available: true,
  },
  {
    id: "SIMPLE_BANK",
    name: "SIMPLE",
    flag: "🇧🇴",
    description: "Bolivia — Banco digital",
    countries: ["Bolivia"],
    available: true,
  },
  {
    id: "BELVO",
    name: "Open Banking (Latam)",
    flag: "🌎",
    description: "Brasil, México, Chile — Pix, CoDi, OpenBanking",
    countries: ["Brasil", "México", "Chile"],
    available: true,
  },
  {
    id: "SELF_ATTESTED",
    name: "Subir comprobantes",
    flag: "📄",
    description: "CSV o screenshots con stake de garantía",
    countries: ["Todos"],
    available: true,
  },
] as const;
