"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ScoreRing, ScoreBar } from "@/app/components/ScoreBadge";
import { InfoTooltip } from "@/app/components/InfoTooltip";
import { EnergyBadge } from "@/app/components/EnergyBadge";
import type { Product, Explanation } from "@/app/types";
import { CATEGORY_LABELS, CATEGORY_SLUGS_REVERSE, modelName } from "@/app/types";
import { PRICES_LIVE } from "@/app/config";
import { CATEGORY_EMOJI, MERCHANT_EMOJI, SPEC_LABELS } from "@/app/constants";

interface ProductDetailData {
  product: Product;
  explanation: Explanation | null;
}

// Short definition + a "is high or low better?" reading hint, per spec.
const SPEC_INFO: Record<string, { def: string; hint: string }> = {
  noise_level: {
    def: "Le bruit émis par l'appareil, en décibels (dB).",
    hint: "Plus le chiffre est bas, plus c'est silencieux. ~25 dB = très discret (idéal la nuit), > 50 dB = bruyant.",
  },
  airflow: {
    def: "Le volume d'air brassé par l'appareil, en m³/h.",
    hint: "Plus le chiffre est élevé, plus il peut rafraîchir une grande pièce.",
  },
  power: {
    def: "La puissance électrique consommée, en watts (W).",
    hint: "Plus le chiffre est bas, moins l'appareil consomme : plus économique.",
  },
  cooling_power: {
    def: "La capacité de refroidissement, en BTU.",
    hint: "Plus le chiffre est élevé, plus l'appareil refroidit efficacement. Repère : ~7000–9000 BTU jusqu'à 25 m², 12000+ pour 30–45 m².",
  },
  tank_size: {
    def: "Le volume du réservoir d'eau, en litres (L).",
    hint: "Plus le chiffre est élevé, plus l'autonomie est longue avant de devoir remplir.",
  },
  energy_rating: {
    def: "L'efficacité énergétique de l'appareil, notée sur 5 (★).",
    hint: "Plus la note est élevée, moins l'appareil est énergivore. 5/5 = très économe ; 1–2/5 = gourmand en électricité (facture plus élevée).",
  },
  cadr: {
    def: "Le CADR (débit d'air pur) : volume d'air filtré par heure, en m³/h.",
    hint: "Plus le chiffre est élevé, plus l'air est purifié vite et sur une grande pièce. ~150 m³/h suffisent pour une chambre de 20 m².",
  },
  coverage_area: {
    def: "La surface maximale conseillée pour l'appareil, en m².",
    hint: "Plus le chiffre est élevé, plus il couvre une grande pièce. Choisissez ≥ à la surface de votre pièce.",
  },
  extraction: {
    def: "La quantité d'eau retirée de l'air, en litres par jour.",
    hint: "Plus le chiffre est élevé, plus il assèche vite et de grandes surfaces. ~10 L/j pour 20 m², 20 L/j pour 40–60 m².",
  },
  heating_power: {
    def: "La puissance de chauffe, en watts (W).",
    hint: "Plus le chiffre est élevé, plus il chauffe vite (comptez ~100 W par m² pour un chauffage). À l'usage, plus de puissance = plus de consommation.",
  },
  savings: {
    def: "Les économies de chauffage estimées grâce à l'appareil, en %.",
    hint: "Plus le chiffre est élevé, plus il réduit votre facture. Les meilleurs thermostats connectés annoncent ~25 à 37 %.",
  },
  capacity: {
    def: "La quantité de linge sec lavée en un cycle, en kg.",
    hint: "Plus le chiffre est élevé, plus vous lavez en une fois. ~7 kg pour 1–2 pers., 9 kg+ pour une famille.",
  },
  spin_speed: {
    def: "La vitesse d'essorage maximale, en tours/minute.",
    hint: "Plus le chiffre est élevé, plus le linge sort sec (et sèche vite). 1200–1400 tr/min est un bon repère.",
  },
  place_settings: {
    def: "Le nombre de couverts lavés en un cycle.",
    hint: "Plus le chiffre est élevé, plus la capacité est grande. 13–14 couverts conviennent à une famille.",
  },
  water_use: {
    def: "La consommation d'eau par cycle, en litres.",
    hint: "Plus le chiffre est bas, plus l'appareil est économe en eau. Les meilleurs descendent sous 10 L.",
  },
  volume: {
    def: "Le volume de rangement utile, en litres.",
    hint: "Plus le chiffre est élevé, plus vous stockez. ~250 L pour 2 pers., 350 L+ pour une famille.",
  },
  consumption: {
    def: "La consommation électrique de l'appareil (par an ou par cycle selon le produit).",
    hint: "Plus le chiffre est bas, moins ça coûte à l'usage (facture d'électricité plus faible).",
  },
  energy_class: {
    def: "La classe énergétique officielle (étiquette énergie de l'Union européenne).",
    hint: "De A (le plus économe) à G (le plus énergivore) ; A/B = faible consommation. Certains appareils utilisent encore l'ancienne échelle A+++ à D.",
  },
  zones: {
    def: "Le nombre de foyers de cuisson de la plaque.",
    hint: "Plus le chiffre est élevé, plus vous cuisinez de plats en même temps. 4 foyers est le standard.",
  },
  max_power: {
    def: "La puissance de cuisson maximale cumulée, en watts.",
    hint: "Plus le chiffre est élevé, plus la chauffe est rapide et puissante (fonction booster).",
  },
  extraction_rate: {
    def: "Le débit d'air aspiré par la hotte, en m³/h.",
    hint: "Plus le chiffre est élevé, plus la hotte évacue vite les odeurs et la vapeur. Comptez ~10× le volume de la cuisine par heure.",
  },
  bottles: {
    def: "Le nombre de bouteilles que peut contenir la cave.",
    hint: "Plus le chiffre est élevé, plus la capacité de stockage est grande.",
  },
  pressure: {
    def: "La pression de la pompe, en bars.",
    hint: "Plus la pression est élevée, meilleure est l'extraction du café. 9 bars suffisent ; 15–19 bars sont courants.",
  },
  bowl_capacity: {
    def: "Le volume utile du bol (ou du panier), en litres.",
    hint: "Plus le chiffre est élevé, plus vous préparez de portions en une fois.",
  },
  slots: {
    def: "Le nombre de fentes du grille-pain.",
    hint: "Plus il y a de fentes, plus vous grillez de tranches à la fois. 2 fentes pour un couple, 4 pour une famille.",
  },
};

