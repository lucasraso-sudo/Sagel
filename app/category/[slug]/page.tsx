"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ProductCard } from "@/app/components/ProductCard";
import { CompareBar } from "@/app/components/CompareBar";
import { SearchBar } from "@/app/components/SearchBar";
import type { Product } from "@/app/types";
import { CATEGORY_SLUGS, CATEGORY_LABELS } from "@/app/types";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = CATEGORY_SLUGS[slug];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState<string[]>([]);

  // Filters
  const [sort, setSort] = useState("score");
  const [maxPrice, setMaxPrice] = useState("");
  const [minScore, setMinScore] = useState(""); // /100 in the UI

  const fetchProducts = useCallback(async () => {
    if (!category) return;
    setLoading(true);

    const params = new URLSearchParams({ category, sort });
    if (maxPrice) params.set("maxPrice", maxPrice);
    // UI is /100, the API filters on the stored /20 score.
    if (minScore) params.set("minScore", String(Number(minScore) / 5));

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }, [category, sort, maxPrice, minScore]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function toggleCompare(id: string, checked: boolean) {
    if (checked && comparing.length < 3) {
      setComparing((prev) => [...prev, id]);
    } else {
      setComparing((prev) => prev.filter((i) => i !== id));
    }
  }

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center text-muted">
        Catégorie introuvable.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8 max-w-xl">
        <SearchBar />
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 mb-7">
        <h1 className="font-serif text-2xl font-bold text-ink flex-1">
          {CATEGORY_LABELS[category]}
        </h1>
        {!loading && (
          <span className="text-[0.78rem] text-muted">
            {products.length} produit{products.length > 1 ? "s" : ""} analysé
            {products.length > 1 ? "s" : ""}
          </span>
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border-[1.5px] border-line rounded-lg px-3 py-1.5 text-[0.82rem] bg-white text-ink cursor-pointer outline-none focus:border-brand"
        >
          <option value="score">Score Sagel ↓</option>
          <option value="price">Prix croissant</option>
          <option value="name">Alphabétique</option>
        </select>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        <input
          type="number"
          placeholder="Prix max (€)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border-[1.5px] border-line rounded-full px-4 py-2 text-[0.82rem] w-36 bg-white outline-none focus:border-brand"
        />
        <input
          type="number"
          placeholder="Score min (/100)"
          value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
          min="0"
          max="100"
          step="5"
          className="border-[1.5px] border-line rounded-full px-4 py-2 text-[0.82rem] w-40 bg-white outline-none focus:border-brand"
        />
        {(maxPrice || minScore) && (
          <button
            onClick={() => {
              setMaxPrice("");
              setMinScore("");
            }}
            className="text-[0.82rem] text-muted hover:text-ink underline"
          >
            Effacer filtres
          </button>
        )}
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
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted">Aucun produit trouvé.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              rank={sort === "score" ? i + 1 : undefined}
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
