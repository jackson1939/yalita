import { publicClient, contractAddresses } from "../lib/blockchain";
import { db } from "../lib/db";
import { SCORE_REGISTRY_ABI, SCORING_ENGINE_ABI, getScoreTier } from "@yalita/shared";
import { calculateScore } from "../utils/scoring";
import type { Address } from "@yalita/shared";

export class ScoreService {
  /** Lee el score on-chain. */
  async getOnChain(user: Address) {
    const hasScore = await publicClient.readContract({
      address: contractAddresses.scoreRegistry,
      abi: SCORE_REGISTRY_ABI,
      functionName: "hasScore",
      args: [user],
    });

    if (!hasScore) return { hasScore: false, score: null };

    const data = await publicClient.readContract({
      address: contractAddresses.scoreRegistry,
      abi: SCORE_REGISTRY_ABI,
      functionName: "getScore",
      args: [user],
    });

    const score = Number(data.score);
    return {
      hasScore: true,
      score,
      tier: getScoreTier(score),
      updatedAt: new Date(Number(data.updatedAt) * 1000).toISOString(),
      totalTxs: Number(data.totalTxs),
      volumeBs: data.volumeBs.toString(),
    };
  }

  /** Calcula un score sin emitirlo (preview). Funciona vía on-chain o local. */
  async preview(params: { txCount: number; volumeBs: number; months: number }) {
    // Si los contratos están desplegados, usamos el contrato. Si no, fallback local.
    try {
      const score = await publicClient.readContract({
        address: contractAddresses.scoringEngine,
        abi: SCORING_ENGINE_ABI,
        functionName: "previewScore",
        args: [params.txCount, BigInt(Math.round(params.volumeBs * 100)), params.months],
      });
      const n = Number(score);
      return { score: n, tier: getScoreTier(n) };
    } catch {
      // Fallback local — algoritmo equivalente
      const score = calculateScore({
        txCount: params.txCount,
        volumeBs: params.volumeBs * 100,
        monthsCovered: params.months,
      });
      return { score, tier: getScoreTier(score) };
    }
  }

  /** Historial de scores del usuario en la DB (cambios a lo largo del tiempo). */
  async getHistory(walletAddress: Address) {
    return db.score.findMany({
      where: { walletAddress },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }
}
