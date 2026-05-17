import { NextResponse } from "next/server";
import {
  parseYapeInvoices,
  calculateYapeScore,
  generateMockYapeHistory,
  type YapeTransaction,
} from "../../../../../backend/src/services/yape.parser";

// ── Prisma lazy ──────────────────────────────────────────────────────────────
type PrismaClientType = import("@prisma/client").PrismaClient;
let _prisma: PrismaClientType | null = null;

function getPrisma(): PrismaClientType | null {
  if (_prisma) return _prisma;
  try {
    const { PrismaClient } = require("@prisma/client");
    const g = globalThis as unknown as { _yalita_prisma?: PrismaClientType };
    _prisma = g._yalita_prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== "production") g._yalita_prisma = _prisma;
    return _prisma;
  } catch {
    return null;
  }
}

// ── Reclaim proof verification (real cuando hay APP_ID) ──────────────────────
async function verifyReclaimProofIfPresent(proof: unknown): Promise<string | null> {
  if (!proof) return null;
  try {
    const appId = process.env.RECLAIM_APP_ID ?? process.env.NEXT_PUBLIC_RECLAIM_APP_ID;
    if (!appId) return null;

    // Dynamic require para no romper build si el SDK no está instalado
    let reclaim: Record<string, unknown> | null = null;
    try {
      reclaim = require("@reclaimprotocol/js-sdk");
    } catch {
      return null;
    }
    if (!reclaim) return null;

    const verifier = (reclaim.verifySignedProof ?? (reclaim as { ReclaimClient?: { verifySignedProof?: unknown } }).ReclaimClient?.verifySignedProof) as ((p: unknown) => Promise<boolean>) | undefined;

    if (!verifier) return null;
    const valid = await verifier(proof);
    if (!valid) return null;

    const p = proof as { extractedParameterValues?: { extracted_text?: string; emails?: string } };
    return p.extractedParameterValues?.extracted_text ?? p.extractedParameterValues?.emails ?? null;
  } catch (err) {
    console.warn("[reclaim] verify failed:", (err as Error).message);
    return null;
  }
}

// ── Wavy Node mock ───────────────────────────────────────────────────────────
interface WavyNodeResult {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendation: "APPROVE" | "REVIEW" | "REJECT";
  flags: string[];
}

async function getWavyNodeScore(walletAddress: string, score: number): Promise<WavyNodeResult> {
  const useMock = process.env.WAVY_NODE_MOCK !== "false" || !process.env.WAVY_NODE_API_KEY;

  if (useMock) {
    const riskScore = Math.round(40 + ((score - 300) / 550) * 55);
    return {
      riskScore,
      riskLevel: riskScore >= 65 ? "LOW" : riskScore >= 45 ? "MEDIUM" : "HIGH",
      recommendation: riskScore >= 45 ? "APPROVE" : riskScore >= 30 ? "REVIEW" : "REJECT",
      flags: [],
    };
  }

  try {
    const url = new URL("/v1/risk-score", process.env.WAVY_NODE_API_URL ?? "https://api.wavynode.com");
    url.searchParams.set("address", walletAddress);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${process.env.WAVY_NODE_API_KEY}` },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`Wavy Node ${res.status}`);
    return (await res.json()) as WavyNodeResult;
  } catch (err) {
    console.warn("[wavy] fallback to mock:", (err as Error).message);
    return {
      riskScore: 65,
      riskLevel: "MEDIUM",
      recommendation: "APPROVE",
      flags: ["wavy_node_fallback"],
    };
  }
}

// ── POST /api/score ──────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      proof,
      rawEmails,
      userId = "user_mock",
      walletAddress = "0xMockAddress",
    } = body as {
      proof?: unknown;
      rawEmails?: string;
      userId?: string;
      walletAddress?: string;
    };

    // 1. Obtener el dump de texto desde Reclaim, raw, o mock
    let payloadText: string;
    let dataSource: "reclaim_zktls" | "manual_paste" | "mock";

    const reclaimText = await verifyReclaimProofIfPresent(proof);
    if (reclaimText) {
      payloadText = reclaimText;
      dataSource = "reclaim_zktls";
    } else if (rawEmails && rawEmails.length > 30) {
      // Permite que el frontend pegue el texto de los emails directamente (dev/demo)
      payloadText = rawEmails;
      dataSource = "manual_paste";
    } else {
      // Modo demo: historial sintético creíble
      const mockTxs = generateMockYapeHistory(6);
      const scoreResult = calculateYapeScore(mockTxs);
      const wavy = await getWavyNodeScore(walletAddress, scoreResult.score);

      // Persistir si la DB existe
      const db = getPrisma();
      if (db) {
        db.score.create({
          data: {
            userId,
            walletAddress,
            score: scoreResult.score,
            totalTxs: scoreResult.txCount,
            volumeBs: BigInt(Math.round(scoreResult.totalVolumeBs * 100)),
          },
        }).catch((e: unknown) => console.warn("[db] write skipped:", (e as Error).message));
      }

      return NextResponse.json({
        score: scoreResult.score,
        transactionCount: scoreResult.txCount,
        breakdown: scoreResult.breakdown,
        totalVolumeBs: scoreResult.totalVolumeBs,
        monthsCovered: scoreResult.monthsCovered,
        wavyNode: wavy,
        onChainConfirmed: false,
        dataSource: "mock",
        transactions: mockTxs.slice(0, 10), // primeros 10 para UI
      });
    }

    // 2. Parsear las facturas Yape del texto
    const txs = parseYapeInvoices(payloadText);

    if (txs.length === 0) {
      return NextResponse.json(
        {
          error: "No se encontraron facturas de Yape en los datos provistos",
          hint: "Asegúrate de tener emails de notificacionesyape@bcp.com.bo en tu Gmail",
        },
        { status: 422 }
      );
    }

    // 3. Calcular el score DPI real
    const scoreResult = calculateYapeScore(txs);

    // 4. Wavy Node risk check
    const wavy = await getWavyNodeScore(walletAddress, scoreResult.score);

    // 5. Si Wavy Node rechaza, capar el score
    const effectiveScore = wavy.recommendation === "REJECT"
      ? Math.min(scoreResult.score, 450)
      : scoreResult.score;

    // 6. Persistir
    const db = getPrisma();
    if (db) {
      db.score.create({
        data: {
          userId,
          walletAddress,
          score: effectiveScore,
          totalTxs: scoreResult.txCount,
          volumeBs: BigInt(Math.round(scoreResult.totalVolumeBs * 100)),
        },
      }).catch((e: unknown) => console.warn("[db] write skipped:", (e as Error).message));
    }

    // 7. Respuesta
    return NextResponse.json({
      score: effectiveScore,
      transactionCount: scoreResult.txCount,
      breakdown: scoreResult.breakdown,
      totalVolumeBs: scoreResult.totalVolumeBs,
      monthsCovered: scoreResult.monthsCovered,
      wavyNode: wavy,
      onChainConfirmed: false, // se actualiza después de escribir on-chain (Phase 3)
      dataSource,
      transactions: txs.slice(0, 10),
    });
  } catch (error) {
    console.error("[api/score] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
