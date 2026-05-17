// ──────────────────────────────────────────────────────────────────────────────
// POST /api/score/submit-onchain
// ──────────────────────────────────────────────────────────────────────────────
// Recibe { walletAddress, score, totalTxs, volumeBs } del frontend.
// El backend (Node runtime) firma con ORACLE_PRIVATE_KEY y ejecuta:
//   ScoreRegistry.submitScore(wallet, score, totalTxs, volumeBs)
//   ó
//   ScoreRegistry.mintScore(wallet, score, totalTxs, volumeBs)  // primera vez
//
// Devuelve el txHash y blockNumber para que el frontend muestre el link a Snowtrace.
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";

// Force Node runtime — viem ECDSA no funciona en Edge
export const runtime = "nodejs";

const SCORE_REGISTRY_ABI = parseAbi([
  "function hasScore(address user) view returns (bool)",
  "function mintScore(address user, uint16 score, uint32 totalTxs, uint64 volumeBs) returns (uint256)",
  "function updateScore(address user, uint16 newScore, uint32 totalTxs, uint64 volumeBs)",
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      walletAddress,
      score,
      totalTxs = 0,
      volumeBs = 0,
    } = body as {
      walletAddress: `0x${string}`;
      score: number;
      totalTxs: number;
      volumeBs: number;
    };

    // ── Validaciones básicas ─────────────────────────────────────────────
    if (!walletAddress?.startsWith("0x") || walletAddress.length !== 42) {
      return NextResponse.json({ error: "Wallet address inválida" }, { status: 400 });
    }
    if (score < 300 || score > 850) {
      return NextResponse.json({ error: "Score fuera de rango [300, 850]" }, { status: 400 });
    }

    // ── Variables de entorno necesarias ──────────────────────────────────
    const oraclePk = process.env.ORACLE_PRIVATE_KEY;
    const scoreRegistry = process.env.NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS as `0x${string}` | undefined;
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc";

    // Sin oracle key o sin contratos deployados → no podemos hacer la tx real
    if (!oraclePk || !scoreRegistry || scoreRegistry === "0x0000000000000000000000000000000000000000") {
      return NextResponse.json({
        error: "Contratos no deployados o oracle no configurado",
        hint: "Deploy contracts a Fuji y configura ORACLE_PRIVATE_KEY",
      }, { status: 503 });
    }

    // ── Setup clients ────────────────────────────────────────────────────
    const account = privateKeyToAccount(oraclePk.startsWith("0x") ? oraclePk as `0x${string}` : `0x${oraclePk}`);

    const publicClient = createPublicClient({
      chain: avalancheFuji,
      transport: http(rpcUrl),
    });

    const walletClient = createWalletClient({
      account,
      chain: avalancheFuji,
      transport: http(rpcUrl),
    });

    // ── Decidir: mint (primera vez) o update ─────────────────────────────
    const hasScoreAlready = await publicClient.readContract({
      address: scoreRegistry,
      abi: SCORE_REGISTRY_ABI,
      functionName: "hasScore",
      args: [walletAddress],
    });

    // Clamp valores a los tipos del contrato (uint16, uint32, uint64)
    const score16  = Math.min(65535, Math.max(0, Math.round(score)));
    const txs32    = Math.min(4_294_967_295, Math.max(0, Math.round(totalTxs)));
    const vol64    = BigInt(Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.round(volumeBs * 100)))); // centavos

    let txHash: `0x${string}`;
    if (hasScoreAlready) {
      txHash = await walletClient.writeContract({
        address: scoreRegistry,
        abi: SCORE_REGISTRY_ABI,
        functionName: "updateScore",
        args: [walletAddress, score16, txs32, vol64],
      });
    } else {
      txHash = await walletClient.writeContract({
        address: scoreRegistry,
        abi: SCORE_REGISTRY_ABI,
        functionName: "mintScore",
        args: [walletAddress, score16, txs32, vol64],
      });
    }

    // ── Esperar confirmación ─────────────────────────────────────────────
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
      timeout: 30_000,
    });

    return NextResponse.json({
      txHash,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: Number(receipt.gasUsed),
      success: receipt.status === "success",
      operation: hasScoreAlready ? "update" : "mint",
    });

  } catch (error) {
    const msg = (error as Error).message;
    console.error("[submit-onchain] error:", msg);

    // Errores específicos comunes de blockchain
    if (msg.includes("insufficient funds")) {
      return NextResponse.json({
        error: "Oracle wallet sin AVAX",
        hint: "Fondear con faucet: https://faucet.avax.network/",
      }, { status: 503 });
    }
    if (msg.includes("nonce")) {
      return NextResponse.json({
        error: "Conflicto de nonce — reintentar en 30s",
      }, { status: 503 });
    }

    return NextResponse.json({ error: "Internal Server Error", detail: msg }, { status: 500 });
  }
}
