// Validación de variables del frontend con Zod — modo tolerante.
// Variables faltantes se reportan en consola pero no rompen el build.
// La app cae a "modo demo" automáticamente cuando faltan credenciales reales.

import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_PRIVY_APP_ID: z.string().default(""),
  NEXT_PUBLIC_API_URL: z.string().default(""),
  NEXT_PUBLIC_RPC_URL: z.string().default("https://api.avax-test.network/ext/bc/C/rpc"),
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number().default(43113),
  NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS:       z.string().default(""),
  NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS: z.string().default(""),
  NEXT_PUBLIC_SCORING_ENGINE_ADDRESS:       z.string().default(""),
  NEXT_PUBLIC_LENDING_POOL_ADDRESS:         z.string().default(""),
  NEXT_PUBLIC_RECLAIM_APP_ID:               z.string().default(""),
});

const raw = {
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS,
  NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS,
  NEXT_PUBLIC_SCORING_ENGINE_ADDRESS: process.env.NEXT_PUBLIC_SCORING_ENGINE_ADDRESS,
  NEXT_PUBLIC_LENDING_POOL_ADDRESS: process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS,
  NEXT_PUBLIC_RECLAIM_APP_ID: process.env.NEXT_PUBLIC_RECLAIM_APP_ID,
};

const parsed = schema.parse(raw);
export const env = parsed;

// ── Feature flags derivados ─────────────────────────────────────────────────
export const IS_DEMO_AUTH      = !env.NEXT_PUBLIC_PRIVY_APP_ID;
export const IS_DEMO_RECLAIM   = !env.NEXT_PUBLIC_RECLAIM_APP_ID;
export const HAS_DEPLOYED_CONTRACTS = !!env.NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS && env.NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000";

if (typeof window === "undefined") {
  // Server-side: log el modo actual al iniciar
  if (IS_DEMO_AUTH)    console.warn("[yalita] PRIVY_APP_ID missing → modo demo (auth simulada)");
  if (IS_DEMO_RECLAIM) console.warn("[yalita] RECLAIM_APP_ID missing → modo demo (Yape mock)");
  if (!HAS_DEPLOYED_CONTRACTS) console.warn("[yalita] contratos no deployados → modo demo (sin tx on-chain)");
}
