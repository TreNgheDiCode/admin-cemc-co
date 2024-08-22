import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { withPulse } from "@prisma/extension-pulse";

export const db = new PrismaClient().$extends(withAccelerate()).$extends(
  withPulse({
    apiKey: process.env["PULSE_API_KEY"] as string,
  })
);
