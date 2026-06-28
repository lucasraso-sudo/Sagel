"use client";

import Link from "next/link";
import { useState } from "react";
import { PRODUCT_FAMILIES, type CatalogFamily } from "@/app/catalog";
import { Logo } from "./Logo";

// One dropdown listing a family's sub-categories (live links + "Bientôt" items).
function FamilyDropdown({ family }: { family: CatalogFamily }) {
  return (
    <div className="absolute right-0 top-full pt-2">
      <div className="w-72 bg-white border border-line rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-3">
        {family.soon && (
          <span className="inline-block mb-1.5 ml-1 text-[0.6rem] font-semibold uppercase tracking-wide text-brand bg-brand/8 px-1.5 py-0.5 rounded-full">
            Bientôt
          </span>
        )}
        <ul className="space-y-0.5">
          {family.items.map((item) =>
            item.href ? (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-ink hover:bg-cream transition-colors"
                >
                  <span className="text-base">{item.emoji}</span>
                  {item.label}
                </Link>
              </li>
            ) : (
              <li
                key={item.label}
                className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-muted/70 cursor-default"
              >
                <span className="text-base grayscale opacity-60">
                  {item.emoji}
                </span>
                {item.label}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [openFamily, setOpenFamily] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-line">
      <nav className="px-6 h-[60px] flex items-center gap-4">
        <Logo />

        {/* Family tabs + Les tops — one aligned set pushed to the right */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          {PRODUCT_FAMILIES.map((family) => (
            <div
              key={family.title}
              className="relative"
              onMouseEnter={() => setOpenFamily(family.title)}
              onMouseLeave={() => setOpenFamily(null)}
            >
              <button
                className="flex items-center gap-1 px-2 py-5 text-[0.83rem] font-medium text-muted hover:text-ink transition-colors whitespace-nowrap"
                aria-expanded={openFamily === family.title}
              >
                {family.title}
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform ${
                    openFamily === family.title ? "rotate-180" : ""
                  }`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {openFamily === family.title && <FamilyDropdown family={family} />}
            </div>
          ))}

          {/* Les tops — same tab styling, part of the same set */}
          <Link
            href="/tops"
            className="px-2 py-5 text-[0.83rem] font-medium text-muted hover:text-ink transition-colors whitespace-nowrap"
          >
            Les tops
          </Link>

          {/* Se connecter CTA */}
          <Link
            href="/connexion"
            className="ml-2 flex-shrink-0 flex items-center gap-1.5 text-[0.82rem] font-semibold text-brand border-[1.5px] border-brand hover:bg-brand hover:text-white px-4 py-2 rounded-full transition-colors"
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
          className="md:hidden ml-auto text-ink"
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

      {/* Mobile menu — families with their categories */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-cream px-6 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {PRODUCT_FAMILIES.map((family) => (
            <div key={family.title}>
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted mb-2">
                {family.title}
                {family.soon && " · bientôt"}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {family.items.map((item) =>
                  item.href ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 py-1.5 text-sm text-ink"
                    >
                      <span>{item.emoji}</span>
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      key={item.label}
                      className="flex items-center gap-2.5 py-1.5 text-sm text-muted/60"
                    >
                      <span className="grayscale opacity-60">{item.emoji}</span>
                      {item.label}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
          <Link
            href="/tops"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-ink"
          >
            Les tops
          </Link>
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
