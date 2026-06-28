import Link from "next/link";
import { SearchBar } from "@/app/components/SearchBar";
import { CategoryExplorer } from "@/app/components/CategoryExplorer";

const EXAMPLE_QUERIES = [
  "ventilateur silencieux pour chambre",
  "climatiseur mobile pas cher",
  "rafraîchisseur d'air puissant pour salon",
  "meilleur ventilateur de table",
];

const SCORE_AXES = [
  {
    icon: "⭐",
    label: "Avis utilisateurs",
    desc: "Agrégation des avis plateformes (Darty, Fnac, Amazon…) pondérés par volume et fiabilité.",
  },
  {
    icon: "🔬",
    label: "Tests experts",
    desc: "Tests indépendants UFC Que Choisir, Which?, Consumer Reports.",
  },
  {
    icon: "⚙️",
    label: "Score technique",
    desc: "Analyse des specs clés : performance, consommation et confort d'usage.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="px-6 pt-10 pb-14 text-center max-w-3xl mx-auto">
        <span className="inline-block bg-gold text-ink text-[0.72rem] font-semibold uppercase tracking-[0.08em] px-3.5 py-1.5 rounded-full mb-6">
          ✦ Le comparateur qualité
        </span>
        <h1 className="font-serif text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink mb-4">
          Achetez mieux,
          <br />
          pas <em className="not-italic text-brand">plus cher</em>.
        </h1>
        <p className="text-base text-muted leading-relaxed max-w-lg mx-auto mb-9">
          Sagel analyse chaque produit — avis réels, tests experts et
          performance technique — pour vous donner un score unique et honnête.
        </p>

        <SearchBar large />

        <div className="flex flex-wrap gap-2 justify-center pt-5">
          {EXAMPLE_QUERIES.map((q) => (
            <Link
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="text-[0.8rem] bg-white border-[1.5px] border-line text-muted hover:text-brand hover:border-brand px-3.5 py-1.5 rounded-full transition-colors"
            >
              {q}
            </Link>
          ))}
        </div>
      </section>

      {/* Score explainer */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="font-serif text-2xl font-bold text-ink mb-8 text-center">
          Comment fonctionne le score&nbsp;?
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {SCORE_AXES.map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-line p-6 text-center"
            >
              <div className="text-[2.4rem] mb-3">{item.icon}</div>
              <div className="font-serif font-semibold text-[1.15rem] text-ink mb-2">
                {item.label}
              </div>
              <p className="text-[0.82rem] text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="font-serif text-2xl font-bold text-ink mb-6">
          Explorez par catégorie
        </h2>
        <CategoryExplorer />
      </section>
    </div>
  );
}
