import { PrismaClient } from "@prisma/client";
import { config } from "./config";

/**
 * A single Prisma client across hot reloads in dev. In production each serverless
 * instance gets its own client.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isProd ? ["error"] : ["error", "warn"],
  });

if (!config.isProd) globalForPrisma.prisma = prisma;
