import type { Category } from "@/app/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReviewInput {
  sourceName: string;
  rating: number; // 0–5
  reviewCount: number;
  trustScore: number; // 0–1 (platform trust)
}

export interface ExpertInput {
  sourceName: string;
  score: number; // 0–20
  weight: number;
}

export interface SpecInput {
  key: string;
  value: string;
  unit?: string;
}

export interface ScoreResult {
  userScore: number;
  expertScore: number;
  technicalScore: number;
  finalScore: number;
  confidenceScore: number;
}

// ---------------------------------------------------------------------------
// Platform weights (higher = more trusted)
// ---------------------------------------------------------------------------

const PLATFORM_WEIGHTS: Record<string, number> = {
  Darty: 1.5,
  Fnac: 1.4,
  Cdiscount: 1.2,
  "Rue du Commerce": 1.15,
};

function getPlatformWeight(name: string): number {
  return PLATFORM_WEIGHTS[name] ?? 1.0;
}

// ---------------------------------------------------------------------------
// Volume coefficient: more reviews → more confidence
// ---------------------------------------------------------------------------

function volumeCoefficient(count: number): number {
  if (count >= 2000) return 2.0;
  if (count >= 500) return 1.8;
  if (count >= 100) return 1.5;
  if (count >= 50) return 1.2;
  return 1.0;
}

// ---------------------------------------------------------------------------
// User score (0–20)
// ---------------------------------------------------------------------------

export function computeUserScore(reviews: ReviewInput[]): number {
  if (!reviews.length) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const r of reviews) {
    const platformW = getPlatformWeight(r.sourceName);
    const volumeW = volumeCoefficient(r.reviewCount);
    const w = platformW * volumeW * r.trustScore;
    // Normalize rating from 0–5 to 0–20
    weightedSum += (r.rating / 5) * 20 * w;
    totalWeight += w;
  }

  return totalWeight > 0 ? Math.min(20, weightedSum / totalWeight) : 0;
}

// ---------------------------------------------------------------------------
// Expert score (0–20)
// ---------------------------------------------------------------------------

export function computeExpertScore(experts: ExpertInput[]): number {
  if (!experts.length) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const e of experts) {
    weightedSum += e.score * e.weight;
    totalWeight += e.weight;
  }

  return totalWeight > 0 ? Math.min(20, weightedSum / totalWeight) : 0;
}

// ---------------------------------------------------------------------------
// Technical score per category (0–20)
// ---------------------------------------------------------------------------

const SPEC_TARGETS: Record<
  Category,
  Array<{ key: string; ideal: number; unit?: string; higherIsBetter: boolean }>
