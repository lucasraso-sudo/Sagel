export type Category =
  | "FAN"
  | "AIR_COOLER"
  | "MOBILE_AC"
  | "AIR_PURIFIER"
  | "DEHUMIDIFIER"
  | "HEATER"
  | "RADIATOR"
  | "HUMIDIFIER"
  | "THERMOSTAT"
  | "WASHING_MACHINE"
  | "DISHWASHER"
  | "FRIDGE"
  | "TUMBLE_DRYER"
  | "FREEZER"
  | "OVEN"
  | "COOKTOP"
  | "HOOD"
  | "WINE_CELLAR"
  | "COFFEE_MACHINE"
  | "AIR_FRYER"
  | "COOKING_ROBOT"
  | "KETTLE"
  | "TOASTER"
  | "BLENDER";

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

export interface Offer {
  id: string;
  merchant: string;
  url: string;
  /** Affiliate-wrapped click-through URL (added by the API when configured). */
  affiliateUrl?: string;
  price: number;
  currency: string;
  inStock: boolean;
  lastUpdated: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  description?: string | null;
  image?: string | null;
  mpn: string;
  ean?: string | null;
  price?: number | null;
  specifications: Spec[];
  productScore?: ProductScore | null;
  reviewAggregates?: ReviewAggregate[];
  expertScores?: ExpertScore[];
  offers?: Offer[];
}

/**
 * Product name with a redundant leading brand stripped, for display.
 * e.g. modelName("DeLonghi", "De'Longhi Pinguino PAC EX105") → "Pinguino PAC EX105".
 * Handles multi-word brands ("Olimpia Splendid") and punctuation/apostrophe
 * differences ("De'Longhi" vs "DeLonghi"). Returns the full name if it doesn't
 * start with the brand.
 */
export function modelName(brand: string, name: string): string {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = normalize(brand);
  if (!target) return name;
  const words = name.split(/\s+/);
  let acc = "";
  for (let i = 0; i < words.length; i++) {
    acc += normalize(words[i]);
    if (acc === target) {
      const rest = words.slice(i + 1).join(" ");
      return rest.length > 0 ? rest : name;
    }
    if (!target.startsWith(acc)) break;
  }
  return name;
}

/** Cheapest in-stock offer, or the reference price as a fallback. */
export function bestPrice(
  product: Product
): { price: number; count: number } | null {
  const inStock = (product.offers ?? []).filter((o) => o.inStock);
  if (inStock.length === 0) {
    return product.price != null ? { price: product.price, count: 0 } : null;
  }
  return {
    price: Math.min(...inStock.map((o) => o.price)),
    count: inStock.length,
  };
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
  AIR_PURIFIER: "Purificateurs d'air",
  DEHUMIDIFIER: "Déshumidificateurs",
  HEATER: "Chauffages d'appoint",
  RADIATOR: "Radiateurs électriques",
  HUMIDIFIER: "Humidificateurs",
  THERMOSTAT: "Thermostats connectés",
  WASHING_MACHINE: "Lave-linge",
  DISHWASHER: "Lave-vaisselle",
  FRIDGE: "Réfrigérateurs",
  TUMBLE_DRYER: "Sèche-linge",
  FREEZER: "Congélateurs",
  OVEN: "Fours & cuisinières",
  COOKTOP: "Plaques de cuisson",
  HOOD: "Hottes aspirantes",
  WINE_CELLAR: "Caves à vin",
  COFFEE_MACHINE: "Cafetières & expresso",
  AIR_FRYER: "Friteuses & air fryers",
  COOKING_ROBOT: "Robots cuiseurs",
  KETTLE: "Bouilloires & théières",
  TOASTER: "Grille-pain",
  BLENDER: "Blenders & mixeurs",
};

export const CATEGORY_SLUGS: Record<string, Category> = {
  ventilateurs: "FAN",
  "rafraichisseurs-air": "AIR_COOLER",
  "climatiseurs-mobiles": "MOBILE_AC",
  "purificateurs-air": "AIR_PURIFIER",
  deshumidificateurs: "DEHUMIDIFIER",
  "chauffages-appoint": "HEATER",
  "radiateurs-electriques": "RADIATOR",
  humidificateurs: "HUMIDIFIER",
  "thermostats-connectes": "THERMOSTAT",
  "lave-linge": "WASHING_MACHINE",
  "lave-vaisselle": "DISHWASHER",
  refrigerateurs: "FRIDGE",
  "seche-linge": "TUMBLE_DRYER",
  congelateurs: "FREEZER",
  "fours-cuisinieres": "OVEN",
  "plaques-cuisson": "COOKTOP",
  "hottes-aspirantes": "HOOD",
  "caves-a-vin": "WINE_CELLAR",
  "cafetieres-expresso": "COFFEE_MACHINE",
  "friteuses-air-fryers": "AIR_FRYER",
  "robots-cuiseurs": "COOKING_ROBOT",
  "bouilloires-theieres": "KETTLE",
  "grille-pain": "TOASTER",
  "blenders-mixeurs": "BLENDER",
};

export const CATEGORY_SLUGS_REVERSE: Record<Category, string> = {
  FAN: "ventilateurs",
  AIR_COOLER: "rafraichisseurs-air",
  MOBILE_AC: "climatiseurs-mobiles",
  AIR_PURIFIER: "purificateurs-air",
  DEHUMIDIFIER: "deshumidificateurs",
  HEATER: "chauffages-appoint",
  RADIATOR: "radiateurs-electriques",
  HUMIDIFIER: "humidificateurs",
  THERMOSTAT: "thermostats-connectes",
  WASHING_MACHINE: "lave-linge",
  DISHWASHER: "lave-vaisselle",
  FRIDGE: "refrigerateurs",
  TUMBLE_DRYER: "seche-linge",
  FREEZER: "congelateurs",
  OVEN: "fours-cuisinieres",
  COOKTOP: "plaques-cuisson",
  HOOD: "hottes-aspirantes",
  WINE_CELLAR: "caves-a-vin",
  COFFEE_MACHINE: "cafetieres-expresso",
  AIR_FRYER: "friteuses-air-fryers",
  COOKING_ROBOT: "robots-cuiseurs",
  KETTLE: "bouilloires-theieres",
  TOASTER: "grille-pain",
  BLENDER: "blenders-mixeurs",
};
