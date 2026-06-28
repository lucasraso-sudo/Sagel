import type { Category } from "@/app/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Intent extraction from free-text query
// ---------------------------------------------------------------------------

interface ParsedIntent {
  category: Category | null;
  criteria: string[];
  priceRange: "low" | "mid" | "high" | null;
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  FAN: [
    "ventilateur",
    "fan",
    "brasseur",
    "tour",
    "colonne",
    "plafond",
    "table",
  ],
  AIR_COOLER: [
    "rafraîchisseur",
    "rafraichisseur",
    "climatiseur évaporatif",
    "évaporatif",
    "evaporatif",
    "air cooler",
    "brumisateur",
  ],
  MOBILE_AC: [
    "climatiseur",
    "clim",
    "climatisation",
    "mobile ac",
    "split",
    "monobloc",
  ],
  AIR_PURIFIER: [
    "purificateur",
    "purifier",
    "air pur",
    "filtration",
    "hepa",
    "allergie",
    "pollen",
    "particules",
  ],
  DEHUMIDIFIER: [
    "déshumidificateur",
    "deshumidificateur",
    "humidité",
    "humidite",
    "moisissure",
    "condensation",
    "absorbeur",
  ],
  HEATER: [
    "chauffage",
    "chauffage d'appoint",
    "chauffer",
    "soufflant",
    "convecteur",
    "chaleur",
  ],
  RADIATOR: [
    "radiateur",
    "radiateur électrique",
    "inertie",
    "panneau rayonnant",
    "chauffage fixe",
  ],
  HUMIDIFIER: [
    "humidificateur",
    "humidifier",
    "humidité",
    "air sec",
    "brume",
    "vapeur froide",
  ],
  THERMOSTAT: [
    "thermostat",
    "thermostat connecté",
    "programmateur",
    "régulation",
    "économie chauffage",
    "tête thermostatique",
  ],
  WASHING_MACHINE: [
    "lave-linge",
    "lave linge",
    "machine à laver",
    "lavante",
    "hublot",
  ],
  DISHWASHER: [
    "lave-vaisselle",
    "lave vaisselle",
    "vaisselle",
    "couverts",
    "encastrable",
  ],
  FRIDGE: [
    "réfrigérateur",
    "refrigerateur",
    "frigo",
    "combiné",
    "froid",
  ],
  TUMBLE_DRYER: [
    "sèche-linge",
    "seche linge",
    "sèche linge",
    "séchage",
    "pompe à chaleur",
  ],
  FREEZER: [
    "congélateur",
    "congelateur",
    "armoire de congélation",
    "coffre",
    "surgelés",
  ],
  OVEN: [
    "four",
    "four encastrable",
    "cuisinière",
    "pyrolyse",
    "chaleur tournante",
  ],
  COOKTOP: [
    "plaque",
    "plaque de cuisson",
    "induction",
    "vitrocéramique",
    "table de cuisson",
    "foyers",
  ],
  HOOD: [
    "hotte",
    "hotte aspirante",
    "aspiration",
    "extraction",
    "groupe filtrant",
  ],
  WINE_CELLAR: [
    "cave à vin",
    "cave a vin",
    "cave de service",
    "vin",
    "bouteilles",
  ],
  COFFEE_MACHINE: [
    "cafetière",
    "cafetiere",
    "expresso",
    "espresso",
    "café",
    "machine à café",
    "grain",
  ],
  AIR_FRYER: [
    "friteuse",
    "air fryer",
    "airfryer",
    "friteuse sans huile",
    "actifry",
  ],
  COOKING_ROBOT: [
    "robot cuiseur",
    "robot de cuisine",
    "thermomix",
    "companion",
    "monsieur cuisine",
  ],
  KETTLE: [
    "bouilloire",
    "théière",
    "theiere",
    "chauffe-eau",
    "eau chaude",
  ],
  TOASTER: [
    "grille-pain",
    "grille pain",
    "toaster",
    "toast",
    "fentes",
  ],
  BLENDER: [
    "blender",
    "mixeur",
    "mixer",
    "smoothie",
    "blender chauffant",
  ],
};

