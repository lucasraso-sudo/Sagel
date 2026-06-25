"use client";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 15) return "bg-emerald-500 text-white";
  if (score >= 10) return "bg-amber-400 text-white";
  return "bg-red-500 text-white";
}

function scoreRing(score: number): string {
  if (score >= 15) return "ring-emerald-200";
  if (score >= 10) return "ring-amber-200";
  return "ring-red-200";
}

const SIZES = {
  sm: "w-10 h-10 text-sm",
  md: "w-16 h-16 text-xl",
  lg: "w-24 h-24 text-3xl",
};

export function ScoreBadge({ score, size = "md", showLabel = false }: ScoreBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${SIZES[size]} ${scoreColor(score)} ${scoreRing(score)}
          rounded-full ring-4 flex items-center justify-center font-bold`}
      >
        {score.toFixed(1)}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 font-medium">/20</span>
      )}
    </div>
  );
}

export function ScoreBar({
  label,
  score,
  weight,
}: {
  label: string;
  score: number;
  weight: number;
}) {
  const pct = (score / 20) * 100;
  const color =
    score >= 15
      ? "bg-emerald-500"
      : score >= 10
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">
          {score.toFixed(1)}/20
          <span className="text-xs text-gray-400 ml-1">({Math.round(weight * 100)}%)</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
