import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { buildAffiliateUrl } from "@/lib/affiliate";

// Outbound click handler. Every "Voir l'offre" button points here instead of
// straight to the merchant, so affiliate wrapping happens server-side (the
// config never reaches the client) and clicks are tracked for revenue
// attribution. The destination is always a merchant URL already stored in our
// DB, so there is no open-redirect risk.
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await params;

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) {
    return Response.json({ error: "Offer not found" }, { status: 404 });
  }

  // Record the click before redirecting. Awaiting keeps tracking lossless
  // (and is negligible — a single indexed update); a tracking failure must
  // never block the user, so it is caught and ignored.
  try {
    await prisma.offer.update({
      where: { id: offer.id },
      data: { clickCount: { increment: 1 }, lastClickedAt: new Date() },
    });
  } catch {
    // ignore — redirect anyway
  }

  // Feed deeplinks (e.g. Awin aw_deep_link) are already affiliate-tracked —
  // use them as-is. Otherwise wrap with our configured affiliate identifier.
  const destination = offer.isAffiliateUrl
    ? offer.url
    : buildAffiliateUrl(offer.merchant, offer.url);
  return Response.redirect(destination, 302);
}
