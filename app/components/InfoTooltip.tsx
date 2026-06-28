"use client";

import { useState } from "react";

interface InfoTooltipProps {
  title?: string;
  /** Short definition of the characteristic. */
  def: string;
  /** What a high/low value means (the "repère"). */
  hint: string;
}

// Small "i" badge that reveals a short definition + a high/low reading hint.
// Opens on hover (desktop) and on tap (mobile, via the toggle button).
export function InfoTooltip({ title, def, hint }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Explication"
        className="ml-1.5 w-[15px] h-[15px] inline-flex items-center justify-center rounded-full border border-line text-[0.6rem] font-bold leading-none text-muted hover:text-brand hover:border-brand transition-colors"
      >
        i
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute left-0 bottom-full mb-2 z-30 w-60 bg-ink text-cream rounded-lg px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-left"
        >
          {title && (
            <span className="block text-[0.78rem] font-semibold mb-0.5">
              {title}
            </span>
          )}
          <span className="block text-[0.72rem] leading-relaxed text-cream/90">
            {def}
          </span>
          <span className="block mt-1.5 text-[0.72rem] leading-relaxed text-gold">
            ↕ {hint}
          </span>
          {/* arrow */}
          <span className="absolute left-3 top-full -mt-px h-0 w-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-ink" />
        </span>
      )}
    </span>
  );
}
