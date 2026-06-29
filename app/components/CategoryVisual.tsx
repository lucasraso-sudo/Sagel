// A branded product visual used wherever a real product photo isn't available
// yet (the catalog runs on illustrative data until the Amazon PA-API is wired
// in). It renders a soft cream→brand gradient tile with a decorative ring and
// dotted texture behind the category emoji — far more "designed" than a bare
// emoji, and fully on-brand (cream / teal / Playfair).
//
// The parent controls the box size via `className`; pass `emojiClass` to scale
// the emoji to match (e.g. "text-6xl" on the detail page, "text-[3.5rem]" on a
// card). Swap this component out for <img> once real product images exist.

import { CATEGORY_EMOJI } from "@/app/constants";
import type { Category } from "@/app/types";

interface CategoryVisualProps {
  category: Category | string;
  /** Container sizing/shape classes, e.g. "h-[140px]" or "w-16 h-16 rounded-xl". */
  className?: string;
  /** Emoji size class, e.g. "text-[3.5rem]". */
  emojiClass?: string;
}

export function CategoryVisual({
  category,
  className = "",
  emojiClass = "text-[3.5rem]",
}: CategoryVisualProps) {
  const emoji = CATEGORY_EMOJI[category] ?? "📦";

  return (
    <div
      className={`relative overflow-hidden bg-cream flex items-center justify-center select-none ${className}`}
    >
      {/* Soft brand gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(20,184,166,0.10) 0%, rgba(15,118,110,0.04) 45%, transparent 70%)",
        }}
      />
      {/* Dotted texture */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(15,118,110,0.08) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />
      {/* Decorative concentric ring behind the emoji */}
      <div className="absolute aspect-square w-[62%] rounded-full border border-brand/10" />
      <div className="absolute aspect-square w-[44%] rounded-full bg-white/55 shadow-[0_4px_16px_rgba(15,118,110,0.06)]" />

      <span className={`relative ${emojiClass} drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]`}>
        {emoji}
      </span>
    </div>
  );
}
