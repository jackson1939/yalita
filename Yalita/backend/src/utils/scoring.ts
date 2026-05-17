// Replica del algoritmo de scoring del contrato (para previews off-chain rápidos)

import { SCORE } from "@yalita/shared/constants";

interface ScoringWeights {
  volume: number;
  frequency: number;
  antiquity: number;
  consistency: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  volume: 35,
  frequency: 25,
  antiquity: 20,
  consistency: 15,
};

const TOTAL_WEIGHT = 95;

export function calculateScore(params: {
  txCount: number;
  volumeBs: number;        // centavos
  monthsCovered: number;
  weights?: ScoringWeights;
}): number {
  const { txCount, volumeBs, monthsCovered, weights = DEFAULT_WEIGHTS } = params;
  if (txCount === 0) return SCORE.MIN;

  const monthlyVolumeBs = monthsCovered > 0 ? volumeBs / monthsCovered : volumeBs;
  const monthlyTxs = monthsCovered > 0 ? txCount / monthsCovered : txCount;

  const v = logNormalize(monthlyVolumeBs, 5_000_000); // target: 50_000 Bs/mes
  const f = linearNormalize(monthlyTxs, 30);
  const a = linearNormalize(monthsCovered, 12);
  const c = txCount >= 6 ? 80 : (txCount * 80) / 6;

  const raw =
    v * weights.volume + f * weights.frequency + a * weights.antiquity + c * weights.consistency;

  const range = SCORE.MAX - SCORE.MIN;
  const score = SCORE.MIN + Math.round((raw * range) / (TOTAL_WEIGHT * 100));

  return Math.min(SCORE.MAX, Math.max(SCORE.MIN, score));
}

function logNormalize(value: number, max: number): number {
  if (value <= 0) return 0;
  if (value >= max) return 100;
  return (Math.log2(value + 1) / Math.log2(max + 1)) * 100;
}

function linearNormalize(value: number, max: number): number {
  if (value >= max) return 100;
  return (value / max) * 100;
}
