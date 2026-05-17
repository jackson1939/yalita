"use client";

// ──────────────────────────────────────────────────────────────────────────────
// useYalitaAuth — auth dual-mode (Privy real cuando hay APP_ID, demo cuando no)
// ──────────────────────────────────────────────────────────────────────────────
// Uso desde cualquier componente:
//   const { ready, authenticated, walletAddress, sendCode, verifyCode, logout } = useYalitaAuth();
//
// El hook expone una API estable que NO cambia con o sin Privy.
// El UI nunca tiene que saber en qué modo estamos.
// ──────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { usePrivy, useLoginWithSms } from "@privy-io/react-auth";
import { IS_DEMO_AUTH } from "@/lib/env";
import { useQuipuStore } from "@/stores/quipu.store";

const DEMO_OTP = "123456";
const DEMO_WALLET = "0xD3M0000000000000000000000000000000000001" as const;

export interface YalitaAuth {
  /** Privy ya cargó (o demo siempre true) */
  ready: boolean;
  /** Usuario logueado con wallet creada */
  authenticated: boolean;
  /** Dirección de la wallet embebida del usuario (0x... o null) */
  walletAddress: `0x${string}` | null;
  /** Email del usuario si lo proveyó, sino null */
  email: string | null;
  /** Modo actual (informativo para UI) */
  mode: "privy" | "demo";

  /** Envía un código SMS al teléfono dado. Retorna true si OK */
  sendCode: (phoneE164: string) => Promise<boolean>;
  /** Verifica el código. Si OK crea wallet y devuelve la address */
  verifyCode: (code: string) => Promise<`0x${string}` | null>;
  /** Cierra sesión */
  logout: () => Promise<void>;
}

export function useYalitaAuth(): YalitaAuth {
  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (IS_DEMO_AUTH) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDemoAuth();
  }

  // ── Privy real ─────────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return usePrivyAuth();
}

// ── DEMO IMPLEMENTATION ──────────────────────────────────────────────────────
function useDemoAuth(): YalitaAuth {
  const setPhone = useQuipuStore((s) => s.setUserPhone);
  const setWallet = useQuipuStore((s) => s.setWalletAddress);
  const storedWallet = useQuipuStore((s) => s.walletAddress);

  const [authenticated, setAuthenticated] = useState(!!storedWallet);
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | null>(storedWallet);
  const [pendingPhone, setPendingPhone] = useState<string>("");

  // Rehidratar desde el store al montar
  useEffect(() => {
    if (storedWallet) {
      setAuthenticated(true);
      setWalletAddress(storedWallet);
    }
  }, [storedWallet]);

  const sendCode = useCallback(async (phoneE164: string) => {
    setPendingPhone(phoneE164);
    await new Promise((r) => setTimeout(r, 800));
    console.log(`[yalita demo] SMS would be sent to ${phoneE164}. Use code: ${DEMO_OTP}`);
    return true;
  }, []);

  const verifyCode = useCallback(async (code: string) => {
    await new Promise((r) => setTimeout(r, 500));
    if (code !== DEMO_OTP) return null;

    // Wallet determinística por teléfono — el mismo número siempre genera la misma wallet
    const digits = pendingPhone.replace(/\D/g, "").padEnd(36, "1").slice(0, 36);
    const wallet: `0x${string}` = (pendingPhone
      ? `0xD3M0${digits}`
      : DEMO_WALLET) as `0x${string}`;

    setAuthenticated(true);
    setWalletAddress(wallet);
    setWallet(wallet);
    setPhone(pendingPhone);
    return wallet;
  }, [pendingPhone, setPhone, setWallet]);

  const logout = useCallback(async () => {
    setAuthenticated(false);
    setWalletAddress(null);
    setWallet(null);
  }, [setWallet]);

  return {
    ready: true,
    authenticated,
    walletAddress,
    email: null,
    mode: "demo",
    sendCode,
    verifyCode,
    logout,
  };
}

// ── PRIVY REAL IMPLEMENTATION ────────────────────────────────────────────────
function usePrivyAuth(): YalitaAuth {
  const { ready, authenticated, user, logout: privyLogout } = usePrivy();
  const { sendCode: privySendCode, loginWithCode } = useLoginWithSms();
  const setPhone = useQuipuStore((s) => s.setUserPhone);
  const setWallet = useQuipuStore((s) => s.setWalletAddress);
  const [pendingPhone, setPendingPhone] = useState<string>("");

  const walletAddress = (user?.wallet?.address as `0x${string}` | undefined) ?? null;

  // Sincronizar Privy → store
  useEffect(() => {
    if (authenticated) {
      if (user?.phone?.number) setPhone(user.phone.number);
      if (walletAddress) setWallet(walletAddress);
    }
  }, [authenticated, user?.phone?.number, walletAddress, setPhone, setWallet]);

  const sendCode = useCallback(async (phoneE164: string) => {
    setPendingPhone(phoneE164);
    try {
      await privySendCode({ phoneNumber: phoneE164 });
      return true;
    } catch (err) {
      console.error("[Privy] sendCode failed:", err);
      return false;
    }
  }, [privySendCode]);

  const verifyCode = useCallback(async (code: string) => {
    try {
      await loginWithCode({ code });
      // Esperar a que Privy actualice el user. La wallet se lee del usePrivy() del próximo render.
      // Devolvemos la dirección desde el closure si ya está disponible.
      return (user?.wallet?.address as `0x${string}` | undefined) ?? null;
    } catch (err) {
      console.error("[Privy] verifyCode failed:", err);
      return null;
    }
  }, [loginWithCode, user]);

  const logout = useCallback(async () => {
    await privyLogout();
  }, [privyLogout]);

  return {
    ready,
    authenticated,
    walletAddress,
    email: user?.email?.address ?? null,
    mode: "privy",
    sendCode,
    verifyCode,
    logout,
  };
}
