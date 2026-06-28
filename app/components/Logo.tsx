import Link from "next/link";

// Sagel logo — concept: an arrow (thin horizontal line) striking dead-center
// into the target (thick vertical bar). The arrowhead is embedded in the bar
// ("en plein dans le mille"), with fletching at the tail. Wordmark alongside,
// "el" in the brand teal.
export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Sagel — accueil"
      className="flex items-center gap-1.5 text-ink select-none"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="overflow-visible"
      >
        {/* target — thick vertical bar (bullseye seen edge-on) */}
        <rect x="32" y="4" width="6" height="32" rx="3" fill="currentColor" />
        {/* arrow shaft */}
        <line
          x1="4"
          y1="20"
          x2="26"
          y2="20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* arrowhead — tip planted dead-center in the bar (x=35), never past it */}
        <path d="M25 14 L35 20 L25 26 Z" fill="currentColor" />
        {/* fletching — tail of the arrow */}
        <path
          d="M4 14 L10 20 L4 26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      <span className="relative top-px font-serif text-[1.6rem] font-bold tracking-[-0.02em] leading-none text-ink">
        Sag<span className="text-brand">el</span>
      </span>
    </Link>
  );
}
