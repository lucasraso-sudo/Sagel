"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ScoreBadge, ScoreBar } from "@/app/components/ScoreBadge";
import type { Product, Explanation } from "@/app/types";
import { CATEGORY_LABELS, CATEGORY_SLUGS_REVERSE } from "@/app/types";

interface ProductDetailData {
  product: Product;
  explanation: Explanation | null;
}

const SPEC_LABELS: Record<string, string> = {
  noise_level: "Niveau sonore",
  airflow: "Débit d'air",
  power: "Consommation",
  cooling_power: "Puissance de refroidissement",
  tank_size: "Capacité réservoir",
  energy_rating: "Efficacité énergétique",
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/product/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-1/2" />
        <div className="h-40 bg-gray-100 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Produit introuvable.{" "}
        <Link href="/" className="text-blue-600 underline">Retour</Link>
      </div>
    );
  }

  const { product, explanation } = data;
  const score = product.productScore;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-600">Accueil</Link>
        <span>/</span>
        <Link
          href={`/category/${CATEGORY_SLUGS_REVERSE[product.category]}`}
          className="hover:text-blue-600"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start">
        {/* Placeholder image */}
        <div className="w-full sm:w-40 h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-6xl flex-shrink-0">
          {product.category === "FAN" ? "🌀" : product.category === "AIR_COOLER" ? "💧" : "❄️"}
        </div>

        <div className="flex-1">
          <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">
            {product.brand}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5 leading-snug">
            {product.name}
          </h1>
          {product.price && (
            <p className="text-3xl font-extrabold text-gray-900 mt-2">
              {product.price.toLocaleString("fr-FR")} €
            </p>
          )}
          {product.description && (
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {score && (
          <div className="flex-shrink-0 text-center">
            <ScoreBadge score={score.finalScore} size="lg" showLabel />
            <p className="text-xs text-gray-400 mt-2">Score global</p>
          </div>
        )}
      </div>

      {/* Score breakdown */}
      {score && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-800 text-lg">Détail du score</h2>
          <ScoreBar label="Avis utilisateurs" score={score.userScore} weight={0.55} />
          <ScoreBar label="Score expert" score={score.expertScore} weight={0.20} />
          <ScoreBar label="Score technique" score={score.technicalScore} weight={0.25} />

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Fiabilité du score</span>
              <span className="font-semibold text-gray-700">{score.confidenceScore}%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${score.confidenceScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Basé sur le volume d'avis, le nombre de sources et la complétude des données
            </p>
          </div>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-800 text-lg">Analyse</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{explanation.summary}</p>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            {explanation.pros.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-emerald-700 mb-2">Points forts</h3>
                <ul className="space-y-1">
                  {explanation.pros.map((pro) => (
                    <li key={pro} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {explanation.cons.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-2">Points faibles</h3>
                <ul className="space-y-1">
                  {explanation.cons.map((con) => (
                    <li key={con} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">✗</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Specs */}
      {product.specifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">Caractéristiques techniques</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {product.specifications.map((spec) => (
              <div
                key={spec.key}
                className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm text-gray-500">
                  {SPEC_LABELS[spec.key] ?? spec.key.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {spec.value} {spec.unit ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {product.reviewAggregates && product.reviewAggregates.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">Avis par plateforme</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {product.reviewAggregates.map((r) => (
              <div
                key={r.source.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-700">{r.source.name}</p>
                  <p className="text-xs text-gray-400">
                    {r.reviewCount.toLocaleString("fr-FR")} avis
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    {r.rating.toFixed(1)}
                    <span className="text-sm text-gray-400">/5</span>
                  </p>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${i < Math.round(r.rating) ? "text-amber-400" : "text-gray-200"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="pb-8">
        <Link
          href={`/category/${CATEGORY_SLUGS_REVERSE[product.category]}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour aux {CATEGORY_LABELS[product.category]}
        </Link>
      </div>
    </div>
  );
}
