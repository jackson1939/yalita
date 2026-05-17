// ──────────────────────────────────────────────────────────────────────────────
// POST /api/loan/request
// ──────────────────────────────────────────────────────────────────────────────
// Recibe { walletAddress, amountBs, termMonths } del frontend.
// Hace dos cosas:
//   1. Obtiene quote del contrato LendingPool (rate, totalDue, monthly)
//   2. Devuelve calldata pre-codificada para que el frontend la firme con Privy/Wagmi
//
// Devuelve los datos en Bs Y USDC para que el UI no haga conversiones.
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbi, encodeFunctionData } from "viem";
import { avalancheFuji } from "viem/chains";

export const runtime = "nodejs";

const BS_PER_USDC = 6.96;

const LENDING_POOL_ABI = parseAbi([
  "function getQuote(address user, uint128 principal, uint32 durationDays) view returns (uint16 annualRateBps, uint128 totalDue, uint128 monthlyPayment)",
  "function requestLoan(uint128 principal, uint32 durationDays)",
]);

function bsToUsdc(bs: number): bigint {
  // USDC tiene 6 decimales. Multiplicamos por 1e6 después de convertir
  return BigInt(Math.round((bs / BS_PER_USDC) * 1_000_000));
}

function usdcToBs(usdc: bigint): number {
  return (Number(usdc) / 1_000_000) * BS_PER_USDC;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      walletAddress,
      amountBs,
      termMonths = 3,
    } = body as {
      walletAddress: `0x${string}`;
      amountBs: number;
      termMonths: number;
    };

    // Validaciones
    if (!walletAddress?.startsWith("0x") || walletAddress.length !== 42) {
      return NextResponse.json({ error: "Wallet inválida" }, { status: 400 });
    }
    if (amountBs < 500 || amountBs > 10000) {
      return NextResponse.json({ error: "Monto fuera de rango [Bs 500, Bs 10.000]" }, { status: 400 });
    }
    if (termMonths < 1 || termMonths > 12) {
      return NextResponse.json({ error: "Plazo fuera de rango [1, 12 meses]" }, { status: 400 });
    }

    const principalUsdc = bsToUsdc(amountBs);
    const durationDays = termMonths * 30;

    const lendingPool = process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS as `0x${string}` | undefined;
    const hasContracts = !!lendingPool && lendingPool !== "0x0000000000000000000000000000000000000000";

    // ── Modo demo: calcular quote off-chain ──────────────────────────────
    if (!hasContracts) {
      const annualRateBps = 1800; // 18% anual (default Yalita)
      const interestUsdc = (principalUsdc * BigInt(annualRateBps) * BigInt(durationDays)) / BigInt(10_000 * 365);
      const totalDueUsdc = principalUsdc + interestUsdc;
      const monthlyPaymentUsdc = totalDueUsdc / BigInt(termMonths);

      return NextResponse.json({
        mode: "demo",
        amountBs,
        amountUsdc: principalUsdc.toString(),
        termMonths,
        durationDays,
        annualRateBps,
        annualRatePct: annualRateBps / 100,
        totalDueUsdc: totalDueUsdc.toString(),
        totalDueBs: usdcToBs(totalDueUsdc),
        monthlyPaymentUsdc: monthlyPaymentUsdc.toString(),
        monthlyPaymentBs: usdcToBs(monthlyPaymentUsdc),
        contractCallData: null,
        contractAddress: null,
      });
    }

    // ── Modo real: leer quote del contrato ───────────────────────────────
    const publicClient = createPublicClient({
      chain: avalancheFuji,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc"),
    });

    const [annualRateBps, totalDue, monthlyPayment] = await publicClient.readContract({
      address: lendingPool!,
      abi: LENDING_POOL_ABI,
      functionName: "getQuote",
      args: [walletAddress, principalUsdc, durationDays],
    });

    // Codificar la calldata para que el frontend pueda firmar la tx
    const callData = encodeFunctionData({
      abi: LENDING_POOL_ABI,
      functionName: "requestLoan",
      args: [principalUsdc, durationDays],
    });

    return NextResponse.json({
      mode: "real",
      amountBs,
      amountUsdc: principalUsdc.toString(),
      termMonths,
      durationDays,
      annualRateBps: Number(annualRateBps),
      annualRatePct: Number(annualRateBps) / 100,
      totalDueUsdc: totalDue.toString(),
      totalDueBs: usdcToBs(totalDue),
      monthlyPaymentUsdc: monthlyPayment.toString(),
      monthlyPaymentBs: usdcToBs(monthlyPayment),
      contractCallData: callData,
      contractAddress: lendingPool,
    });

  } catch (error) {
    const msg = (error as Error).message;
    console.error("[loan/request] error:", msg);

    if (msg.includes("ScoreTooLow")) {
      return NextResponse.json({ error: "Tu score es muy bajo para este monto" }, { status: 422 });
    }
    if (msg.includes("InsufficientLiquidity")) {
      return NextResponse.json({ error: "No hay suficiente liquidez en el pool" }, { status: 422 });
    }

    return NextResponse.json({ error: "Internal Server Error", detail: msg }, { status: 500 });
  }
}
