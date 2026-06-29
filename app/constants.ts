// Shared UI constants — single source of truth for category emojis, merchant
// emojis and technical-spec labels (previously duplicated across ProductCard,
// the product page, the compare page and the dashboard).

/** Emoji per product category (fallback "📦" applied at call sites). */
export const CATEGORY_EMOJI: Record<string, string> = {
  FAN: "🌀",
  AIR_COOLER: "💧",
  MOBILE_AC: "❄️",
  AIR_PURIFIER: "🌬️",
  DEHUMIDIFIER: "💨",
  HEATER: "🔥",
  RADIATOR: "♨️",
  HUMIDIFIER: "💦",
  THERMOSTAT: "🌡️",
  WASHING_MACHINE: "🧺",
  DISHWASHER: "🍽️",
  FRIDGE: "🧊",
  TUMBLE_DRYER: "🌀",
  FREEZER: "❄️",
  OVEN: "🔥",
  COOKTOP: "🍳",
  HOOD: "💨",
  WINE_CELLAR: "🍷",
  COFFEE_MACHINE: "☕",
  AIR_FRYER: "🍟",
  COOKING_ROBOT: "🍲",
  KETTLE: "🫖",
  TOASTER: "🍞",
  BLENDER: "🥤",
};

/** Emoji per merchant (fallback "🛒" applied at call sites). */
export const MERCHANT_EMOJI: Record<string, string> = {
  Amazon: "📦",
  Darty: "🔵",
  Fnac: "🟡",
  Cdiscount: "🟣",
  "Rue du Commerce": "🟠",
};

/** Human label per technical-spec key. */
export const SPEC_LABELS: Record<string, string> = {
  noise_level: "Niveau sonore",
  airflow: "Débit d'air",
  power: "Consommation",
  cooling_power: "Puissance de refroidissement",
  tank_size: "Capacité réservoir",
  energy_rating: "Efficacité énergétique",
  cadr: "Débit d'air pur (CADR)",
  coverage_area: "Surface couverte",
  extraction: "Extraction d'eau",
  heating_power: "Puissance de chauffe",
  savings: "Économies de chauffage",
  capacity: "Capacité de linge",
  spin_speed: "Vitesse d'essorage",
  place_settings: "Capacité (couverts)",
  water_use: "Consommation d'eau",
  volume: "Volume utile",
  consumption: "Consommation",
  energy_class: "Classe énergétique",
  zones: "Foyers",
  max_power: "Puissance max",
  extraction_rate: "Débit d'aspiration",
  bottles: "Capacité (bouteilles)",
  pressure: "Pression",
  bowl_capacity: "Capacité du bol",
  slots: "Fentes",
};
