"use client";

import { useState } from "react";
import Link from "next/link";
import { PRODUCT_FAMILIES, type CatalogItem } from "@/app/catalog";

function ItemTile({ item }: { item: CatalogItem }) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        className="group flex items-center gap-3 bg-white border border-line rounded-xl px-4 py-3.5 hover:border-brand hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all"
      >
        <span className="text-2xl">{item.emoji}</span>
        <span className="font-medium text-ink group-hover:text-brand transition-colors">
          {item.label}
        </span>
        <span className="ml-auto text-muted group-hover:text-brand transition-colors">
          →
        </span>
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-3 bg-cream border border-line rounded-xl px-4 py-3.5 cursor-default">
      <span className="text-2xl grayscale opacity-60">{item.emoji}</span>
      <span className="font-medium text-muted/80">{item.label}</span>
      <span className="ml-auto text-[0.6rem] font-semibold uppercase tracking-wide text-brand bg-brand/8 px-2 py-0.5 rounded-full">
        Bientôt
      </span>
    </div>
  );
}

export function CategoryExplorer() {
  const [active, setActive] = useState(0);
  const family = PRODUCT_FAMILIES[active];

  return (
    <div className="flex flex-col md:flex-row gap-5">
      {/* Lateral family menu */}
      <div className="md:w-64 flex-shrink-0">
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          {PRODUCT_FAMILIES.map((f, i) => {
            const isActive = i === active;
            return (
              <button
                key={f.title}
                onClick={() => setActive(i)}
                className={`flex items-center gap-3 text-left rounded-xl px-4 py-3 border-[1.5px] whitespace-nowrap md:whitespace-normal transition-colors flex-shrink-0 md:w-full ${
                  isActive
                    ? "border-brand bg-brand/6 text-ink"
                    : "border-transparent bg-white md:bg-transparent text-muted hover:text-ink hover:bg-white"
                }`}
              >
                <span className="text-xl">{f.emoji}</span>
                <span className="flex-1">
                  <span className="block text-[0.95rem] font-bold leading-tight">
                    {f.title}
                  </span>
                  <span className="block text-[0.7rem] text-muted">
                    {f.items.length} catégories
                    {f.soon ? " · bientôt" : ""}
                  </span>
                </span>
                <span
                  className={`hidden md:block transition-transform ${
                    isActive ? "text-brand" : "text-line"
                  }`}
                >
                  ›
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-categories of the active family */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-serif text-xl font-bold text-ink">
            {family.title}
          </h3>
          {family.soon && (
            <span className="text-[0.62rem] font-semibold uppercase tracking-wide text-brand bg-brand/8 px-2 py-0.5 rounded-full">
              Bientôt
            </span>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {family.items.map((item) => (
            <ItemTile key={item.label} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
