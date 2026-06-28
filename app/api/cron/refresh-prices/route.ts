import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { refreshAllPrices } from "@/lib/pricing/refreshPrices";

// Triggers a full price refresh. Point a daily/weekly scheduler at this route
// (Vercel Cron, GitHub Actions, cron-job.org…). Protected (fail-closed):
// callers MUST send `Authorization: Bearer <CRON_SECRET>`, and the endpoint is
// disabled until CRON_SECRET is configured.
export const dynamic = "force-dynamic";

async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Fail closed: no secret configured → endpoint disabled (never open).
  if (!secret) {
    return Response.json(
      { error: "Cron disabled: CRON_SECRET is not configured" },
      { status: 503 }
    );
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshAllPrices(prisma);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("Price refresh failed:", err);
    return Response.json({ ok: false, error: "Refresh failed" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
