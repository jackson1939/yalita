// Validación de variables de entorno con Zod.
// Si falta una variable crítica, el proceso falla en startup.

import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3001),
  ALLOWED_ORIGIN: z.string().default("*"),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1),
  PRIVY_APP_SECRET: z.string().min(1),

  RECLAIM_APP_ID: z.string().optional(),
  RECLAIM_APP_SECRET: z.string().optional(),

  NEXT_PUBLIC_RPC_URL: z.string().url(),
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number().default(43113),
  ORACLE_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
  WAVY_NODE_API_KEY: z.string().optional(),
  WAVY_NODE_API_URL: z.string().url().default("https://api.wavynode.com"),
  WAVY_NODE_MOCK: z.string().default("true"),

  NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_SCORING_ENGINE_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_LENDING_POOL_ADDRESS: z.string().optional(),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Variables de entorno inválidas:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
