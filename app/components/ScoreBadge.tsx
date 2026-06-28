"use client";

// ---------------------------------------------------------------------------
// Score helpers — the database stores scores on /20; the Sagel UI shows /100.
// ---------------------------------------------------------------------------

export function to100(score20: number): number {
  return Math.round((score20 / 20) * 100);
}

/** Color for a /100 score, matching the Sagel palette. */
export function scoreColor(score100: number): string {
  if (score100 >= 85) return "#0F766E"; // brand
  if (score100 >= 75) return "#14B8A6"; // brand-light
  if (score100 >= 65) return "#E9C46A"; // gold
  return "#C0392B"; // danger
}

// ---------------------------------------------------------------------------
// Circular score ring (SVG)
// ---------------------------------------------------------------------------

const RING_SIZES = {
  sm: { d: 52, r: 22, sw: 4, val: "text-sm", lbl: "text-[0.5rem]" },
  md: { d: 64, r: 27, sw: 5, val: "text-[1.05rem]", lbl: "text-[0.52rem]" },
  lg: { d: 92, r: 39, sw: 7, val: "text-2xl", lbl: "text-[0.62rem]" },
} as const;

interface ScoreRingProps {
  /** Score on the /20 scale (as stored in DB). */
  score: number;
  size?: keyof typeof RING_SIZES;
}

export function ScoreRing({ score, size = "md" }: ScoreRingProps) {
  const value = to100(score);
  const color = scoreColor(value);
  const { d, r, sw, val, lbl } = RING_SIZES[size];
  const cx = d / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <div className="relative flex-shrink-0" style={{ width: d, height: d }}>
      <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E5E5EA" strokeWidth={sw} />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${val} font-bold leading-none`} style={{ color }}>
          {value}
        </span>
        <span className={`${lbl} font-medium uppercase tracking-wide text-muted`}>
          /100
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thin sub-score row (Avis / Experts / Technique)
// ---------------------------------------------------------------------------

export function SubScoreRow({ name, score }: { name: string; score: number }) {
  const value = to100(score);
  const color = scoreColor(value);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.68rem] text-muted w-16 flex-shrink-0">{name}</span>
      <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[0.66rem] font-semibold text-ink w-7 text-right">
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Labeled score bar (detail & compare pages)
// ---------------------------------------------------------------------------

export function ScoreBar({
  label,
  score,
  weight,
}: {
  label: string;
  score: number;
  weight?: number;
}) {
  const value = to100(score);
  const color = scoreColor(value);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold text-ink">
          {value}
          <span className="text-muted">/100</span>
          {weight !== undefined && (
            <span className="text-xs text-muted ml-1">
              ({Math.round(weight * 100)}%)
            </span>
          )}
        </span>
      </div>
      <div className="h-2 bg-line rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
