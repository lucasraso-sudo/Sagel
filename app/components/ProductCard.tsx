"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScoreRing, SubScoreRow } from "./ScoreBadge";
import type { Product } from "@/app/types";
import { bestPrice, modelName } from "@/app/types";
import { PRICES_LIVE } from "@/app/config";
import { CATEGORY_EMOJI } from "@/app/constants";

interface ProductCardProps {
  product: Product;
  rank?: number;
  onCompareToggle?: (id: string, checked: boolean) => void;
  isComparing?: boolean;
}

function rankBorder(rank?: number): string {
  if (rank === 1) return "border-2 border-gold";
  if (rank === 2) return "border-2 border-silver";
  if (rank === 3) return "border-2 border-bronze";
  return "border border-line";
}

function RankBadge({ rank }: { rank?: number }) {
  if (!rank) return null;
  const medal =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
  const bg =
    rank === 1
      ? "bg-gold text-ink"
      : rank === 2
        ? "bg-silver text-ink"
        : rank === 3
          ? "bg-bronze text-white"
          : "bg-line text-muted";
  return (
    <div
      className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-[0.75rem] font-bold ${bg}`}
    >
      {medal}
    </div>
  );
}

export function ProductCard({
  product,
  rank,
  onCompareToggle,
  isComparing,
}: ProductCardProps) {
  const router = useRouter();
  const score = product.productScore;
  const emoji = CATEGORY_EMOJI[product.category] ?? "📦";
  const bp = bestPrice(product);

  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      className={`group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-transform transition-shadow duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] ${rankBorder(
        rank
      )}`}
    >
      <RankBadge rank={rank} />

      {/* Image */}
      <div className="h-[140px] bg-cream flex items-center justify-center text-[3.5rem] select-none">
        {emoji}
      </div>

      <div className="p-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-muted">
          {product.brand}
        </p>
        <h3 className="font-serif text-[1.05rem] font-semibold text-ink leading-tight mt-0.5 mb-3">
          {modelName(product.brand, product.name)}
        </h3>

        {/* Score block */}
        {score && (
          <div className="flex items-center gap-4 p-3 bg-cream rounded-[10px] mb-3">
            <ScoreRing score={score.finalScore} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-[0.78rem] font-bold text-ink mb-1.5">
                Score Sagel
              </p>
              <div className="flex flex-col gap-1">
                <SubScoreRow name="Avis" score={score.userScore} />
                <SubScoreRow name="Experts" score={score.expertScore} />
                <SubScoreRow name="Technique" score={score.technicalScore} />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[0.68rem] text-muted">
              {bp && bp.count > 0 ? "À partir de" : "Prix constaté"}
            </p>
            {bp ? (
              <p className="text-[1.3rem] font-bold text-ink leading-tight">
                {PRICES_LIVE ? "" : "≈ "}
                {bp.price.toLocaleString("fr-FR")} €
              </p>
            ) : (
              <p className="text-[1.05rem] font-semibold text-muted leading-tight">
                —
              </p>
            )}
            {bp && bp.count > 0 ? (
              <p className="text-[0.68rem] font-semibold text-brand">
                {bp.count} offre{bp.count > 1 ? "s" : ""}
                {PRICES_LIVE ? " · maj quotidienne" : " · prix indicatifs"}
              </p>
            ) : (
              score && (
                <p className="text-[0.68rem] font-semibold text-brand">
                  Fiabilité {score.confidenceScore}%
                </p>
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            {onCompareToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCompareToggle(product.id, !isComparing);
                }}
                title="Comparer"
                className={`w-9 h-9 rounded-lg border-[1.5px] flex items-center justify-center text-sm transition-colors ${
                  isComparing
                    ? "border-brand text-brand bg-brand/5"
                    : "border-line text-muted bg-cream hover:border-gold"
                }`}
              >
                {isComparing ? "✓" : "⇄"}
              </button>
            )}
            <Link
              href={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-brand hover:bg-brand-light text-white text-[0.8rem] font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Voir →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
