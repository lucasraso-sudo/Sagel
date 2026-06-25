"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ScoreBadge, ScoreBar } from "@/app/components/ScoreBadge";
import type { Product, Explanation } from "@/app/types";

interface CompareItem {
  product: Product;
  explanation: Explanation | null;
}

const SPEC_LABELS: Record<string, string> = {
  noise_level: "Niveau sonore",
  airflow: "Débit d'air",
  power: "Consommation",
  cooling_power: "Puissance froid",
  tank_size: "Capacité réservoir",
  energy_rating: "Efficacité énergétique",
};

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.getAll("id");

  const [items, setItems] = useState<CompareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ids.length < 2) { setLoading(false); return; }
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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Sélectionnez 2 ou 3 produits depuis une page catégorie pour les comparer.{" "}
        <Link href="/" className="text-blue-600 underline">Accueil</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48 mb-6" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-80 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Erreur lors de la comparaison.
      </div>
    );
  }

  // Gather all spec keys present across products
  const allSpecKeys = Array.from(
    new Set(items.flatMap((i) => i.product.specifications.map((s) => s.key)))
  );

  const best = (scores: (number | null | undefined)[]): number => {
    const valid = scores.filter((s): s is number => s !== null && s !== undefined);
    return Math.max(...valid);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Comparaison produits</h1>

      {/* Score overview */}
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map(({ product, explanation }) => {
          const score = product.productScore;
          const bestFinal = best(items.map((i) => i.product.productScore?.finalScore));

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 space-y-3 ${
                score?.finalScore === bestFinal
                  ? "border-blue-300 ring-2 ring-blue-100"
                  : "border-gray-100"
              }`}
            >
              {score?.finalScore === bestFinal && (
                <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                  Meilleur score
                </span>
              )}
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-4xl mx-auto mb-2">
                  {product.category === "FAN" ? "🌀" : product.category === "AIR_COOLER" ? "💧" : "❄️"}
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{product.brand}</p>
                <h2 className="font-bold text-gray-800 text-sm leading-snug mt-0.5">
                  {product.name}
                </h2>
                {product.price && (
                  <p className="text-lg font-extrabold text-gray-900 mt-1">
                    {product.price.toLocaleString("fr-FR")} €
                  </p>
                )}
              </div>

              {score && (
                <div className="flex justify-center">
                  <ScoreBadge score={score.finalScore} size="md" showLabel />
                </div>
              )}

              {explanation && (
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  {explanation.summary}
                </p>
              )}

              <Link
                href={`/product/${product.id}`}
                className="block text-center text-sm text-blue-600 font-medium hover:underline"
              >
                Voir le détail
              </Link>
            </div>
          );
        })}
      </div>

      {/* Score breakdown table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-x-auto">
        <h2 className="font-bold text-gray-800 mb-4">Scores détaillés</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-gray-400 font-medium py-2 pr-4 w-40">Critère</th>
              {items.map(({ product }) => (
                <th key={product.id} className="text-center text-gray-600 font-semibold py-2 px-2">
                  {product.brand}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { key: "finalScore", label: "Score final" },
              { key: "userScore", label: "Avis utilisateurs" },
              { key: "expertScore", label: "Score expert" },
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
                  <td className="py-2 pr-4 text-gray-500">{label}</td>
                  {values.map((val, i) => (
                    <td
                      key={i}
                      className={`text-center py-2 font-semibold ${
                        val === bestVal ? "text-emerald-600" : "text-gray-700"
                      }`}
                    >
                      {val !== null && val !== undefined
                        ? key === "confidenceScore"
                          ? `${Math.round(val)}%`
                          : `${val.toFixed(1)}/20`
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-x-auto">
          <h2 className="font-bold text-gray-800 mb-4">Caractéristiques techniques</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-400 font-medium py-2 pr-4 w-40">Spec</th>
                {items.map(({ product }) => (
                  <th key={product.id} className="text-center text-gray-600 font-semibold py-2 px-2">
                    {product.brand}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allSpecKeys.map((key) => (
                <tr key={key}>
                  <td className="py-2 pr-4 text-gray-500">
                    {SPEC_LABELS[key] ?? key.replace(/_/g, " ")}
                  </td>
                  {items.map(({ product }) => {
                    const spec = product.specifications.find((s) => s.key === key);
                    return (
                      <td key={product.id} className="text-center py-2 font-medium text-gray-700">
                        {spec ? `${spec.value} ${spec.unit ?? ""}`.trim() : "—"}
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-6">Comparaison visuelle</h2>
        <div className="space-y-6">
          {items.map(({ product }) => {
            const score = product.productScore;
            if (!score) return null;
            return (
              <div key={product.id} className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  {product.brand} — {product.name}
                </p>
                <ScoreBar label="Score final" score={score.finalScore} weight={1} />
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
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48 mb-6" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-80 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
