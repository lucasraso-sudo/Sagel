import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { refreshAllPrices } from "../lib/pricing/refreshPrices";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DAY_MS = 24 * 60 * 60 * 1000;

async function runOnce() {
  const t0 = Date.now();
  const res = await refreshAllPrices(prisma);
  console.log(
    `💸 ${new Date().toLocaleString("fr-FR")} — ${res.offersUpdated} offres mises à jour, ${res.productsRepriced} prix produits recalculés (${Date.now() - t0}ms)`
  );
}

async function main() {
  const watch = process.argv.includes("--watch");
  const intervalArg = process.argv.find((a) => a.startsWith("--every="));
  const intervalMs = intervalArg
    ? Number(intervalArg.split("=")[1]) * 1000
    : DAY_MS;

  await runOnce();

  if (watch) {
    console.log(
      `⏱️  Mode watch : rafraîchissement toutes les ${Math.round(intervalMs / 1000)}s. Ctrl+C pour arrêter.`
    );
    setInterval(() => {
      runOnce().catch(console.error);
    }, intervalMs);
  } else {
    await prisma.$disconnect();
  }
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