const CRITERIA_KEYWORDS: Record<string, string> = {
  silencieux: "low_noise",
  silencieuse: "low_noise",
  silence: "low_noise",
  quiet: "low_noise",
  chambre: "bedroom",
  nuit: "bedroom",
  sleeping: "bedroom",
  bureau: "office",
  salon: "living_room",
  puissant: "high_power",
  puissante: "high_power",
  performance: "high_power",
  "pas cher": "low_price",
  économique: "low_price",
  "bon marché": "low_price",
  cheap: "low_price",
  budget: "low_price",
  "haute gamme": "high_price",
  premium: "high_price",
  design: "design",
  portable: "portable",
  compact: "portable",
};

export function parseIntent(query: string): ParsedIntent {
  const q = query.toLowerCase();

  // Detect category
  let category: Category | null = null;
  let bestCategoryScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [
    Category,
    string[],
  ][]) {
    const score = keywords.filter((kw) => q.includes(kw)).length;
    if (score > bestCategoryScore) {
      bestCategoryScore = score;
      category = cat;
    }
  }

  // Extract criteria
  const criteria: string[] = [];
  for (const [kw, criterion] of Object.entries(CRITERIA_KEYWORDS)) {
    if (q.includes(kw) && !criteria.includes(criterion)) {
      criteria.push(criterion);
    }
  }

  // Price range
  let priceRange: "low" | "mid" | "high" | null = null;
  if (criteria.includes("low_price")) priceRange = "low";
  else if (criteria.includes("high_price")) priceRange = "high";

  return { category, criteria, priceRange };
}

// ---------------------------------------------------------------------------
// Scoring boost based on criteria
// ---------------------------------------------------------------------------

export interface RecommendableProduct {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price?: number | null;
  description?: string | null;
  specifications: Array<{ key: string; value: string; unit?: string | null }>;
  productScore?: {
    finalScore: number;
    userScore: number;
    expertScore: number;
    technicalScore: number;
    confidenceScore: number;
  } | null;
}

function criteriaBoost(
  product: RecommendableProduct,
  criteria: string[]
): number {
  let boost = 0;
  const specMap = new Map(
    product.specifications.map((s) => [s.key, parseFloat(s.value)])
  );

  for (const c of criteria) {
    switch (c) {
      case "low_noise": {
        const noise = specMap.get("noise_level");
        if (noise !== undefined && noise < 40) boost += 1.5;
        break;
      }
      case "high_power": {
        const airflow = specMap.get("airflow") ?? specMap.get("cooling_power");
        if (airflow !== undefined && airflow > 500) boost += 1.0;
        break;
      }
      case "low_price":
        if (product.price && product.price < 100) boost += 1.0;
        break;
      case "high_price":
        if (product.price && product.price >= 200) boost += 0.5;
        break;
    }
  }

  return boost;
}

// ---------------------------------------------------------------------------
// Main recommendation function
// ---------------------------------------------------------------------------

export interface RecommendationResult {
  product: RecommendableProduct;
  score: number;
  matchedCriteria: string[];
  relevanceBoost: number;
}

export function recommend(
  query: string,
  products: RecommendableProduct[],
  topN = 3
): RecommendationResult[] {
  const intent = parseIntent(query);

  // Filter by category if detected
  const candidates =
    intent.category !== null
      ? products.filter((p) => p.category === intent.category)
      : products;

  // Score and rank
  const scored = candidates
    .filter((p) => p.productScore !== null && p.productScore !== undefined)
    .map((p) => {
      const baseScore = p.productScore!.finalScore;
      const boost = criteriaBoost(p, intent.criteria);
      const matchedCriteria = intent.criteria.filter((c) => {
        const specMap = new Map(
          p.specifications.map((s) => [s.key, parseFloat(s.value)])
        );
        if (c === "low_noise") return (specMap.get("noise_level") ?? 99) < 40;
        if (c === "low_price") return (p.price ?? 9999) < 100;
        return true;
      });

      return {
        product: p,
        score: baseScore + boost,
        matchedCriteria,
        relevanceBoost: boost,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return scored;
}
