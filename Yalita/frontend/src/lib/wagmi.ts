import { createConfig } from "@privy-io/wagmi";
import { avalancheFuji } from "viem/chains";
import { http } from "wagmi";
import { env } from "./env";

export const wagmiConfig = createConfig({
  chains: [avalancheFuji],
  transports: {
    [avalancheFuji.id]: http(env.NEXT_PUBLIC_RPC_URL),
  },
});
