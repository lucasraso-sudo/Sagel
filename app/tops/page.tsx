"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/app/components/ProductCard";
import { CompareBar } from "@/app/components/CompareBar";
import type { Product, Category } from "@/app/types";
import { CATEGORY_LABELS } from "@/app/types";

const FILTERS: { label: string; value: Category | "all"; emoji: string }[] = [
  { label: "Tout", value: "all", emoji: "🏆" },
  { label: CATEGORY_LABELS.FAN, value: "FAN", emoji: "🌀" },
  { label: CATEGORY_LABELS.AIR_COOLER, value: "AIR_COOLER", emoji: "💧" },
  { label: CATEGORY_LABELS.MOBILE_AC, value: "MOBILE_AC", emoji: "❄️" },
];

export default function TopsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [comparing, setComparing] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/products?sort=score")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  function toggleCompare(id: string, checked: boolean) {
    if (checked && comparing.length < 3) {
      setComparing((prev) => [...prev, id]);
    } else {
      setComparing((prev) => prev.filter((i) => i !== id));
    }
  }

  const visible =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-block bg-gold text-ink text-[0.72rem] font-semibold uppercase tracking-[0.08em] px-3.5 py-1.5 rounded-full mb-4">
          🏆 Classement Sagel
        </span>
        <h1 className="font-serif text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-ink leading-tight">
          Les meilleurs produits, <em className="not-italic text-brand">notés sans biais</em>
        </h1>
        <p className="text-muted mt-3 leading-relaxed">
          Notre top établi à partir des avis réels, des tests experts et des
          performances techniques. Mis à jour en continu.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-9">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-[0.82rem] font-medium border-[1.5px] transition-colors ${
                active
                  ? "border-brand text-brand bg-brand/6"
                  : "border-line text-muted bg-white hover:border-brand hover:text-brand"
              }`}
            >
              <span className="mr-1">{f.emoji}</span>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-line h-80 animate-pulse"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-muted">Aucun produit.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              rank={i + 1}
              onCompareToggle={toggleCompare}
              isComparing={comparing.includes(p.id)}
            />
          ))}
        </div>
      )}

      <CompareBar selectedIds={comparing} onClear={() => setComparing([])} />
    </div>
  );
}
