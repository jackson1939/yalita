"use client";

// ──────────────────────────────────────────────────────────────────────────────
// useOnChainScore — escritura on-chain real del DPI Score en Fuji
// ──────────────────────────────────────────────────────────────────────────────
// Modo real: llama POST /api/score/submit-onchain con el wallet del usuario.
//            El backend firma con ORACLE_PRIVATE_KEY y ejecuta submitScore().
//
// Modo demo: simula la firma y devuelve un txHash mock pero verosímil.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { HAS_DEPLOYED_CONTRACTS } from "@/lib/env";

export interface OnChainScoreResult {
  txHash: string | null;
  blockNumber: number | null;
  snowtraceUrl: string | null;
  isReal: boolean;
}

export function useOnChainScore() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<OnChainScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (params: {
    walletAddress: `0x${string}`;
    score: number;
    totalTxs: number;
    volumeBs: number;
  }): Promise<OnChainScoreResult> => {
    setPending(true);
    setError(null);

    // Modo demo: si no hay contratos deployados, simulamos
    if (!HAS_DEPLOYED_CONTRACTS) {
      const mockTx = generateMockTxHash();
      await new Promise((r) => setTimeout(r, 1600)); // simula latencia red

      const fakeBlock = 35_000_000 + Math.floor(Math.random() * 100_000);
      const mockResult: OnChainScoreResult = {
        txHash: mockTx,
        blockNumber: fakeBlock,
        snowtraceUrl: `https://testnet.snowtrace.io/tx/${mockTx}`,
        isReal: false,
      };
      setResult(mockResult);
      setPending(false);
      return mockResult;
    }

    // Modo real: el backend firma con la oracle wallet
    try {
      const res = await fetch("/api/score/submit-onchain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json() as {
        txHash: string;
        blockNumber: number;
      };

      const realResult: OnChainScoreResult = {
        txHash: data.txHash,
        blockNumber: data.blockNumber,
        snowtraceUrl: `https://testnet.snowtrace.io/tx/${data.txHash}`,
        isReal: true,
      };
      setResult(realResult);
      return realResult;

    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);

      // Fallback graceful: si falla la tx real, mostramos un mock para no romper la UX
      const mockTx = generateMockTxHash();
      const fallbackResult: OnChainScoreResult = {
        txHash: mockTx,
        blockNumber: null,
        snowtraceUrl: `https://testnet.snowtrace.io/tx/${mockTx}`,
        isReal: false,
      };
      setResult(fallbackResult);
      return fallbackResult;
    } finally {
      setPending(false);
    }
  }, []);

  return { submit, pending, result, error };
}

// ── Mock txHash con formato real de keccak256 ────────────────────────────────
function generateMockTxHash(): string {
  const hex = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 64; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}
