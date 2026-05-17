import pino from "pino";
import { env } from "./env";

const loggerOptions = {
  level: env.NODE_ENV === "production" ? "info" : "debug",
  ...(env.NODE_ENV !== "production"
    ? { transport: { target: "pino-pretty", options: { colorize: true } } }
    : {}),
};

export const logger = pino(loggerOptions);
