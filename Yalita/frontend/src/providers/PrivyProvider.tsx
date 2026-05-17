"use client";

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { avalancheFuji } from "viem/chains";
import { wagmiConfig } from "@/lib/wagmi";
import { env } from "@/lib/env";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyAuthProvider
      appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#22c55e",
          showWalletLoginFirst: false,
        },
        loginMethods: ["sms", "email"],
        defaultChain: avalancheFuji,
        supportedChains: [avalancheFuji],
        embeddedWallets: {
          createOnLogin: "all-users",
          noPromptOnSignature: true,
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
    </PrivyAuthProvider>
  );
}
