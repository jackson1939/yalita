// Entry point de la API Yalita.
// Se monta sobre Hono y se sirve desde:
//   - Node local (vía tsx en dev)
//   - Vercel Serverless (vía api/index.ts)

import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

import { env } from "./lib/env";
import { logger } from "./lib/logger";

import { rateLimitMiddleware } from "./middleware/rateLimit";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";

import { healthRoutes } from "./routes/health";
import { userRoutes } from "./routes/users";
import { scoreRoutes } from "./routes/score";
import { loanRoutes } from "./routes/loans";
import { attestationRoutes } from "./routes/attestation";
import { oracleRoutes } from "./routes/oracle";
import { webhookRoutes } from "./routes/webhooks";

const app = new Hono();

app.use("*", requestLogger);
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return origin; // mismo servidor / mobile apps sin origin
      if (env.ALLOWED_ORIGIN === "*") return origin;
      const allowed = env.ALLOWED_ORIGIN.split(",").map((s) => s.trim()).includes(origin);
      return allowed ? origin : null;
    },
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
  }),
);
app.use("*", rateLimitMiddleware);

app.route("/health", healthRoutes);
app.route("/users", userRoutes);
app.route("/score", scoreRoutes);
app.route("/loans", loanRoutes);
app.route("/attestation", attestationRoutes);
app.route("/oracle", oracleRoutes);
app.route("/webhooks", webhookRoutes);

app.onError(errorHandler);
app.notFound((c) => c.json({ error: "Not found", path: c.req.path }, 404));

// Solo arrancar listener si no estamos en Vercel
if (env.NODE_ENV !== "production" || !process.env["VERCEL"]) {
  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    logger.info(`🚀 Yalita API ready on http://localhost:${info.port}`);
  });
}

export default app;
