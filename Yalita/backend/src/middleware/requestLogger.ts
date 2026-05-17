import type { Context, Next } from "hono";
import { logger } from "../lib/logger";

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    ms,
  });
}
