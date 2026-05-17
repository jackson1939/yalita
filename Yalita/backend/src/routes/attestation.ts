import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AttestationService } from "../services/AttestationService";

export const attestationRoutes = new Hono();
const service = new AttestationService();

const DATA_SOURCES = ["TIGO_MONEY", "SIMPLE_BANK", "BANCO_UNION", "BELVO", "SELF_ATTESTED"] as const;

attestationRoutes.post(
  "/submit",
  zValidator(
    "json",
    z.object({
      user: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      dataSource: z.enum(DATA_SOURCES),
      txCount: z.number().int().positive(),
      totalVolumeBs: z.number().nonnegative(),
      monthsCovered: z.number().int().min(1).max(60),
    })
  ),
  async (c) => {
    const body = c.req.valid("json");
    const result = await service.submit({
      user: body.user as `0x${string}`,
      dataSource: body.dataSource,
      txCount: body.txCount,
      totalVolumeBs: body.totalVolumeBs,
      monthsCovered: body.monthsCovered,
    });
    return c.json(result);
  }
);

attestationRoutes.get("/:address", async (c) => {
  const address = c.req.param("address") as `0x${string}`;
  const list = await service.getByUser(address);
  return c.json(list);
});
