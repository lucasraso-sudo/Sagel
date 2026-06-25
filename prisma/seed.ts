import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { calculateProductScore } from "../lib/scoring/calculateProductScore";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SOURCES = [
  { name: "Darty", type: "generalist", trustScore: 0.85 },
  { name: "Fnac", type: "generalist", trustScore: 0.8 },
  { name: "Boulanger", type: "generalist", trustScore: 0.75 },
  { name: "Amazon", type: "generalist", trustScore: 0.65 },
];

const PRODUCTS = [
  // ── VENTILATEURS ─────────────────────────────────────────────────────────
  {
    name: "Dyson Cool AM07",
    brand: "Dyson",
    category: "FAN" as const,
    description:
      "Ventilateur sans pale ultra-silencieux avec technologie Air Multiplier.",
    price: 349,
    specs: [
      { key: "noise_level", value: "28", unit: "dB" },
      { key: "airflow", value: "850", unit: "m3/h" },
      { key: "power", value: "40", unit: "W" },
    ],
    reviews: [
      { sourceName: "Darty", rating: 4.7, reviewCount: 1200 },
      { sourceName: "Fnac", rating: 4.6, reviewCount: 890 },
      { sourceName: "Amazon", rating: 4.4, reviewCount: 3200 },
    ],
    expertScores: [{ sourceName: "Which?", score: 18, weight: 1.5 }],
  },
  {
    name: "Rowenta Turbo Silence VU5670",
    brand: "Rowenta",
    category: "FAN" as const,
    description: "Ventilateur de table 5 vitesses, ultra-silencieux.",
    price: 89,
    specs: [
      { key: "noise_level", value: "32", unit: "dB" },
      { key: "airflow", value: "680", unit: "m3/h" },
      { key: "power", value: "50", unit: "W" },
    ],
    reviews: [
      { sourceName: "Darty", rating: 4.5, reviewCount: 540 },
      { sourceName: "Amazon", rating: 4.3, reviewCount: 2100 },
      { sourceName: "Fnac", rating: 4.4, reviewCount: 320 },
    ],
    expertScores: [{ sourceName: "UFC Que Choisir", score: 16, weight: 1.2 }],
  },
  {
    name: "Xiaomi Smart Standing Fan 2",
    brand: "Xiaomi",
    category: "FAN" as const,
    description: "Ventilateur sur pied connecté, 100 niveaux de vitesse.",
    price: 69,
    specs: [
      { key: "noise_level", value: "26", unit: "dB" },
      { key: "airflow", value: "740", unit: "m3/h" },
      { key: "power", value: "22", unit: "W" },
    ],
    reviews: [
      { sourceName: "Amazon", rating: 4.5, reviewCount: 1800 },
      { sourceName: "Fnac", rating: 4.2, reviewCount: 260 },
    ],
    expertScores: [],
  },
  {
    name: "Honeywell HT-900",
    brand: "Honeywell",
    category: "FAN" as const,
    description: "Ventilateur de table compact et puissant.",
    price: 34,
    specs: [
      { key: "noise_level", value: "48", unit: "dB" },
      { key: "airflow", value: "500", unit: "m3/h" },
      { key: "power", value: "35", unit: "W" },
    ],
    reviews: [
      { sourceName: "Amazon", rating: 4.1, reviewCount: 5600 },
      { sourceName: "Boulanger", rating: 3.9, reviewCount: 180 },
    ],
    expertScores: [],
  },
  {
    name: "Meaco MeacoFan 1056",
    brand: "Meaco",
    category: "FAN" as const,
    description: "Ventilateur DC ultra-silencieux, économe en énergie.",
    price: 119,
    specs: [
      { key: "noise_level", value: "22", unit: "dB" },
      { key: "airflow", value: "790", unit: "m3/h" },
      { key: "power", value: "18", unit: "W" },
    ],
    reviews: [
      { sourceName: "Amazon", rating: 4.6, reviewCount: 920 },
      { sourceName: "Darty", rating: 4.5, reviewCount: 140 },
    ],
    expertScores: [{ sourceName: "Which?", score: 17, weight: 1.3 }],
  },

  // ── RAFRAÎCHISSEURS D'AIR ─────────────────────────────────────────────────
  {
    name: "Olimpia Splendid Brezza 10",
    brand: "Olimpia Splendid",
    category: "AIR_COOLER" as const,
    description:
      "Rafraîchisseur d'air évaporatif 3 en 1, ventilateur + humidificateur + purificateur.",
    price: 149,
    specs: [
      { key: "tank_size", value: "10", unit: "L" },
      { key: "airflow", value: "600", unit: "m3/h" },
      { key: "power", value: "65", unit: "W" },
      { key: "noise_level", value: "42", unit: "dB" },
    ],
    reviews: [
      { sourceName: "Darty", rating: 4.2, reviewCount: 380 },
      { sourceName: "Amazon", rating: 4.0, reviewCount: 760 },
    ],
    expertScores: [{ sourceName: "UFC Que Choisir", score: 14, weight: 1.0 }],
  },
  {
    name: "Bionaire BAP1700",
    brand: "Bionaire",
    category: "AIR_COOLER" as const,
    description: "Rafraîchisseur évaporatif portable, réservoir 7 L.",
    price: 79,
    specs: [
      { key: "tank_size", value: "7", unit: "L" },
      { key: "airflow", value: "400", unit: "m3/h" },
      { key: "power", value: "45", unit: "W" },
      { key: "noise_level", value: "38", unit: "dB" },
    ],
    reviews: [
      { sourceName: "Amazon", rating: 3.9, reviewCount: 540 },
      { sourceName: "Boulanger", rating: 4.0, reviewCount: 90 },
    ],
    expertScores: [],
  },
  {
    name: "Honeywell CL25AE",
    brand: "Honeywell",
    category: "AIR_COOLER" as const,
    description: "Rafraîchisseur d'air avec réservoir 6,8 L et télécommande.",
    price: 99,
    specs: [
      { key: "tank_size", value: "6.8", unit: "L" },
      { key: "airflow", value: "450", unit: "m3/h" },
      { key: "power", value: "50", unit: "W" },
      { key: "noise_level", value: "52", unit: "dB" },
    ],
    reviews: [
      { sourceName: "Amazon", rating: 4.1, reviewCount: 1100 },
      { sourceName: "Fnac", rating: 3.8, reviewCount: 150 },
    ],
    expertScores: [],
  },
  {
    name: "Technibel PAE11",
    brand: "Technibel",
    category: "AIR_COOLER" as const,
    description: "Rafraîchisseur silencieux grand réservoir 15 L.",
    price: 199,
    specs: [
      { key: "tank_size", value: "15", unit: "L" },
      { key: "airflow", value: "750", unit: "m3/h" },
      { key: "power", value: "80", unit: "W" },
      { key: "noise_level", value: "39", unit: "dB" },
    ],
    reviews: [
      { sourceName: "Darty", rating: 4.4, reviewCount: 210 },
      { sourceName: "Boulanger", rating: 4.3, reviewCount: 120 },
    ],
    expertScores: [{ sourceName: "UFC Que Choisir", score: 15, weight: 1.0 }],
  },
  {
    name: "Rowenta Turbo Cool PAE90",
    brand: "Rowenta",
    category: "AIR_COOLER" as const,
    description: "Rafraîchisseur connecté avec réservoir 12 L.",
    price: 179,
    specs: [
      { key: "tank_size", value: "12", unit: "L" },
      { key: "airflow", value: "680", unit: "m3/h" },
      { key: "power", value: "70", unit: "W" },
      { key: "noise_level", value: "44", unit: "dB" },
    ],
    reviews: [
      { sourceName: "Fnac", rating: 4.2, reviewCount: 300 },
      { sourceName: "Amazon", rating: 4.1, reviewCount: 620 },
    ],
    expertScores: [],
  },

  // ── CLIMATISEURS MOBILES ──────────────────────────────────────────────────
  {
    name: "Delonghi Pinguino PAC AN97",
    brand: "DeLonghi",
    category: "MOBILE_AC" as const,
    description: "Climatiseur mobile 11 000 BTU sans tuyau d'évacuation.",
    price: 399,
    specs: [
      { key: "cooling_power", value: "11000", unit: "BTU" },
      { key: "noise_level", value: "55", unit: "dB" },
      { key: "energy_rating", value: "3", unit: "stars" },
    ],
    reviews: [
      { sourceName: "Darty", rating: 4.3, reviewCount: 680 },
      { sourceName: "Amazon", rating: 4.1, reviewCount: 2400 },
    ],
    expertScores: [{ sourceName: "UFC Que Choisir", score: 15, weight: 1.0 }],
  },
  {
    name: "Electrolux EXP26U338CW",
    brand: "Electrolux",
    category: "MOBILE_AC" as const,
    description: "Climatiseur mobile 9 000 BTU, classe A+.",
    price: 499,
    specs: [
      { key: "cooling_power", value: "9000", unit: "BTU" },
      { key: "noise_level", value: "52", unit: "dB" },
      { key: "energy_rating", value: "4", unit: "stars" },
    ],
    reviews: [
      { sourceName: "Fnac", rating: 4.4, reviewCount: 420 },
      { sourceName: "Boulanger", rating: 4.2, reviewCount: 230 },
    ],
    expertScores: [{ sourceName: "Which?", score: 16, weight: 1.2 }],
  },
  {
    name: "Whirlpool PACF29CO WiFi",
    brand: "Whirlpool",
    category: "MOBILE_AC" as const,
    description: "Climatiseur mobile connecté 9 000 BTU avec contrôle Wi-Fi.",
    price: 549,
    specs: [
      { key: "cooling_power", value: "9000", unit: "BTU" },
      { key: "noise_level", value: "50", unit: "dB" },
      { key: "energy_rating", value: "4", unit: "stars" },
    ],
    reviews: [
      { sourceName: "Darty", rating: 4.5, reviewCount: 190 },
      { sourceName: "Amazon", rating: 4.2, reviewCount: 380 },
    ],
    expertScores: [{ sourceName: "Which?", score: 15, weight: 1.0 }],
  },
  {
    name: "Midea MPPD-12CRN1",
    brand: "Midea",
    category: "MOBILE_AC" as const,
    description: "Climatiseur mobile 12 000 BTU bon rapport qualité-prix.",
    price: 329,
    specs: [
      { key: "cooling_power", value: "12000", unit: "BTU" },
      { key: "noise_level", value: "58", unit: "dB" },
      { key: "energy_rating", value: "2", unit: "stars" },
    ],
    reviews: [
      { sourceName: "Amazon", rating: 4.0, reviewCount: 880 },
      { sourceName: "Boulanger", rating: 3.8, reviewCount: 150 },
    ],
    expertScores: [],
  },
  {
    name: "Olimpia Splendid Unico Smart",
    brand: "Olimpia Splendid",
    category: "MOBILE_AC" as const,
    description: "Climatiseur monobloc sans tuyau 10 000 BTU, app contrôl.",
    price: 699,
    specs: [
      { key: "cooling_power", value: "10000", unit: "BTU" },
      { key: "noise_level", value: "49", unit: "dB" },
      { key: "energy_rating", value: "5", unit: "stars" },
    ],
    reviews: [
      { sourceName: "Darty", rating: 4.6, reviewCount: 340 },
      { sourceName: "Fnac", rating: 4.5, reviewCount: 280 },
      { sourceName: "Amazon", rating: 4.4, reviewCount: 720 },
    ],
    expertScores: [
      { sourceName: "UFC Que Choisir", score: 17, weight: 1.2 },
      { sourceName: "Which?", score: 18, weight: 1.3 },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create review sources
  for (const source of SOURCES) {
    await prisma.reviewSource.upsert({
      where: { name: source.name },
      create: source,
      update: source,
    });
  }

  const sourceMap = new Map(
    (await prisma.reviewSource.findMany()).map((s) => [s.name, s])
  );

  for (const p of PRODUCTS) {
    // Create product
    const product = await prisma.product.upsert({
      where: { ean: `EAN_${p.brand.replace(/\s/g, "_")}_${p.name.replace(/\s/g, "_")}` },
      create: {
        name: p.name,
        brand: p.brand,
        category: p.category,
        description: p.description,
        price: p.price,
        ean: `EAN_${p.brand.replace(/\s/g, "_")}_${p.name.replace(/\s/g, "_")}`,
      },
      update: {
        description: p.description,
        price: p.price,
      },
    });

    // Create specs
    for (const spec of p.specs) {
      await prisma.productSpecification.upsert({
        where: { productId_key: { productId: product.id, key: spec.key } },
        create: { productId: product.id, ...spec },
        update: { value: spec.value, unit: spec.unit },
      });
    }

    // Create review aggregates
    for (const r of p.reviews) {
      const source = sourceMap.get(r.sourceName);
      if (!source) continue;
      await prisma.productReviewAggregate.upsert({
        where: { productId_sourceId: { productId: product.id, sourceId: source.id } },
        create: {
          productId: product.id,
          sourceId: source.id,
          rating: r.rating,
          reviewCount: r.reviewCount,
        },
        update: { rating: r.rating, reviewCount: r.reviewCount },
      });
    }

    // Create expert scores
    for (const e of p.expertScores) {
      await prisma.expertScore.upsert({
        where: { productId_sourceName: { productId: product.id, sourceName: e.sourceName } },
        create: { productId: product.id, ...e },
        update: { score: e.score, weight: e.weight },
      });
    }

    // Calculate and store product score
    const reviewInputs = p.reviews.map((r) => {
      const source = sourceMap.get(r.sourceName)!;
      return {
        sourceName: r.sourceName,
        rating: r.rating,
        reviewCount: r.reviewCount,
        trustScore: source.trustScore,
      };
    });

    const scores = calculateProductScore(
      reviewInputs,
      p.expertScores,
      p.specs,
      p.category
    );

    await prisma.productScore.upsert({
      where: { productId: product.id },
      create: { productId: product.id, ...scores },
      update: { ...scores, lastCalculatedAt: new Date() },
    });

    console.log(`  ✅ ${p.name} — score: ${scores.finalScore}`);
  }

  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
