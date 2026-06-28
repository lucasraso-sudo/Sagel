"use client";

import Link from "next/link";
import { useState } from "react";
import { PRODUCT_FAMILIES, type CatalogFamily } from "@/app/catalog";
import { Logo } from "./Logo";

const SIMPLE_LINKS = [
  { label: "Les tops", href: "/tops" },
];

function FamilyColumn({ family }: { family: CatalogFamily }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[0.95rem] font-bold text-ink">
          {family.title}
        </span>
        {family.soon && (
          <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-brand bg-brand/8 px-1.5 py-0.5 rounded-full">
            Bientôt
          </span>
        )}
      </div>
      <ul className="space-y-0.5">
        {family.items.map((item) =>
          item.href ? (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-lg text-sm text-ink hover:bg-cream transition-colors"
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            </li>
          ) : (
            <li
              key={item.label}
              className="flex items-center gap-2.5 px-2 py-1.5 -mx-2 text-sm text-muted/70 cursor-default"
            >
              <span className="text-base grayscale opacity-60">{item.emoji}</span>
              {item.label}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export function SiteHeader() {
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-line">
      <nav className="px-6 h-[60px] flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {/* Produits dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              className="flex items-center gap-1 text-[0.85rem] font-medium text-muted hover:text-ink transition-colors py-5"
              aria-expanded={productsOpen}
            >
              Produits
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transition-transform ${productsOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {productsOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1">
                <div className="w-[960px] max-w-[92vw] max-h-[78vh] overflow-y-auto bg-white border border-line rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-6 grid grid-cols-3 gap-x-7 gap-y-6">
                  {PRODUCT_FAMILIES.map((f) => (
                    <FamilyColumn key={f.title} family={f} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {SIMPLE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[0.85rem] font-medium text-muted hover:text-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}

          <Link
            href="/connexion"
            className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-brand border-[1.5px] border-brand hover:bg-brand hover:text-white px-4 py-2 rounded-full transition-colors"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
            </svg>
            Se connecter
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-ink"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-cream px-6 py-4 space-y-4">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted mb-2">
              Produits
            </p>
            <div className="grid grid-cols-1 gap-1">
              {PRODUCT_FAMILIES.flatMap((f) => f.items)
                .filter((i) => i.href)
                .map((i) => (
                  <Link
                    key={i.label}
                    href={i.href!}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 text-sm text-ink"
                  >
                    <span>{i.emoji}</span>
                    {i.label}
                  </Link>
                ))}
            </div>
          </div>
          {SIMPLE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-ink"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/connexion"
            onClick={() => setMobileOpen(false)}
            className="inline-block text-[0.85rem] font-semibold text-white bg-brand px-4 py-2 rounded-full"
          >
            Se connecter
          </Link>
        </div>
      )}
    </header>
  );
}
