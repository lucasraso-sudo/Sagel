import Link from "next/link";
import { SearchBar } from "@/app/components/SearchBar";

const EXAMPLE_QUERIES = [
  "ventilateur silencieux pour chambre",
  "climatiseur mobile pas cher",
  "rafraîchisseur d'air puissant pour salon",
  "meilleur ventilateur de table",
];

const CATEGORIES = [
  {
    slug: "ventilateurs",
    label: "Ventilateurs",
    emoji: "🌀",
    desc: "Brasseurs d'air, colonnes, tours et ventilateurs de table",
  },
  {
    slug: "rafraichisseurs-air",
    label: "Rafraîchisseurs d'air",
    emoji: "💧",
    desc: "Rafraîchisseurs évaporatifs, brumisateurs, 3-en-1",
  },
  {
    slug: "climatiseurs-mobiles",
    label: "Climatiseurs mobiles",
    emoji: "❄️",
    desc: "Climatiseurs monobloc et split mobile, connectés",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-gray-50 pt-16 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Trouvez le meilleur produit <br />
            <span className="text-blue-600">en quelques secondes</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Scores transparents, données réelles. Sans affiliation, sans biais.
          </p>
          <SearchBar large />

          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {EXAMPLE_QUERIES.map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="text-sm bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 px-3 py-1.5 rounded-full transition-colors shadow-sm"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Score explainer */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-xl font-bold text-gray-800 mb-8 text-center">
          Comment fonctionne le score ?
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: "⭐",
              label: "Avis utilisateurs",
              pct: "55%",
              desc: "Agrégation des avis plateformes (Darty, Fnac, Amazon…) pondérés par volume et fiabilité.",
            },
            {
              icon: "🔬",
              label: "Score expert",
              pct: "20%",
              desc: "Tests indépendants UFC Que Choisir, Which?, Consumer Reports.",
            },
            {
              icon: "⚙️",
              label: "Score technique",
              pct: "25%",
              desc: "Analyse des specs clés : bruit, débit d'air, consommation selon la catégorie.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="font-bold text-2xl text-blue-600 mb-1">{item.pct}</div>
              <div className="font-semibold text-gray-800 mb-2">{item.label}</div>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Catégories</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-100 transition-all group"
            >
              <div className="text-3xl mb-3">{cat.emoji}</div>
              <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {cat.label}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
