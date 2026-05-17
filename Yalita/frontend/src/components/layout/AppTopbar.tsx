"use client";

import { usePrivy } from "@privy-io/react-auth";
import { usePathname } from "next/navigation";
import { shortenAddress } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/score": "Mi Score",
  "/credito": "Crédito",
  "/credito/solicitar": "Solicitar crédito",
  "/credito/historial": "Historial",
  "/repagar": "Repagar",
  "/perfil": "Mi Perfil",
};

export function AppTopbar() {
  const pathname = usePathname();
  const { user } = usePrivy();
  const wallet = user?.wallet?.address;

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-30">
      <h1 className="text-base font-semibold text-white">{TITLES[pathname] ?? "Yalita"}</h1>

      <div className="flex items-center gap-3">
        {wallet && (
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-quipu-500" />
            <span className="text-xs text-neutral-400 font-mono">{shortenAddress(wallet)}</span>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-quipu-500/20 flex items-center justify-center text-quipu-500 text-xs font-bold">
          {user?.phone?.number?.slice(-2) ?? "U"}
        </div>
      </div>
    </header>
  );
}
