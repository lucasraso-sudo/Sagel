"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ScoreRing, ScoreBar, to100 } from "@/app/components/ScoreBadge";
import { EnergyBadge } from "@/app/components/EnergyBadge";
import type { Product, Explanation } from "@/app/types";
import { modelName } from "@/app/types";
import { CATEGORY_EMOJI, SPEC_LABELS } from "@/app/constants";
import { PRICES_LIVE } from "@/app/config";

interface CompareItem {
  product: Product;
  explanation: Explanation | null;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.getAll("id");

  const [items, setItems] = useState<CompareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    const params = ids.map((id) => `id=${id}`).join("&");
    fetch(`/api/compare?${params}`)
      .then((r) => r.json())
      .then((data) => setItems(data.products ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  if (ids.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center text-muted">
        Sélectionnez 2 ou 3 produits depuis une page catégorie pour les comparer.{" "}
        <Link href="/" className="text-brand underline">
          Accueil
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 animate-pulse">
        <div className="h-8 bg-white rounded w-48 mb-6 border border-line" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 bg-white rounded-2xl border border-line" />
          ))}
        </div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center text-muted">
        Erreur lors de la comparaison.
      </div>
    );
  }

  const allSpecKeys = Array.from(
    new Set(items.flatMap((i) => i.product.specifications.map((s) => s.key)))
  );

  const best = (scores: (number | null | undefined)[]): number => {
    const valid = scores.filter((s): s is number => s !== null && s !== undefined);
    return Math.max(...valid);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <h1 className="font-serif text-2xl font-bold text-ink">
        Comparaison produits
      </h1>

      {/* Score overview */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        {items.map(({ product, explanation }) => {
          const score = product.productScore;
          const bestFinal = best(items.map((i) => i.product.productScore?.finalScore));
          const isBest = score?.finalScore === bestFinal;

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl p-5 space-y-3 ${
                isBest ? "border-2 border-gold" : "border border-line"
              }`}
            >
              {isBest && (
                <span className="text-[0.72rem] bg-gold text-ink font-semibold px-2.5 py-0.5 rounded-full">
                  🥇 Meilleur score
                </span>
              )}
              <div className="text-center">
                <div className="w-16 h-16 bg-cream rounded-xl flex items-center justify-center text-4xl mx-auto mb-2">
                  {CATEGORY_EMOJI[product.category] ?? "📦"}
                </div>
                <p className="text-[0.72rem] text-muted uppercase tracking-[0.08em]">
                  {product.brand}
                </p>
                <h2 className="font-serif font-semibold text-ink text-sm leading-snug mt-0.5">
                  {modelName(product.brand, product.name)}
                </h2>
                {product.price && (
                  <p className="text-lg font-bold text-ink mt-1">
                    {PRICES_LIVE ? "" : "≈ "}
                    {product.price.toLocaleString("fr-FR")} €
                  </p>
                )}
              </div>

              {score && (
                <div className="flex justify-center">
                  <ScoreRing score={score.finalScore} size="md" />
                </div>
              )}

              {explanation && (
                <p className="text-[0.72rem] text-muted text-center leading-relaxed">
                  {explanation.summary}
                </p>
              )}

              <Link
                href={`/product/${product.id}`}
                className="block text-center text-sm text-brand font-medium hover:underline"
              >
                Voir le détail
              </Link>
            </div>
          );
        })}
      </div>

      {/* Score breakdown table */}
      <div className="bg-white rounded-2xl border border-line p-6 overflow-x-auto">
        <h2 className="font-serif font-bold text-ink mb-4">Scores détaillés</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left text-muted font-medium py-2 pr-4 w-40">
                Critère
              </th>
              {items.map(({ product }) => (
                <th
                  key={product.id}
                  className="text-center text-ink font-semibold py-2 px-2"
                >
                  {product.brand}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[
              { key: "finalScore", label: "Score final" },
              { key: "userScore", label: "Avis utilisateurs" },
              { key: "expertScore", label: "Tests experts" },
              { key: "technicalScore", label: "Score technique" },
              { key: "confidenceScore", label: "Fiabilité (%)" },
            ].map(({ key, label }) => {
              const values = items.map((i) => {
                const s = i.product.productScore;
                return s ? (s as unknown as Record<string, number>)[key] : null;
              });
              const bestVal = best(values);

              return (
                <tr key={key}>
                  <td className="py-2 pr-4 text-muted">{label}</td>
                  {values.map((val, i) => (
                    <td
                      key={i}
                      className={`text-center py-2 font-semibold ${
                        val === bestVal ? "text-brand" : "text-ink"
                      }`}
                    >
                      {val !== null && val !== undefined
                        ? key === "confidenceScore"
                          ? `${Math.round(val)}%`
                          : `${to100(val)}/100`
                        : "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Specs table */}
      {allSpecKeys.length > 0 && (
        <div className="bg-white rounded-2xl border border-line p-6 overflow-x-auto">
          <h2 className="font-serif font-bold text-ink mb-4">
            Caractéristiques techniques
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left text-muted font-medium py-2 pr-4 w-40">
                  Spec
                </th>
                {items.map(({ product }) => (
                  <th
                    key={product.id}
                    className="text-center text-ink font-semibold py-2 px-2"
                  >
                    {product.brand}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {allSpecKeys.map((key) => (
                <tr key={key}>
                  <td className="py-2 pr-4 text-muted">
                    {SPEC_LABELS[key] ?? key.replace(/_/g, " ")}
                  </td>
                  {items.map(({ product }) => {
                    const spec = product.specifications.find((s) => s.key === key);
                    return (
                      <td
                        key={product.id}
                        className="text-center py-2 font-medium text-ink"
                      >
                        {spec ? (
                          key === "energy_class" ? (
                            <EnergyBadge value={spec.value} />
                          ) : (
                            `${spec.value} ${spec.unit ?? ""}`.trim()
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Score bars side by side */}
      <div className="bg-white rounded-2xl border border-line p-6">
        <h2 className="font-serif font-bold text-ink mb-6">Comparaison visuelle</h2>
        <div className="space-y-6">
          {items.map(({ product }) => {
            const score = product.productScore;
            if (!score) return null;
            return (
              <div key={product.id} className="space-y-2">
                <p className="text-sm font-semibold text-ink">
                  {product.brand} — {modelName(product.brand, product.name)}
                </p>
                <ScoreBar label="Score final" score={score.finalScore} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-8 bg-white rounded w-48 mb-6 border border-line" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-80 bg-white rounded-2xl border border-line" />
            ))}
          </div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
