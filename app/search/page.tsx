"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ScoreBadge } from "@/app/components/ScoreBadge";
import { SearchBar } from "@/app/components/SearchBar";
import type { Product, Explanation } from "@/app/types";
import { CATEGORY_LABELS } from "@/app/types";

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-3">
        <SearchBar initialQuery={query} />
        {query && (
          <p className="text-sm text-gray-500">
            Résultats pour : <span className="font-semibold text-gray-700">&ldquo;{query}&rdquo;</span>
          </p>
        )}
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="text-4xl">🔍</div>
          <p className="text-gray-500">Aucun produit trouvé pour cette recherche.</p>
          <p className="text-sm text-gray-400">Essayez &ldquo;ventilateur&rdquo; ou &ldquo;climatiseur&rdquo;.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800 text-lg">
            Top {results.length} recommandation{results.length > 1 ? "s" : ""}
          </h2>

          {results.map(({ product, explanation, matchedCriteria }, index) => {
            const score = product.productScore;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-5"
              >
                {/* Rank */}
                <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 flex-shrink-0">
                  <span className="w-7 h-7 bg-blue-50 text-blue-600 text-sm font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  {score && <ScoreBadge score={score.finalScore} size="md" showLabel />}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                        {product.brand} · {CATEGORY_LABELS[product.category]}
                      </p>
                      <h3 className="font-bold text-gray-900 text-base mt-0.5">
                        {product.name}
                      </h3>
                    </div>
                    {product.price && (
                      <p className="font-bold text-lg text-gray-800 flex-shrink-0">
                        {product.price.toLocaleString("fr-FR")} €
                      </p>
                    )}
                  </div>

                  {/* Matched criteria chips */}
                  {matchedCriteria.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {matchedCriteria.map((c) => (
                        <span
                          key={c}
                          className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium"
                        >
                          {CRITERIA_LABELS[c] ?? c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Explanation */}
                  {explanation && (
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {explanation.summary}
                    </p>
                  )}

                  {/* Pros inline */}
                  {explanation?.pros && explanation.pros.length > 0 && (
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {explanation.pros.slice(0, 3).map((pro) => (
                        <li key={pro} className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="text-emerald-500">✓</span> {pro}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href={`/product/${product.id}`}
                    className="inline-block mt-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
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
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-12 bg-gray-100 rounded-xl" />
      <div className="h-40 bg-gray-100 rounded-2xl" />
    </div>}>
      <SearchResults />
    </Suspense>
  );
}
