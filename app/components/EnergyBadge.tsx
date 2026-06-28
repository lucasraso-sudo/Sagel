// Colored energy-class badge in the EU energy-label palette (A green → G red).
// Handles the new A–G scale and the legacy A+ / A++ / A+++ values.

const COLORS: Record<string, { bg: string; fg: string }> = {
  A: { bg: "#00843D", fg: "#ffffff" }, // green
  B: { bg: "#4CAF50", fg: "#ffffff" }, // light green
  C: { bg: "#C9D200", fg: "#1c1c1e" }, // yellow-green
  D: { bg: "#FFD200", fg: "#1c1c1e" }, // yellow
  E: { bg: "#F2A100", fg: "#ffffff" }, // orange
  F: { bg: "#E2620E", fg: "#ffffff" }, // dark orange
  G: { bg: "#E30613", fg: "#ffffff" }, // red
};

export function EnergyBadge({ value }: { value: string }) {
  // A+++, A++, A+ all map to the A (green) band.
  const key = value.replace(/\+/g, "").toUpperCase();
  const c = COLORS[key] ?? { bg: "#8E8E93", fg: "#ffffff" };
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-sm font-bold leading-none"
      style={{ background: c.bg, color: c.fg }}
    >
      {value}
    </span>
  );
}