function formatUpdated(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return "mis à jour aujourd'hui";
  if (days === 1) return "mis à jour hier";
  return `mis à jour il y a ${days} j`;
}

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
      <div className="max-w-4xl mx-auto px-6 py-16 animate-pulse space-y-4">
        <div className="h-8 bg-white rounded w-1/2 border border-line" />
        <div className="h-40 bg-white rounded-2xl border border-line" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center text-muted">
        Produit introuvable.{" "}
        <Link href="/" className="text-brand underline">
          Retour
        </Link>
      </div>
    );
  }

  const { product, explanation } = data;
  const score = product.productScore;
  const emoji = CATEGORY_EMOJI[product.category] ?? "📦";

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted flex items-center gap-2">
        <Link href="/" className="hover:text-brand">
          Accueil
        </Link>
        <span>/</span>
        <Link
          href={`/category/${CATEGORY_SLUGS_REVERSE[product.category]}`}
          className="hover:text-brand"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span>/</span>
        <span className="text-ink truncate max-w-xs">
          {modelName(product.brand, product.name)}
        </span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-line p-6 flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-full sm:w-40 h-40 bg-cream rounded-xl flex items-center justify-center text-6xl flex-shrink-0">
          {emoji}
        </div>

        <div className="flex-1">
          <p className="text-[0.72rem] text-muted uppercase tracking-[0.08em] font-semibold">
            {product.brand}
          </p>
          <h1 className="font-serif text-[1.6rem] font-bold text-ink mt-0.5 leading-snug">
            {modelName(product.brand, product.name)}
          </h1>
          <p className="text-[0.72rem] text-muted mt-1 font-mono">
            Réf. {product.mpn}
            {product.ean ? ` · EAN ${product.ean}` : ""}
          </p>
          {product.price && (
            <p className="text-3xl font-bold text-ink mt-2">
              {PRICES_LIVE ? "" : "≈ "}
              {product.price.toLocaleString("fr-FR")} €
            </p>
          )}
          {product.description && (
            <p className="text-sm text-muted mt-3 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {score && (
          <div className="flex-shrink-0 text-center">
            <ScoreRing score={score.finalScore} size="lg" />
            <p className="text-[0.72rem] text-muted mt-2">Score Sagel</p>
          </div>
        )}
      </div>

      {/* Offers — where to buy */}
      {product.offers && product.offers.length > 0 && (
        <div className="bg-white rounded-2xl border border-line p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif font-bold text-ink text-lg">
              Où acheter
            </h2>
            <span className="text-[0.72rem] text-muted">
              {product.offers.filter((o) => o.inStock).length} marchand
              {product.offers.filter((o) => o.inStock).length > 1 ? "s" : ""}
              {PRICES_LIVE
                ? " · prix actualisés chaque jour"
                : " · prix indicatifs (démo)"}
            </span>
          </div>

          <div className="space-y-2.5">
            {product.offers.map((offer, i) => {
              const isBest = i === 0 && offer.inStock; // offers come sorted by price asc
              return (
                <div
                  key={offer.id}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border ${
                    isBest ? "border-brand bg-brand/5" : "border-line"
                  }`}
                >
                  <span className="text-2xl">
                    {MERCHANT_EMOJI[offer.merchant] ?? "🛒"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">
                        {offer.merchant}
                      </span>
                      {isBest && (
                        <span className="text-[0.62rem] font-semibold uppercase tracking-wide text-white bg-brand px-2 py-0.5 rounded-full">
                          Meilleur prix
                        </span>
                      )}
                    </div>
                    <p className="text-[0.72rem] text-muted">
                      {!offer.inStock
                        ? "Indisponible"
                        : PRICES_LIVE
                          ? formatUpdated(offer.lastUpdated)
                          : "Prix indicatif"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold leading-tight ${
                        offer.inStock ? "text-ink" : "text-muted line-through"
                      }`}
                    >
                      {PRICES_LIVE ? "" : "≈ "}
                      {offer.price.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                  {offer.inStock ? (
                    <a
                      href={`/api/go/${offer.id}`}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Voir l&apos;offre →
                    </a>
                  ) : (
                    <span className="bg-cream text-muted text-sm font-semibold px-4 py-2.5 rounded-lg whitespace-nowrap cursor-default">
                      Épuisé
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[0.7rem] text-muted mt-4 leading-relaxed">
            Liens partenaires — Sagel peut percevoir une commission si vous
            achetez via ces liens, sans surcoût pour vous. Cela n&apos;influence
            jamais les scores.{" "}
            {PRICES_LIVE
              ? "Prix TTC, mis à jour automatiquement."
              : "Prix indicatifs (démo) et liens de recherche, en attendant la connexion du flux marchand."}
          </p>
        </div>
      )}

      {/* Score breakdown */}
      {score && (
        <div className="bg-white rounded-2xl border border-line p-6 space-y-5">
          <h2 className="font-serif font-bold text-ink text-lg">
            Détail du score
          </h2>
          <ScoreBar label="Avis utilisateurs" score={score.userScore} weight={0.55} />
          <ScoreBar label="Tests experts" score={score.expertScore} weight={0.2} />
          <ScoreBar label="Score technique" score={score.technicalScore} weight={0.25} />

          <div className="pt-2 border-t border-line">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Fiabilité du score</span>
              <span className="font-semibold text-ink">
                {score.confidenceScore}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full"
                style={{ width: `${score.confidenceScore}%` }}
              />
            </div>
            <p className="text-[0.72rem] text-muted mt-1">
              Basé sur le volume d&apos;avis, le nombre de sources et la
              complétude des données.
            </p>
          </div>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div className="bg-white rounded-2xl border border-line p-6 space-y-4">
          <h2 className="font-serif font-bold text-ink text-lg">Analyse</h2>
          <p className="text-muted text-sm leading-relaxed">
            {explanation.summary}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            {explanation.pros.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-brand mb-2">
                  Points forts
                </h3>
                <ul className="space-y-1">
                  {explanation.pros.map((pro) => (
                    <li
                      key={pro}
                      className="text-sm text-muted flex items-start gap-2"
                    >
                      <span className="text-brand mt-0.5">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {explanation.cons.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-danger mb-2">
                  Points faibles
                </h3>
                <ul className="space-y-1">
                  {explanation.cons.map((con) => (
                    <li
                      key={con}
                      className="text-sm text-muted flex items-start gap-2"
                    >
                      <span className="text-danger mt-0.5">✗</span>
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
        <div className="bg-white rounded-2xl border border-line p-6">
          <h2 className="font-serif font-bold text-ink text-lg mb-4">
            Caractéristiques techniques
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {product.specifications.map((spec) => (
              <div
                key={spec.key}
                className="flex justify-between items-center py-2 border-b border-line last:border-0"
              >
                <span className="text-sm text-muted flex items-center">
                  {SPEC_LABELS[spec.key] ?? spec.key.replace(/_/g, " ")}
                  {SPEC_INFO[spec.key] && (
                    <InfoTooltip
                      title={SPEC_LABELS[spec.key] ?? spec.key.replace(/_/g, " ")}
                      def={SPEC_INFO[spec.key].def}
                      hint={SPEC_INFO[spec.key].hint}
                    />
                  )}
                </span>
                <span className="text-sm font-semibold text-ink">
                  {spec.key === "energy_class" ? (
                    <EnergyBadge value={spec.value} />
                  ) : spec.key === "energy_rating" ? (
                    `${spec.value}/5 ★`
                  ) : (
                    `${spec.value} ${spec.unit ?? ""}`
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {product.reviewAggregates && product.reviewAggregates.length > 0 && (
        <div className="bg-white rounded-2xl border border-line p-6">
          <h2 className="font-serif font-bold text-ink text-lg mb-4">
            Avis par plateforme
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {product.reviewAggregates.map((r) => (
              <div
                key={r.source.name}
                className="flex items-center justify-between p-3 bg-cream rounded-xl"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {r.source.name}
                  </p>
                  <p className="text-[0.72rem] text-muted">
                    {r.reviewCount.toLocaleString("fr-FR")} avis
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ink">
                    {r.rating.toFixed(1)}
                    <span className="text-sm text-muted">/5</span>
                  </p>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${
                          i < Math.round(r.rating) ? "text-gold" : "text-line"
                        }`}
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
          className="text-sm text-brand hover:underline"
        >
          ← Retour aux {CATEGORY_LABELS[product.category]}
        </Link>
      </div>
    </div>
  );
}
