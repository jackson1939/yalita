// Generador de datos sintéticos de pagos QR (estilo Tigo Money / SIMPLE)
// Genera datasets realistas para demo: distribuciones de volumen por nivel socioeconómico.

import { calculateScore } from "../utils/scoring";

export interface SyntheticUser {
  walletAddress: `0x${string}`;
  phoneNumber: string;
  firstName: string;
  profile: "vendedor_mercado" | "comerciante_pyme" | "freelancer" | "informal";
  txCount: number;
  totalVolumeBs: number;    // centavos
  monthsCovered: number;
  expectedScore: number;
}

const PROFILES = {
  vendedor_mercado: {
    txPerMonth: { min: 15, max: 40 },
    avgTxBs: { min: 2000, max: 8000 },   // centavos: 20 - 80 Bs
    monthsRange: { min: 6, max: 24 },
  },
  comerciante_pyme: {
    txPerMonth: { min: 30, max: 80 },
    avgTxBs: { min: 10000, max: 40000 }, // 100 - 400 Bs
    monthsRange: { min: 12, max: 36 },
  },
  freelancer: {
    txPerMonth: { min: 8, max: 20 },
    avgTxBs: { min: 50000, max: 200000 }, // 500 - 2000 Bs
    monthsRange: { min: 3, max: 18 },
  },
  informal: {
    txPerMonth: { min: 3, max: 12 },
    avgTxBs: { min: 1000, max: 5000 },
    monthsRange: { min: 1, max: 6 },
  },
} as const;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAddress(): `0x${string}` {
  const hex = Array.from({ length: 40 }, () =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]
  ).join("");
  return `0x${hex}` as `0x${string}`;
}

const FIRST_NAMES = [
  "María", "Roberto", "Lucía", "Juan", "Ana", "Carlos", "Sofía", "Diego",
  "Camila", "Luis", "Valeria", "Andrés", "Patricia", "Miguel", "Daniela",
];

export function generateSyntheticUser(profile: SyntheticUser["profile"]): SyntheticUser {
  const cfg = PROFILES[profile];
  const months = randInt(cfg.monthsRange.min, cfg.monthsRange.max);
  const txPerMonth = randInt(cfg.txPerMonth.min, cfg.txPerMonth.max);
  const avgTxBs = randInt(cfg.avgTxBs.min, cfg.avgTxBs.max);

  const txCount = txPerMonth * months;
  const totalVolumeBs = txCount * avgTxBs;

  return {
    walletAddress: randomAddress(),
    phoneNumber: `+5917${randInt(1000000, 9999999)}`,
    firstName: FIRST_NAMES[randInt(0, FIRST_NAMES.length - 1)]!,
    profile,
    txCount,
    totalVolumeBs,
    monthsCovered: months,
    expectedScore: calculateScore({ txCount, volumeBs: totalVolumeBs, monthsCovered: months }),
  };
}

export function generateDataset(count: number = 100): SyntheticUser[] {
  const profiles: SyntheticUser["profile"][] = [
    "vendedor_mercado", "comerciante_pyme", "freelancer", "informal",
  ];
  return Array.from({ length: count }, () => {
    const profile = profiles[randInt(0, profiles.length - 1)]!;
    return generateSyntheticUser(profile);
  });
}
