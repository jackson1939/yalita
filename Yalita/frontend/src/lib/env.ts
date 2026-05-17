// Validación de variables públicas con Zod.
// Si falta una en build time, falla con mensaje claro.

import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1, "Falta NEXT_PUBLIC_PRIVY_APP_ID"),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_RPC_URL: z.string().url(),
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number().default(43113),
  NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_SCORING_ENGINE_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_LENDING_POOL_ADDRESS: z.string().optional(),
});

const result = schema.safeParse({
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS,
  NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS,
  NEXT_PUBLIC_SCORING_ENGINE_ADDRESS: process.env.NEXT_PUBLIC_SCORING_ENGINE_ADDRESS,
  NEXT_PUBLIC_LENDING_POOL_ADDRESS: process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS,
});

if (!result.success && typeof window === "undefined") {
  console.error("❌ Variables de entorno inválidas:", result.error.flatten().fieldErrors);
  throw new Error("Invalid frontend env");
}

export const env = (result.data ?? {}) as z.infer<typeof schema>;
