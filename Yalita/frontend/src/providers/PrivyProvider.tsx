"use client";

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { avalancheFuji } from "viem/chains";
import { wagmiConfig } from "@/lib/wagmi";
import { env, IS_DEMO_AUTH } from "@/lib/env";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // Modo demo: bypass completo de Privy. La app sigue funcionando.
  if (IS_DEMO_AUTH) {
    return <>{children}</>;
  }

  return (
    <PrivyAuthProvider
      appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#2CB462",
          logo: "/icon.svg",
          showWalletLoginFirst: false,
        },
        loginMethods: ["sms"],
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
