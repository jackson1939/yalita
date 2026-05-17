import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

export function errorHandler(err: Error, c: Context) {
  logger.error({ err, path: c.req.path }, "Request failed");

  if (err instanceof HTTPException) {
    return c.json({ error: err.message, code: "HTTP_EXCEPTION" }, err.status);
  }

  if (err instanceof ZodError) {
    return c.json(
      { error: "Validation error", code: "INVALID_INPUT", details: err.flatten() },
      400
    );
  }

  // Default
  return c.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    500
  );
}