> = {
  FAN: [
    { key: "airflow", ideal: 900, unit: "m3/h", higherIsBetter: true },
    { key: "noise_level", ideal: 25, unit: "dB", higherIsBetter: false },
    { key: "power", ideal: 25, unit: "W", higherIsBetter: false },
  ],
  AIR_COOLER: [
    { key: "tank_size", ideal: 15, unit: "L", higherIsBetter: true },
    { key: "airflow", ideal: 800, unit: "m3/h", higherIsBetter: true },
    { key: "power", ideal: 80, unit: "W", higherIsBetter: false },
  ],
  MOBILE_AC: [
    { key: "cooling_power", ideal: 12000, unit: "BTU", higherIsBetter: true },
    { key: "noise_level", ideal: 52, unit: "dB", higherIsBetter: false },
    { key: "energy_rating", ideal: 5, unit: "stars", higherIsBetter: true },
  ],
  AIR_PURIFIER: [
    { key: "cadr", ideal: 400, unit: "m3/h", higherIsBetter: true },
    { key: "coverage_area", ideal: 60, unit: "m2", higherIsBetter: true },
    { key: "noise_level", ideal: 25, unit: "dB", higherIsBetter: false },
  ],
  DEHUMIDIFIER: [
    { key: "extraction", ideal: 24, unit: "L/jour", higherIsBetter: true },
    { key: "tank_size", ideal: 5, unit: "L", higherIsBetter: true },
    { key: "noise_level", ideal: 40, unit: "dB", higherIsBetter: false },
  ],
  HEATER: [
    { key: "heating_power", ideal: 2000, unit: "W", higherIsBetter: true },
    { key: "coverage_area", ideal: 25, unit: "m2", higherIsBetter: true },
    { key: "noise_level", ideal: 30, unit: "dB", higherIsBetter: false },
  ],
  RADIATOR: [
    { key: "heating_power", ideal: 2000, unit: "W", higherIsBetter: true },
    { key: "coverage_area", ideal: 25, unit: "m2", higherIsBetter: true },
    { key: "noise_level", ideal: 20, unit: "dB", higherIsBetter: false },
  ],
  HUMIDIFIER: [
    { key: "tank_size", ideal: 6, unit: "L", higherIsBetter: true },
    { key: "coverage_area", ideal: 50, unit: "m2", higherIsBetter: true },
    { key: "noise_level", ideal: 25, unit: "dB", higherIsBetter: false },
  ],
  THERMOSTAT: [
    { key: "savings", ideal: 35, unit: "%", higherIsBetter: true },
  ],
  WASHING_MACHINE: [
    { key: "capacity", ideal: 9, unit: "kg", higherIsBetter: true },
    { key: "spin_speed", ideal: 1400, unit: "tr/min", higherIsBetter: true },
    { key: "noise_level", ideal: 50, unit: "dB", higherIsBetter: false },
  ],
  DISHWASHER: [
    { key: "place_settings", ideal: 14, unit: "couverts", higherIsBetter: true },
    { key: "noise_level", ideal: 42, unit: "dB", higherIsBetter: false },
    { key: "water_use", ideal: 9, unit: "L", higherIsBetter: false },
  ],
  FRIDGE: [
    { key: "volume", ideal: 360, unit: "L", higherIsBetter: true },
    { key: "noise_level", ideal: 38, unit: "dB", higherIsBetter: false },
    { key: "consumption", ideal: 150, unit: "kWh/an", higherIsBetter: false },
  ],
  TUMBLE_DRYER: [
    { key: "capacity", ideal: 9, unit: "kg", higherIsBetter: true },
    { key: "noise_level", ideal: 64, unit: "dB", higherIsBetter: false },
    { key: "consumption", ideal: 200, unit: "kWh/an", higherIsBetter: false },
  ],
  FREEZER: [
    { key: "volume", ideal: 250, unit: "L", higherIsBetter: true },
    { key: "noise_level", ideal: 38, unit: "dB", higherIsBetter: false },
    { key: "consumption", ideal: 150, unit: "kWh/an", higherIsBetter: false },
  ],
  OVEN: [
    { key: "volume", ideal: 71, unit: "L", higherIsBetter: true },
    { key: "consumption", ideal: 0.8, unit: "kWh", higherIsBetter: false },
  ],
  COOKTOP: [
    { key: "zones", ideal: 4, unit: "foyers", higherIsBetter: true },
    { key: "max_power", ideal: 7400, unit: "W", higherIsBetter: true },
  ],
  HOOD: [
    { key: "extraction_rate", ideal: 600, unit: "m3/h", higherIsBetter: true },
    { key: "noise_level", ideal: 50, unit: "dB", higherIsBetter: false },
  ],
  WINE_CELLAR: [
    { key: "bottles", ideal: 40, unit: "bouteilles", higherIsBetter: true },
    { key: "noise_level", ideal: 38, unit: "dB", higherIsBetter: false },
    { key: "consumption", ideal: 150, unit: "kWh/an", higherIsBetter: false },
  ],
  COFFEE_MACHINE: [
    { key: "pressure", ideal: 19, unit: "bars", higherIsBetter: true },
    { key: "tank_size", ideal: 1.8, unit: "L", higherIsBetter: true },
  ],
  AIR_FRYER: [
    { key: "bowl_capacity", ideal: 6, unit: "L", higherIsBetter: true },
    { key: "heating_power", ideal: 1700, unit: "W", higherIsBetter: true },
  ],
  COOKING_ROBOT: [
    { key: "bowl_capacity", ideal: 3, unit: "L", higherIsBetter: true },
    { key: "max_power", ideal: 1500, unit: "W", higherIsBetter: true },
  ],
  KETTLE: [
    { key: "tank_size", ideal: 1.7, unit: "L", higherIsBetter: true },
    { key: "heating_power", ideal: 3000, unit: "W", higherIsBetter: true },
  ],
  TOASTER: [
    { key: "slots", ideal: 4, unit: "fentes", higherIsBetter: true },
    { key: "heating_power", ideal: 1500, unit: "W", higherIsBetter: true },
  ],
  BLENDER: [
    { key: "max_power", ideal: 1500, unit: "W", higherIsBetter: true },
    { key: "bowl_capacity", ideal: 2, unit: "L", higherIsBetter: true },
  ],
};

