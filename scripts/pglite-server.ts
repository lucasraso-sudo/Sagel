// Embedded PostgreSQL server (PGlite) exposed on a real TCP port.
// Lets Prisma's pg adapter connect with zero code changes — fully offline,
// no Postgres/Docker install required. Data persists to ./.pglite-data.
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const PORT = Number(process.env.PGLITE_PORT ?? 5432);
const DATA_DIR = process.env.PGLITE_DATA ?? "./.pglite-data";

async function main() {
  const db = await PGlite.create({ dataDir: DATA_DIR });
  const server = new PGLiteSocketServer({ db, port: PORT, host: "127.0.0.1" });
  await server.start();
  console.log(`PGlite server listening on 127.0.0.1:${PORT} (data: ${DATA_DIR})`);

  const shutdown = async () => {
    await server.stop();
    await db.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
