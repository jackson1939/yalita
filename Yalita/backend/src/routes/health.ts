import { Hono } from "hono";

export const healthRoutes = new Hono();

healthRoutes.get("/", (c) =>
  c.json({
    ok: true,
    service: "quipu-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  })
);
