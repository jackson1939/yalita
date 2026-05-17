// Entry point para Vercel Serverless.
// Hono se monta como handler de Vercel Edge/Node Functions.

import { handle } from "hono/vercel";
import app from "../src/index";

export const config = { runtime: "nodejs" };

export default handle(app);
