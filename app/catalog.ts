// Shared product taxonomy — single source of truth for the top "Produits"
// megamenu (SiteHeader) and the home page category explorer.
//
// Two levels: famille (CatalogFamily) › sous-famille (CatalogItem).
// A sub-family with an `href` has a real category page; without one it is shown
// as "Bientôt" (coming soon). A family is marked `soon` when none of its
// sub-families are live yet.

export interface CatalogItem {
  label: string;
  emoji: string;
  /** Present only for sub-families that have a real page. */
  href?: string;
}

export interface CatalogFamily {
  title: string;
  emoji: string;
  /** True for families whose sub-families don't exist yet. */
  soon?: boolean;
  items: CatalogItem[];
}

export const PRODUCT_FAMILIES: CatalogFamily[] = [
  {
    title: "Climatisation, chauffage & confort",
    emoji: "🌡️",
    items: [
      { label: "Ventilateurs", emoji: "🌀", href: "/category/ventilateurs" },
      { label: "Rafraîchisseurs d'air", emoji: "💧", href: "/category/rafraichisseurs-air" },
      { label: "Climatiseurs mobiles", emoji: "🧊", href: "/category/climatiseurs-mobiles" },
      { label: "Chauffages d'appoint", emoji: "🔥", href: "/category/chauffages-appoint" },
      { label: "Purificateurs d'air", emoji: "🌬️", href: "/category/purificateurs-air" },
      { label: "Déshumidificateurs", emoji: "💨", href: "/category/deshumidificateurs" },
      { label: "Radiateurs électriques", emoji: "♨️", href: "/category/radiateurs-electriques" },
      { label: "Humidificateurs", emoji: "💦", href: "/category/humidificateurs" },
      { label: "Thermostats connectés", emoji: "🌡️", href: "/category/thermostats-connectes" },
    ],
  },
  {
    title: "Gros électroménager",
    emoji: "🧺",
    items: [
      { label: "Lave-linge", emoji: "🧺", href: "/category/lave-linge" },
      { label: "Lave-vaisselle", emoji: "🍽️", href: "/category/lave-vaisselle" },
      { label: "Réfrigérateurs", emoji: "🧊", href: "/category/refrigerateurs" },
      { label: "Sèche-linge", emoji: "🌀", href: "/category/seche-linge" },
      { label: "Congélateurs", emoji: "❄️", href: "/category/congelateurs" },
      { label: "Fours & cuisinières", emoji: "🔥", href: "/category/fours-cuisinieres" },
      { label: "Plaques de cuisson", emoji: "🍳", href: "/category/plaques-cuisson" },
      { label: "Hottes aspirantes", emoji: "💨", href: "/category/hottes-aspirantes" },
      { label: "Caves à vin", emoji: "🍷", href: "/category/caves-a-vin" },
    ],
  },
  {
    title: "Petit électroménager",
    emoji: "☕",
    items: [
      { label: "Cafetières & expresso", emoji: "☕", href: "/category/cafetieres-expresso" },
      { label: "Friteuses & air fryers", emoji: "🍟", href: "/category/friteuses-air-fryers" },
      { label: "Robots cuiseurs", emoji: "🍲", href: "/category/robots-cuiseurs" },
      { label: "Bouilloires & théières", emoji: "🫖", href: "/category/bouilloires-theieres" },
      { label: "Grille-pain", emoji: "🍞", href: "/category/grille-pain" },
      { label: "Blenders & mixeurs", emoji: "🥤", href: "/category/blenders-mixeurs" },
      { label: "Robots pâtissiers", emoji: "🎂" },
      { label: "Micro-ondes", emoji: "🍱" },
      { label: "Fers & centrales vapeur", emoji: "♨️" },
    ],
  },
  {
    title: "Entretien de la maison",
    emoji: "🧹",
    soon: true,
    items: [
      { label: "Aspirateurs traîneau", emoji: "🌀" },
      { label: "Aspirateurs balai", emoji: "🧹" },
      { label: "Aspirateurs robots", emoji: "🤖" },
      { label: "Nettoyeurs vapeur", emoji: "♨️" },
      { label: "Nettoyeurs haute pression", emoji: "🫧" },
      { label: "Shampouineuses", emoji: "🧼" },
    ],
  },
  {
    title: "Image & son",
    emoji: "📺",
    soon: true,
    items: [
      { label: "Téléviseurs", emoji: "📺" },
      { label: "Barres de son", emoji: "🔊" },
      { label: "Home cinéma", emoji: "🎬" },
      { label: "Enceintes", emoji: "🔈" },
      { label: "Casques & écouteurs", emoji: "🎧" },
      { label: "Vidéoprojecteurs", emoji: "📽️" },
    ],
  },
  {
    title: "Maison connectée",
    emoji: "💡",
    soon: true,
    items: [
      { label: "Éclairage connecté", emoji: "💡" },
      { label: "Caméras & sécurité", emoji: "📹" },
      { label: "Sonnettes vidéo", emoji: "🔔" },
      { label: "Prises connectées", emoji: "🔌" },
      { label: "Assistants vocaux", emoji: "🗣️" },
    ],
  },
];
