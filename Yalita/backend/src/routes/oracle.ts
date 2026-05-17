import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { OracleService } from "../services/OracleService";
import { AttestationService } from "../services/AttestationService";

export const oracleRoutes = new Hono();
const oracle = new OracleService();
const attestation = new AttestationService();

const DATA_SOURCES = ["TIGO_MONEY", "SIMPLE_BANK", "BANCO_UNION", "BELVO", "SELF_ATTESTED"] as const;

oracleRoutes.post(
  "/reclaim/request",
  zValidator(
    "json",
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      providerId: z.enum(DATA_SOURCES),
    })
  ),
  async (c) => {
    const body = c.req.valid("json");
    const result = await oracle.createRequest({
      user: body.userAddress as `0x${string}`,
      providerId: body.providerId,
    });
    return c.json(result);
  }
);

oracleRoutes.post("/reclaim/callback", async (c) => {
  const payload = await c.req.json();
  const data = await oracle.processCallback(payload);
  // Disparar el flujo de attestation
  const result = await attestation.submit(data);
  return c.json(result);
});
