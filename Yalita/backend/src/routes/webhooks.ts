import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { LoanService } from "../services/LoanService";
import { logger } from "../lib/logger";

export const webhookRoutes = new Hono();
const loanService = new LoanService();

/**
 * Webhook que llamaría Tigo Money / SIMPLE cuando el usuario recibe un cobro QR.
 * Aplica el % de repago automático al préstamo activo.
 *
 * En el demo es invocado por el script de pagos simulados.
 */
webhookRoutes.post(
  "/qr-payment",
  zValidator(
    "json",
    z.object({
      walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      amountBs: z.number().positive(),
      qrPaymentId: z.string(),
    })
  ),
  async (c) => {
    const body = c.req.valid("json");

    // Aplicar 8% del cobro al pool (constante AUTO_REPAY_PCT del shared/)
    const repayBs = body.amountBs * 0.08;
    const repayUsd = repayBs / 6.96; // tipo de cambio fijo Bs→USD para demo

    try {
      const result = await loanService.repay({
        walletAddress: body.walletAddress as `0x${string}`,
        amountUsd: repayUsd,
        source: "AUTO_QR",
      });
      logger.info({ result, repayUsd }, "Auto-repay aplicado");
      return c.json({ ok: true, repayUsd, ...result });
    } catch (err) {
      logger.warn({ err }, "Auto-repay falló (no hay préstamo activo)");
      return c.json({ ok: false, reason: "no_active_loan" });
    }
  }
);
