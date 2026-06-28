"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { modelName } from "@/app/types";
import { MERCHANT_EMOJI } from "@/app/constants";

interface MerchantStat {
  name: string;
  clicks: number;
  offers: number;
}
interface OfferStat {
  id: string;
  productId: string;
  product: string;
  brand: string;
  merchant: string;
  price: number;
  clicks: number;
  lastClickedAt: string | null;
}
interface ProductStat {
  id: string;
  name: string;
  brand: string;
  clicks: number;
}
interface Stats {
  totalClicks: number;
  totalOffers: number;
  activeMerchants: number;
  byMerchant: MerchantStat[];
  topOffers: OfferStat[];
  topProducts: ProductStat[];
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/clicks")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const maxMerchantClicks = stats
    ? Math.max(1, ...stats.byMerchant.map((m) => m.clicks))
    : 1;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <span className="inline-block bg-ink text-cream text-[0.7rem] font-semibold uppercase tracking-[0.08em] px-3 py-1 rounded-full mb-3">
          ⚙ Espace gestion
        </span>
        <h1 className="font-serif text-3xl font-bold text-ink">
          Tableau de bord — Clics &amp; affiliation
        </h1>
        <p className="text-muted mt-2 text-sm">
          Suivi des clics sortants vers les marchands (attribution de revenus).
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-line h-28 animate-pulse"
            />
          ))}
        </div>
      ) : !stats ? (
        <p className="text-muted">Impossible de charger les statistiques.</p>
      ) : (
        <div className="space-y-8">
          {/* Stat cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Clics sortants", value: stats.totalClicks, icon: "👆" },
              { label: "Offres suivies", value: stats.totalOffers, icon: "🏷️" },
              {
                label: "Marchands actifs",
                value: stats.activeMerchants,
                icon: "🛒",
              },
            ].map((c) => (
              <div
                key={c.label}
                className="bg-white rounded-2xl border border-line p-5"
              >
                <div className="text-2xl mb-2">{c.icon}</div>
                <div className="font-serif text-3xl font-bold text-ink">
                  {c.value.toLocaleString("fr-FR")}
                </div>
                <div className="text-sm text-muted mt-0.5">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Clicks by merchant */}
          <div className="bg-white rounded-2xl border border-line p-6">
            <h2 className="font-serif font-bold text-ink text-lg mb-4">
              Clics par marchand
            </h2>
            {stats.byMerchant.length === 0 ? (
              <p className="text-sm text-muted">Aucune donnée.</p>
            ) : (
              <div className="space-y-3">
                {stats.byMerchant.map((m) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className="w-28 flex-shrink-0 text-sm text-ink flex items-center gap-1.5">
                      <span>{MERCHANT_EMOJI[m.name] ?? "🛒"}</span>
                      {m.name}
                    </span>
                    <div className="flex-1 h-2.5 bg-cream rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-[width] duration-500"
                        style={{
                          width: `${(m.clicks / maxMerchantClicks) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-semibold text-ink">
                      {m.clicks}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top offers */}
          <div className="bg-white rounded-2xl border border-line p-6 overflow-x-auto">
            <h2 className="font-serif font-bold text-ink text-lg mb-4">
              Offres les plus cliquées
            </h2>
            {stats.topOffers.length === 0 ? (
              <div className="text-center py-8 text-muted text-sm">
                Aucun clic enregistré pour l&apos;instant. Cliquez sur « Voir
                l&apos;offre » depuis une fiche produit pour alimenter ce tableau.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="py-2 pr-4 font-medium text-muted">Produit</th>
                    <th className="py-2 px-2 font-medium text-muted">Marchand</th>
                    <th className="py-2 px-2 font-medium text-muted text-right">
                      Prix
                    </th>
                    <th className="py-2 px-2 font-medium text-muted text-right">
                      Clics
                    </th>
                    <th className="py-2 pl-2 font-medium text-muted text-right">
                      Dernier clic
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {stats.topOffers.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/product/${o.productId}`}
                          className="font-medium text-ink hover:text-brand"
                        >
                          {o.brand} — {modelName(o.brand, o.product)}
                        </Link>
                      </td>
                      <td className="py-2.5 px-2 text-ink">
                        {MERCHANT_EMOJI[o.merchant] ?? "🛒"} {o.merchant}
                      </td>
                      <td className="py-2.5 px-2 text-right text-ink">
                        {o.price.toLocaleString("fr-FR")} €
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-brand">
                        {o.clicks}
                      </td>
                      <td className="py-2.5 pl-2 text-right text-muted">
                        {fmtDate(o.lastClickedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
