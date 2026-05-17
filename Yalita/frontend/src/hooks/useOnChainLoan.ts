"use client";

// ──────────────────────────────────────────────────────────────────────────────
// useOnChainLoan — solicita préstamo on-chain real con firma de Privy/Wagmi
// ──────────────────────────────────────────────────────────────────────────────
// Flujo:
//   1. POST /api/loan/request → quote + calldata
//   2. Firmar tx con la wallet embebida de Privy (sendTransaction de Wagmi)
//   3. Esperar receipt → devolver txHash + Snowtrace URL
//
// Modo demo: simula todo y actualiza el store local con el préstamo "recibido".
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { useSendTransaction } from "wagmi";
import { HAS_DEPLOYED_CONTRACTS, IS_DEMO_AUTH } from "@/lib/env";
import { useQuipuStore } from "@/stores/quipu.store";

export interface LoanQuote {
  amountBs: number;
  termMonths: number;
  annualRatePct: number;
  totalDueBs: number;
  monthlyPaymentBs: number;
}

export interface LoanResult {
  quote: LoanQuote;
  txHash: string | null;
  snowtraceUrl: string | null;
  isReal: boolean;
}

export function useOnChainLoan() {
  const walletAddress = useQuipuStore((s) => s.walletAddress);
  const receiveLoan = useQuipuStore((s) => s.receiveLoan);
  const { sendTransactionAsync } = useSendTransaction();

  const [pending, setPending] = useState(false);
  const [stage, setStage] = useState<"idle" | "quoting" | "signing" | "confirming" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Helper: get quote del backend (real o demo)
  const getQuote = useCallback(async (amountBs: number, termMonths: number) => {
    const res = await fetch("/api/loan/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: walletAddress ?? "0xMockAddress",
        amountBs,
        termMonths,
      }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error ?? `HTTP ${res.status}`);
    }
    return res.json();
  }, [walletAddress]);

  // Main flow
  const requestLoan = useCallback(async (params: {
    amountBs: number;
    termMonths: number;
  }): Promise<LoanResult> => {
    setPending(true);
    setError(null);
    setStage("quoting");

    try {
      const quoteData = await getQuote(params.amountBs, params.termMonths);

      const quote: LoanQuote = {
        amountBs: quoteData.amountBs,
        termMonths: quoteData.termMonths,
        annualRatePct: quoteData.annualRatePct,
        totalDueBs: quoteData.totalDueBs,
        monthlyPaymentBs: quoteData.monthlyPaymentBs,
      };

      // ── Modo demo: actualizar store local + mock txHash ────────────────
      if (quoteData.mode === "demo" || !HAS_DEPLOYED_CONTRACTS || IS_DEMO_AUTH) {
        setStage("signing");
        await new Promise((r) => setTimeout(r, 1200));
        setStage("confirming");
        await new Promise((r) => setTimeout(r, 1600));

        const mockTx = generateMockTxHash();
        receiveLoan(params.amountBs, params.termMonths);

        const result: LoanResult = {
          quote,
          txHash: mockTx,
          snowtraceUrl: `https://testnet.snowtrace.io/tx/${mockTx}`,
          isReal: false,
        };
        setStage("done");
        return result;
      }

      // ── Modo real: firmar tx con Wagmi ─────────────────────────────────
      setStage("signing");

      const txHash = await sendTransactionAsync({
        to: quoteData.contractAddress as `0x${string}`,
        data: quoteData.contractCallData as `0x${string}`,
        value: BigInt(0),
      });

      setStage("confirming");

      // Esperar el receipt (Wagmi lo hace automáticamente)
      // En modo real, también actualizamos el store local
      receiveLoan(params.amountBs, params.termMonths);

      const result: LoanResult = {
        quote,
        txHash,
        snowtraceUrl: `https://testnet.snowtrace.io/tx/${txHash}`,
        isReal: true,
      };
      setStage("done");
      return result;

    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      setStage("error");
      throw err;
    } finally {
      setPending(false);
    }
  }, [getQuote, receiveLoan, sendTransactionAsync]);

  return { requestLoan, getQuote, pending, stage, error };
}

// ── Mock txHash ──────────────────────────────────────────────────────────────
function generateMockTxHash(): string {
  const hex = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 64; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}
