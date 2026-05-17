import type { Context, Next } from "hono";
import { privy } from "../lib/privy";
import { logger } from "../lib/logger";

declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    walletAddress: string;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const claims = await privy.verifyAuthToken(token);
    c.set("userId", claims.userId);

    // Obtener wallet del usuario
    const user = await privy.getUser(claims.userId);
    const wallet = user.linkedAccounts.find((a) => a.type === "wallet");
    if (!wallet || !("address" in wallet)) {
      return c.json({ error: "User has no wallet linked" }, 401);
    }
    c.set("walletAddress", wallet.address as string);

    await next();
  } catch (err) {
    logger.warn({ err }, "Auth failed");
    return c.json({ error: "Invalid token" }, 401);
  }
}
