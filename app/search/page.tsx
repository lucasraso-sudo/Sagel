"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ScoreRing } from "@/app/components/ScoreBadge";
import { SearchBar } from "@/app/components/SearchBar";
import type { Product, Explanation } from "@/app/types";
import { CATEGORY_LABELS, modelName } from "@/app/types";
import { PRICES_LIVE } from "@/app/config";

interface SearchResult {
  product: Product;
  score: number;
  matchedCriteria: string[];
  relevanceBoost: number;
  explanation: Explanation | null;
}

const CRITERIA_LABELS: Record<string, string> = {
  low_noise: "Silencieux",
  bedroom: "Pour chambre",
  office: "Pour bureau",
  living_room: "Pour salon",
  high_power: "Puissant",
  low_price: "Bon prix",
  high_price: "Haut de gamme",
  portable: "Compact",
};

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setSearched(false);

    fetch(`/api/recommend?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results ?? []);
        setSearched(true);
      })
      .catch(() => setSearched(true))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div className="space-y-3">
        <SearchBar initialQuery={query} />
        {query && (
          <p className="text-sm text-muted">
            Résultats pour :{" "}
            <span className="font-semibold text-ink">&ldquo;{query}&rdquo;</span>
          </p>
        )}
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-40 animate-pulse border border-line"
            />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="text-4xl">🔍</div>
          <p className="text-muted">Aucun produit trouvé pour cette recherche.</p>
          <p className="text-sm text-muted">
            Essayez &ldquo;ventilateur&rdquo; ou &ldquo;climatiseur&rdquo;.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-ink text-xl">
            Top {results.length} recommandation{results.length > 1 ? "s" : ""}
          </h2>

          {results.map(({ product, explanation, matchedCriteria }, index) => {
            const score = product.productScore;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-line p-5 flex flex-col sm:flex-row gap-5"
              >
                {/* Rank + ring */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-shrink-0">
                  <span className="w-7 h-7 bg-cream text-brand text-sm font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  {score && <ScoreRing score={score.finalScore} size="md" />}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[0.72rem] text-muted uppercase tracking-[0.08em] font-semibold">
                        {product.brand} · {CATEGORY_LABELS[product.category]}
                      </p>
                      <h3 className="font-serif font-semibold text-ink text-lg mt-0.5">
                        {modelName(product.brand, product.name)}
                      </h3>
                    </div>
                    {product.price && (
                      <p className="font-bold text-lg text-ink flex-shrink-0">
                        {PRICES_LIVE ? "" : "≈ "}
                        {product.price.toLocaleString("fr-FR")} €
                      </p>
                    )}
                  </div>

                  {matchedCriteria.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {matchedCriteria.map((c) => (
                        <span
                          key={c}
                          className="text-[0.72rem] bg-brand/8 text-brand px-2.5 py-0.5 rounded-full font-medium"
                        >
                          {CRITERIA_LABELS[c] ?? c}
                        </span>
                      ))}
                    </div>
                  )}

                  {explanation && (
                    <p className="text-sm text-muted leading-relaxed">
                      {explanation.summary}
                    </p>
                  )}

                  {explanation?.pros && explanation.pros.length > 0 && (
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {explanation.pros.slice(0, 3).map((pro) => (
                        <li
                          key={pro}
                          className="text-[0.72rem] text-muted flex items-center gap-1"
                        >
                          <span className="text-brand">✓</span> {pro}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href={`/product/${product.id}`}
                    className="inline-block mt-1 text-sm font-semibold text-brand hover:text-brand-light"
                  >
                    Voir le produit →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-6 py-8 animate-pulse space-y-4">
          <div className="h-12 bg-white rounded-full border border-line" />
          <div className="h-40 bg-white rounded-2xl border border-line" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
