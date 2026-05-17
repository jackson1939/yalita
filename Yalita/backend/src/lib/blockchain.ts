import { createPublicClient, createWalletClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import { env } from "./env";

export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(env.NEXT_PUBLIC_RPC_URL),
});

export const oracleAccount = env.ORACLE_PRIVATE_KEY
  ? privateKeyToAccount(env.ORACLE_PRIVATE_KEY as `0x${string}`)
  : null;

export const walletClient = oracleAccount
  ? createWalletClient({
      account: oracleAccount,
      chain: avalancheFuji,
      transport: http(env.NEXT_PUBLIC_RPC_URL),
    })
  : null;

export const contractAddresses = {
  scoreRegistry: env.NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS as Address,
  attestationRegistry: env.NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS as Address,
  scoringEngine: env.NEXT_PUBLIC_SCORING_ENGINE_ADDRESS as Address,
  lendingPool: env.NEXT_PUBLIC_LENDING_POOL_ADDRESS as Address,
};
