import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { LoanService } from "../services/LoanService";
import { authMiddleware } from "../middleware/auth";

export const loanRoutes = new Hono();
const loanService = new LoanService();

loanRoutes.use("*", authMiddleware);

loanRoutes.get("/active", async (c) => {
  const walletAddress = c.get("walletAddress") as `0x${string}`;
  const loan = await loanService.getActive(walletAddress);
  return c.json(loan);
});

loanRoutes.get("/history", async (c) => {
  const walletAddress = c.get("walletAddress") as `0x${string}`;
  const loans = await loanService.getHistory(walletAddress);
  return c.json(loans);
});

loanRoutes.get(
  "/quote",
  zValidator(
    "query",
    z.object({
      address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      principal: z.coerce.bigint(),
      days: z.coerce.number().int().min(30).max(365),
    })
  ),
  async (c) => {
    const { address, principal, days } = c.req.valid("query");
    const quote = await loanService.getQuote(address as `0x${string}`, principal, days);
    return c.json(quote);
  }
);

loanRoutes.post(
  "/request",
  zValidator(
    "json",
    z.object({
      principalUsd: z.number().min(50).max(5000),
      durationDays: z.number().int().min(30).max(365),
    })
  ),
  async (c) => {
    const walletAddress = c.get("walletAddress") as `0x${string}`;
    const body = c.req.valid("json");
    const loan = await loanService.request({ walletAddress, ...body });
    return c.json(loan);
  }
);

loanRoutes.post(
  "/repay",
  zValidator(
    "json",
    z.object({
      amountUsd: z.number().positive(),
      source: z.enum(["MANUAL", "AUTO_QR"]).default("MANUAL"),
    })
  ),
  async (c) => {
    const walletAddress = c.get("walletAddress") as `0x${string}`;
    const body = c.req.valid("json");
    const result = await loanService.repay({ walletAddress, ...body });
    return c.json(result);
  }
);
