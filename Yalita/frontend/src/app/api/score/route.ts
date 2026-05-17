import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  verifyProof,
  parseTransactions,
  calculateDpiScore,
  generateMockPayload,
} from "../../../../../backend/src/services/reclaim.service";

// ── Prisma singleton (safe for serverless) ───────────────────────────────────
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ── Wavy Node mock ────────────────────────────────────────────────────────────
interface WavyNodeResult {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendation: "APPROVE" | "REVIEW" | "REJECT";
  flags: string[];
}

async function getWavyNodeScore(walletAddress: string, score: number): Promise<WavyNodeResult> {
  const useMock = process.env.WAVY_NODE_MOCK !== "false" || !process.env.WAVY_NODE_API_KEY;

  if (useMock) {
    // Derive a realistic Wavy score from DPI score to keep consistency
    const riskScore = Math.round(40 + (score - 300) / (850 - 300) * 55);
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
      method: "GET",
      headers: { Authorization: `Bearer ${process.env.WAVY_NODE_API_KEY}` },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) throw new Error(`Wavy Node ${res.status}`);
    return await res.json() as WavyNodeResult;
  } catch (err) {
    console.warn("Wavy Node unavailable, using mock fallback:", (err as Error).message);
    const riskScore = Math.round(40 + (score - 300) / (850 - 300) * 55);
    return {
      riskScore,
      riskLevel: "MEDIUM",
      recommendation: "APPROVE",
      flags: ["wavy_node_fallback"],
    };
  }
}

// ── POST /api/score ───────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      proof,
      userId = "user_mock",
      walletAddress = "0xMockAddress",
    } = body as { proof?: unknown; userId?: string; walletAddress?: string };

    // 1. Parse transactions (mock or real zkTLS proof)
    let payloadText = "";

    if (process.env.RECLAIM_MOCK !== "false") {
      payloadText = generateMockPayload();
    } else {
      if (!proof) {
        return NextResponse.json({ error: "Proof is required in non-mock mode" }, { status: 400 });
      }
      const appId = process.env.RECLAIM_APP_ID ?? "";
      const appSecret = process.env.RECLAIM_APP_SECRET ?? "";
      const isValid = await verifyProof(proof, appId, appSecret);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid Reclaim proof" }, { status: 400 });
      }
      payloadText =
        (proof as Record<string, Record<string, string>>)
          ?.extractedParameterValues?.extracted_text ?? "";
    }

    // 2. Parse & score
    const transactions = parseTransactions(payloadText);
    const score = calculateDpiScore(transactions);

    // 3. Score breakdown for UI
    const incomeTxs = transactions.filter((t) => t.isIncome);
    const totalIncome = incomeTxs.reduce((s, t) => s + t.amount, 0);
    const volumeScore   = Math.round(Math.min((totalIncome / 5000) * 100, 100));
    const frequencyScore = Math.round(Math.min((transactions.length / 20) * 100, 100));
    const consistencyScore = incomeTxs.length > 3 ? 85 : Math.round((incomeTxs.length / 3) * 85);

    // 4. Wavy Node risk check
    const wavy = await getWavyNodeScore(walletAddress, score);

    // If Wavy Node recommends REJECT, cap score
    const effectiveScore = wavy.recommendation === "REJECT"
      ? Math.min(score, 450)
      : score;

    // 5. Persist to DB (non-blocking — errors don't fail the request)
    prisma.score.create({
      data: {
        userId,
        walletAddress,
        score: effectiveScore,
        totalTxs: transactions.length,
        volumeBs: BigInt(Math.round(totalIncome)),
      },
    }).catch((e: unknown) => {
      console.warn("DB write skipped:", (e as Error).message);
    });

    // 6. Return
    return NextResponse.json({
      score: effectiveScore,
      transactionCount: transactions.length,
      breakdown: {
        volume: volumeScore,
        frequency: frequencyScore,
        consistency: consistencyScore,
      },
      wavyNode: {
        riskScore: wavy.riskScore,
        riskLevel: wavy.riskLevel,
        recommendation: wavy.recommendation,
        flags: wavy.flags,
      },
      onChainConfirmed: false, // requires ORACLE_PRIVATE_KEY + deployed contracts
      dataSource: "TIGO_MONEY",
      transactions,
    });
  } catch (error) {
    console.error("Score API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
