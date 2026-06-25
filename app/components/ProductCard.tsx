"use client";

import Link from "next/link";
import { ScoreBadge } from "./ScoreBadge";
import type { Product } from "@/app/types";
import { CATEGORY_LABELS } from "@/app/types";

interface ProductCardProps {
  product: Product;
  onCompareToggle?: (id: string, checked: boolean) => void;
  isComparing?: boolean;
}

export function ProductCard({ product, onCompareToggle, isComparing }: ProductCardProps) {
  const score = product.productScore;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4 flex flex-col gap-3">
      {/* Category chip */}
      <div className="flex items-start justify-between">
        <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full">
          {CATEGORY_LABELS[product.category]}
        </span>
        {score && <ScoreBadge score={score.finalScore} size="sm" />}
      </div>

      {/* Image placeholder */}
      <div className="h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-4xl select-none">
        {product.category === "FAN" ? "🌀" : product.category === "AIR_COOLER" ? "💧" : "❄️"}
      </div>

      {/* Info */}
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {product.brand}
        </p>
        <h3 className="font-semibold text-gray-800 text-sm leading-snug mt-0.5">
          {product.name}
        </h3>
        {product.price && (
          <p className="text-base font-bold text-gray-900 mt-1">
            {product.price.toLocaleString("fr-FR")} €
          </p>
        )}
      </div>

      {/* Confidence */}
      {score && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div
            className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-blue-400 rounded-full"
              style={{ width: `${score.confidenceScore}%` }}
            />
          </div>
          <span>{score.confidenceScore}% fiabilité</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Link
          href={`/product/${product.id}`}
          className="flex-1 text-center text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Voir le détail
        </Link>
        {onCompareToggle && (
          <button
            onClick={() => onCompareToggle(product.id, !isComparing)}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              isComparing
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {isComparing ? "✓" : "Comparer"}
          </button>
        )}
      </div>
    </div>
  );
}
