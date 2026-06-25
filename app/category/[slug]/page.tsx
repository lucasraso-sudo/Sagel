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
  const [minScore, setMinScore] = useState("");

  const fetchProducts = useCallback(async () => {
    if (!category) return;
    setLoading(true);

    const params = new URLSearchParams({ category, sort });
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minScore) params.set("minScore", minScore);

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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Catégorie introuvable.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <SearchBar />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {CATEGORY_LABELS[category]}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="score">Meilleur score</option>
          <option value="price">Prix croissant</option>
          <option value="name">Alphabétique</option>
        </select>

        <input
          type="number"
          placeholder="Prix max (€)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-36 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <input
          type="number"
          placeholder="Score min (/20)"
          value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
          min="0"
          max="20"
          step="0.5"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {(maxPrice || minScore) && (
          <button
            onClick={() => { setMaxPrice(""); setMinScore(""); }}
            className="text-sm text-gray-400 hover:text-gray-700 underline"
          >
            Effacer filtres
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          Aucun produit trouvé.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
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