function specScore(
  value: number,
  ideal: number,
  higherIsBetter: boolean
): number {
  if (higherIsBetter) {
    return Math.min(1, value / ideal);
  } else {
    // Lower is better: score = 1 when value ≤ ideal, degrades linearly above
    if (value <= ideal) return 1;
    return Math.max(0, 1 - (value - ideal) / ideal);
  }
}

export function computeTechnicalScore(
  specs: SpecInput[],
  category: Category
): number {
  const targets = SPEC_TARGETS[category];
  if (!targets?.length) return 0;

  const specMap = new Map(specs.map((s) => [s.key, parseFloat(s.value)]));

  let totalScore = 0;
  let matched = 0;

  for (const t of targets) {
    const val = specMap.get(t.key);
    if (val !== undefined && !isNaN(val)) {
      totalScore += specScore(val, t.ideal, t.higherIsBetter);
      matched++;
    }
  }

  if (matched === 0) return 0;
  return Math.min(20, (totalScore / matched) * 20);
}

// ---------------------------------------------------------------------------
// Confidence score (0–100)
// ---------------------------------------------------------------------------

export function computeConfidenceScore(
  reviews: ReviewInput[],
  experts: ExpertInput[],
  specs: SpecInput[],
  category: Category
): number {
  const totalReviews = reviews.reduce((s, r) => s + r.reviewCount, 0);
  const specTargets = SPEC_TARGETS[category] ?? [];
  const specKeys = new Set(specs.map((s) => s.key));
  const specCompleteness =
    specTargets.length > 0
      ? specTargets.filter((t) => specKeys.has(t.key)).length /
        specTargets.length
      : 0;

  // Volume factor: saturates at 500+ reviews
  const volumeFactor = Math.min(1, totalReviews / 500);
  // Source diversity: more sources = higher confidence
  const sourceFactor = Math.min(1, reviews.length / 4);
  const expertFactor = Math.min(1, experts.length / 2);

  const score =
    volumeFactor * 40 +
    sourceFactor * 20 +
    expertFactor * 15 +
    specCompleteness * 25;

  return Math.round(Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Final score (0–20)
// ---------------------------------------------------------------------------

export function calculateProductScore(
  reviews: ReviewInput[],
  experts: ExpertInput[],
  specs: SpecInput[],
  category: Category
): ScoreResult {
  const userScore = computeUserScore(reviews);
  const expertScore = computeExpertScore(experts);
  const technicalScore = computeTechnicalScore(specs, category);
  const confidenceScore = computeConfidenceScore(
    reviews,
    experts,
    specs,
    category
  );

  // Weighted final score
  const finalScore = Math.round(
    (0.55 * userScore + 0.2 * expertScore + 0.25 * technicalScore) * 10
  ) / 10;

  return {
    userScore: Math.round(userScore * 10) / 10,
    expertScore: Math.round(expertScore * 10) / 10,
    technicalScore: Math.round(technicalScore * 10) / 10,
    finalScore: Math.min(20, finalScore),
    confidenceScore,
  };
}
