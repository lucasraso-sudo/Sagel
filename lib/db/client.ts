import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  // The local embedded Postgres (PGlite socket server) only supports a single
  // connection at a time, so cap the pool to 1 when talking to it. Real
  // Postgres deployments keep the default pool.
  const isLocalEmbedded = /127\.0\.0\.1|localhost/.test(connectionString);
  const adapter = new PrismaPg(
    isLocalEmbedded ? { connectionString, max: 1 } : { connectionString }
  );
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
