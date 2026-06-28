"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/app/components/SearchBar";
import { ProductCard } from "@/app/components/ProductCard";
import type { Product } from "@/app/types";

interface SearchHit {
  product: Product;
  relevance: number;
  matchedFields: string[];
}

// "idle" (no query) is derived from the URL at render time, so the effect never
// needs a synchronous reset — it only toggles loading/done while fetching.
type State = { status: "loading" | "done"; hits: SearchHit[] };

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const hasQuery = query.trim().length > 0;

  const [state, setState] = useState<State>({ status: "loading", hits: [] });

  useEffect(() => {
    if (!hasQuery) return;

    let ignore = false;
    // Intentional loading flash before the async fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading", hits: [] });

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!ignore) setState({ status: "done", hits: data.results ?? [] });
      })
      .catch(() => {
        if (!ignore) setState({ status: "done", hits: [] });
      });

    return () => {
      ignore = true;
    };
  }, [query, hasQuery]);

  const status: "idle" | "loading" | "done" = !hasQuery ? "idle" : state.status;
  const { hits } = state;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="space-y-3">
        <SearchBar initialQuery={query} large />
        {query && status === "done" && (
          <p className="text-sm text-muted">
            {hits.length} résultat{hits.length > 1 ? "s" : ""} pour{" "}
            <span className="font-semibold text-ink">&ldquo;{query}&rdquo;</span>
          </p>
        )}
      </div>

      {status === "loading" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-72 animate-pulse border border-line"
            />
          ))}
        </div>
      )}

      {status === "done" && hits.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="text-4xl">🔍</div>
          <p className="text-muted">Aucun produit trouvé pour cette recherche.</p>
          <p className="text-sm text-muted">
            Essayez une marque (&ldquo;Dyson&rdquo;), un type de produit
            (&ldquo;ventilateur&rdquo;) ou une référence.
          </p>
        </div>
      )}

      {status === "idle" && (
        <div className="text-center py-16 space-y-3">
          <div className="text-4xl">🔎</div>
          <p className="text-muted">
            Recherchez par marque, modèle, référence ou type de produit.
          </p>
        </div>
      )}

      {status === "done" && hits.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hits.map((hit) => (
            <ProductCard key={hit.product.id} product={hit.product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-6 py-8 animate-pulse space-y-4">
          <div className="h-12 bg-white rounded-full border border-line" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 bg-white rounded-2xl border border-line"
              />
            ))}
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
