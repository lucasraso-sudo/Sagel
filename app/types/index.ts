export type Category = "FAN" | "AIR_COOLER" | "MOBILE_AC";

export interface Spec {
  key: string;
  value: string;
  unit?: string | null;
}

export interface ProductScore {
  finalScore: number;
  userScore: number;
  expertScore: number;
  technicalScore: number;
  confidenceScore: number;
  lastCalculatedAt: string;
}

export interface ReviewAggregate {
  rating: number;
  reviewCount: number;
  source: { name: string; type: string };
}

export interface ExpertScore {
  sourceName: string;
  score: number;
  weight: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  description?: string | null;
  image?: string | null;
  price?: number | null;
  specifications: Spec[];
  productScore?: ProductScore | null;
  reviewAggregates?: ReviewAggregate[];
  expertScores?: ExpertScore[];
}

export interface Explanation {
  summary: string;
  pros: string[];
  cons: string[];
}

export const CATEGORY_LABELS: Record<Category, string> = {
  FAN: "Ventilateurs",
  AIR_COOLER: "Rafraîchisseurs d'air",
  MOBILE_AC: "Climatiseurs mobiles",
};

export const CATEGORY_SLUGS: Record<string, Category> = {
  ventilateurs: "FAN",
  "rafraichisseurs-air": "AIR_COOLER",
  "climatiseurs-mobiles": "MOBILE_AC",
};

export const CATEGORY_SLUGS_REVERSE: Record<Category, string> = {
  FAN: "ventilateurs",
  AIR_COOLER: "rafraichisseurs-air",
  MOBILE_AC: "climatiseurs-mobiles",
};
