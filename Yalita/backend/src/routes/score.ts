import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ScoreService } from "../services/ScoreService";

export const scoreRoutes = new Hono();
const scoreService = new ScoreService();

scoreRoutes.get("/:address", async (c) => {
  const address = c.req.param("address") as `0x${string}`;
  const score = await scoreService.getOnChain(address);
  return c.json(score);
});

scoreRoutes.post(
  "/preview",
  zValidator(
    "json",
    z.object({
      txCount: z.number().int().positive(),
      volumeBs: z.number().nonnegative(),
      months: z.number().int().min(1).max(60),
    })
  ),
  async (c) => {
    const body = c.req.valid("json");
    const result = await scoreService.preview(body);
    return c.json(result);
  }
);

scoreRoutes.get("/:address/history", async (c) => {
  const address = c.req.param("address") as `0x${string}`;
  const history = await scoreService.getHistory(address);
  return c.json(history);
});
