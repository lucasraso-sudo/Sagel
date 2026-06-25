import type { Category } from "@/app/generated/prisma/enums";

interface ScoreBreakdown {
  finalScore: number;
  userScore: number;
  expertScore: number;
  technicalScore: number;
  confidenceScore: number;
}

interface ProductContext {
  name: string;
  brand: string;
  category: Category;
  price?: number | null;
  specifications: Array<{ key: string; value: string; unit?: string | null }>;
}

// ---------------------------------------------------------------------------
// Human-readable spec labels
// ---------------------------------------------------------------------------

const SPEC_LABELS: Record<string, string> = {
  noise_level: "niveau sonore",
  airflow: "débit d'air",
  power: "consommation",
  cooling_power: "puissance de refroidissement",
  tank_size: "capacité du réservoir",
  energy_rating: "efficacité énergétique",
};

function specLabel(key: string): string {
  return SPEC_LABELS[key] ?? key.replace(/_/g, " ");
}

// ---------------------------------------------------------------------------
// Prose generator — data-driven, no generic filler
// ---------------------------------------------------------------------------

export function explainScore(
  product: ProductContext,
  scores: ScoreBreakdown
): {
  summary: string;
  pros: string[];
  cons: string[];
} {
  const specMap = new Map(
    product.specifications.map((s) => [s.key, { value: s.value, unit: s.unit }])
  );

  const pros: string[] = [];
  const cons: string[] = [];

  // User score commentary
  if (scores.userScore >= 16) {
    pros.push(
      `Très bien noté par les utilisateurs (${scores.userScore.toFixed(1)}/20)`
    );
  } else if (scores.userScore >= 13) {
    pros.push(`Bon avis utilisateurs (${scores.userScore.toFixed(1)}/20)`);
  } else if (scores.userScore > 0 && scores.userScore < 11) {
    cons.push(
      `Note utilisateurs modeste (${scores.userScore.toFixed(1)}/20)`
    );
  }

  // Expert score commentary
  if (scores.expertScore >= 16) {
    pros.push(`Approuvé par les experts (${scores.expertScore.toFixed(1)}/20)`);
  } else if (scores.expertScore > 0 && scores.expertScore < 11) {
    cons.push(`Score expert limité (${scores.expertScore.toFixed(1)}/20)`);
  }

  // Technical specs commentary per category
  if (product.category === "FAN") {
    const noise = specMap.get("noise_level");
    if (noise) {
      const v = parseFloat(noise.value);
      if (v < 35) pros.push(`Silencieux (${v} ${noise.unit ?? "dB"})`);
      else if (v > 55) cons.push(`Niveau sonore élevé (${v} ${noise.unit ?? "dB"})`);
    }
    const airflow = specMap.get("airflow");
    if (airflow) {
      const v = parseFloat(airflow.value);
      if (v > 700)
        pros.push(`Débit d'air puissant (${v} ${airflow.unit ?? "m³/h"})`);
    }
    const power = specMap.get("power");
    if (power) {
      const v = parseFloat(power.value);
      if (v < 30)
        pros.push(`Très économe en énergie (${v} ${power.unit ?? "W"})`);
      else if (v > 80)
        cons.push(`Consommation élevée (${v} ${power.unit ?? "W"})`);
    }
  }

  if (product.category === "AIR_COOLER") {
    const tank = specMap.get("tank_size");
    if (tank) {
      const v = parseFloat(tank.value);
      if (v >= 10)
        pros.push(`Grand réservoir (${v} ${tank.unit ?? "L"}) — autonomie longue`);
    }
    const noise = specMap.get("noise_level");
    if (noise) {
      const v = parseFloat(noise.value);
      if (v < 45) pros.push(`Discret (${v} ${noise.unit ?? "dB"})`);
    }
  }

  if (product.category === "MOBILE_AC") {
    const cooling = specMap.get("cooling_power");
    if (cooling) {
      const v = parseFloat(cooling.value);
      if (v >= 9000)
        pros.push(`Puissance de refroidissement élevée (${v} ${cooling.unit ?? "BTU"})`);
    }
    const noise = specMap.get("noise_level");
    if (noise) {
      const v = parseFloat(noise.value);
      if (v < 50) pros.push(`Relativement silencieux (${v} ${noise.unit ?? "dB"})`);
      else if (v > 60) cons.push(`Assez bruyant (${v} ${noise.unit ?? "dB"})`);
    }
    const energy = specMap.get("energy_rating");
    if (energy) {
      const v = parseFloat(energy.value);
      if (v >= 4) pros.push(`Efficacité énergétique élevée (${v} étoiles)`);
    }
  }

  // Price commentary
  if (product.price) {
    if (product.price < 60) pros.push(`Prix accessible (${product.price} €)`);
    else if (product.price > 300)
      cons.push(`Investissement conséquent (${product.price} €)`);
  }

  // Confidence note
  if (scores.confidenceScore < 40) {
    cons.push(`Score calculé sur peu de données (fiabilité ${scores.confidenceScore}%)`);
  }

  // Build summary
  const scoreLabel =
    scores.finalScore >= 16
      ? "excellent"
      : scores.finalScore >= 13
        ? "très bon"
        : scores.finalScore >= 10
          ? "correct"
          : "limité";

  const primaryPro = pros[0] ?? null;
  const secondaryPro = pros[1] ?? null;

  let summary = `Le ${product.name} affiche un score ${scoreLabel} de ${scores.finalScore.toFixed(1)}/20`;
  if (primaryPro) summary += `. ${primaryPro}`;
  if (secondaryPro) summary += ` et ${secondaryPro.toLowerCase()}`;
  summary += ".";

  return { summary, pros, cons };
}
