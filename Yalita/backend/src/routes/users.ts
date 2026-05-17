import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { UserService } from "../services/UserService";
import { authMiddleware } from "../middleware/auth";

export const userRoutes = new Hono();
const userService = new UserService();

const registerSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(50).optional(),
  ci: z.string().regex(/^\d{4}$/).optional(),
});

userRoutes.post("/register", zValidator("json", registerSchema), async (c) => {
  const body = c.req.valid("json");
  const payload: {
    walletAddress: `0x${string}`;
    phoneNumber?: string;
    email?: string;
    firstName?: string;
    ci?: string;
  } = { walletAddress: body.walletAddress as `0x${string}` };
  if (body.phoneNumber !== undefined) payload.phoneNumber = body.phoneNumber;
  if (body.email !== undefined) payload.email = body.email;
  if (body.firstName !== undefined) payload.firstName = body.firstName;
  if (body.ci !== undefined) payload.ci = body.ci;

  const user = await userService.registerOrGet({
    ...payload,
  });
  return c.json(user);
});

userRoutes.get("/me", authMiddleware, async (c) => {
  const walletAddress = c.get("walletAddress") as `0x${string}`;
  const user = await userService.getByWallet(walletAddress);
  return c.json(user);
});
