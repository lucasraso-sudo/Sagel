# Sagel — Architecture & guide de reprise

> Document de référence pour reprendre le projet sans contexte préalable.
> Dernière mise à jour : 2026-06-28.

**Sagel** est un comparateur de produits (électroménager, confort thermique…)
pour le marché français. Il note chaque produit sur **/100** (transparent, sans
biais) à partir des avis utilisateurs, des tests experts et des specs techniques,
et redirige vers les marchands via des liens (affiliés à terme).

- **En ligne** : https://qualitas-rho.vercel.app (projet Vercel `qualitas`, scope `lucasr33`).
- **Marque** : « Sagel » (anciennement « Qualitas » — le projet/URL Vercel garde l'ancien nom).
- **État** : **287 produits sur 24 catégories**. Données prix/avis **illustratives** (démo) tant que le flux marchand réel n'est pas branché.

---

## 1. Stack

- **Next.js 16** (App Router, Turbopack) — ⚠️ version avec breaking changes, voir `AGENTS.md`.
- **React 19**, **TypeScript**, **Tailwind CSS v4** (tokens via `@theme` dans `app/globals.css`).
- **Prisma 7** + `@prisma/adapter-pg` (driver `pg`) → **PostgreSQL**.
- Polices : **Playfair Display** (serif, titres/logo) + **Inter** (texte), via `next/font`.

---

## 2. Bases de données

### Local (dev) — PostgreSQL embarqué (PGlite)
Cette machine **n'a pas Postgres/Docker installé**. On utilise **PGlite** (Postgres
WASM) exposé sur un vrai port TCP via `@electric-sql/pglite-socket`, donc l'app s'y
connecte sans changement de code.

- `npm run db:server` → `scripts/pglite-server.ts` : PGlite sur `127.0.0.1:5432`, données dans `.pglite-data/` (gitignored).
- `.env` `DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"`.
- **PGlite n'accepte qu'UNE connexion** → `lib/db/client.ts` plafonne le pool à `max:1` pour les URL `localhost`/`127.0.0.1` uniquement.

> ⚠️ **GOTCHA CRITIQUE** : à cause de la connexion unique, il faut **arrêter `next dev`
> avant de lancer tout script Prisma/seed** (`prisma db push`, `db:seed`,
> `db:seed:offers`, `import:*`, `refresh:prices`), sinon erreur **P1001** (le serveur
> dev détient la connexion). Relancer `next dev` ensuite (aussi requis après modif de
> `.env`, car le client Prisma est mis en cache dans `globalThis`).

### Production — Neon Postgres
- Base **Neon** (région eu-central-1), URL en variable d'env Vercel `DATABASE_URL` (Production + Preview).
- L'app lit Neon **en direct** → mettre à jour les données (re-seed Neon) suffit pour rafraîchir le site, **sans redéploiement**.
- Pour les scripts contre Neon : préfixer `DATABASE_URL="<neon>"` devant la commande (le local n'est pas impacté, base séparée). Le pool `max:1` ne s'applique qu'au local.
- Neon utilise la connexion **directe** (non « pooled ») — à passer en pooled pour la montée en charge serverless.

---

## 3. Déploiement

- **Vercel** (déploiement direct via CLI, pas de remote GitHub lié).
- `build` = `prisma generate && next build` (le client Prisma généré dans `app/generated/prisma` est **gitignored** → doit être régénéré au build).
- Commande de redéploiement :
  `npx vercel deploy --prod --yes --scope lucasr33 --token=<TOKEN>`
  (un **token Vercel** est requis ; il est créé par l'utilisateur dans son compte).
- **Toujours lancer un build de contrôle local** (`npm run build`) **avant de redéployer** : `next dev` ne fait pas le typecheck complet et laisse passer des erreurs TS que `next build` (et donc Vercel) bloquent.

### Flux type pour ajouter des données en prod
1. Modifier `prisma/seed.ts` (+ plomberie : schéma, types, scoring…).
2. Local : arrêter dev → `prisma generate` → `prisma db push` → `db:seed` → `db:seed:offers` → **build de contrôle** → relancer dev → vérifier.
3. Prod (**demander la validation à l'utilisateur d'abord**) : `DATABASE_URL=<neon> prisma db push` → `db:seed` → `db:seed:offers`, puis **redéployer** si du code a changé.

---

## 4. Modèle de données (`prisma/schema.prisma`)

- **Product** : `id, name, brand, category (enum), description, image, ean? (unique), mpn, price?, …`
  - Clé d'unicité **`@@unique([brand, mpn])`** — identifiant fiable du modèle.
  - `ean` (EAN-13/GTIN) = clé maître à terme, **null** tant que non sourcée d'un flux.
- **Offer** : `productId, merchant, merchantSku?, url, isAffiliateUrl, price, currency, inStock, lastUpdated, clickCount, lastClickedAt`
  - `@@unique([productId, merchant])`.
  - `isAffiliateUrl=true` quand `url` est déjà un deeplink affilié (ex. Awin) → `/api/go` ne le ré-enrobe pas.
- **ProductSpecification** : `productId, key, value, unit?` (`@@unique([productId, key])`).
- **ReviewSource** : `name, type, trustScore`. **ProductReviewAggregate** : `rating (0-5), reviewCount, source`.
- **ExpertScore** : `sourceName, score (0-20), weight`.
- **ProductScore** : `userScore, expertScore, technicalScore, finalScore (0-20), confidenceScore (0-100)`.

---

## 5. Catégories (24 actives)

Type `Category` (enum Prisma + union TS) et mappings dans **`app/types/index.ts`**
(`CATEGORY_LABELS`, `CATEGORY_SLUGS`, `CATEGORY_SLUGS_REVERSE`). La page
`/category/[slug]` est dynamique.

**Climatisation, chauffage & confort (9/9 complète)**
`FAN`(ventilateurs) · `AIR_COOLER`(rafraichisseurs-air) · `MOBILE_AC`(climatiseurs-mobiles) · `AIR_PURIFIER`(purificateurs-air) · `DEHUMIDIFIER`(deshumidificateurs) · `HEATER`(chauffages-appoint) · `RADIATOR`(radiateurs-electriques) · `HUMIDIFIER`(humidificateurs) · `THERMOSTAT`(thermostats-connectes)

**Gros électroménager (9/9 complète)**
`WASHING_MACHINE`(lave-linge) · `DISHWASHER`(lave-vaisselle) · `FRIDGE`(refrigerateurs) · `TUMBLE_DRYER`(seche-linge) · `FREEZER`(congelateurs) · `OVEN`(fours-cuisinieres) · `COOKTOP`(plaques-cuisson) · `HOOD`(hottes-aspirantes) · `WINE_CELLAR`(caves-a-vin)

**Petit électroménager (6/9)**
`COFFEE_MACHINE`(cafetieres-expresso) · `AIR_FRYER`(friteuses-air-fryers) · `COOKING_ROBOT`(robots-cuiseurs) · `KETTLE`(bouilloires-theieres) · `TOASTER`(grille-pain) · `BLENDER`(blenders-mixeurs)
**Restant** : Robots pâtissiers, Micro-ondes, Fers & centrales vapeur.

**Familles vides (à venir)** : Entretien de la maison, Image & son, Maison connectée.

### Ajouter une catégorie (checklist)
1. `prisma/schema.prisma` : valeur dans `enum Category` (ajout **additif**, sans reset).
2. `lib/scoring/calculateProductScore.ts` : entrée dans `SPEC_TARGETS` (le `Record<Category,…>` force l'exhaustivité → typecheck).
3. `app/types/index.ts` : union `Category`, `CATEGORY_LABELS`, `CATEGORY_SLUGS`, `CATEGORY_SLUGS_REVERSE`.
4. `app/catalog.ts` : ajouter le `href` à la sous-famille concernée.
5. Emoji de catégorie dans **3 fichiers** : `ProductCard.tsx`, `product/[id]/page.tsx`, `compare/page.tsx` (`CATEGORY_EMOJI`).
6. `app/api/products/route.ts` : ajouter à `VALID_CATEGORIES`.
7. `lib/recommendation/recommend.ts` : mots-clés dans `CATEGORY_KEYWORDS`.
8. Nouvelle clé de spec ? → `SPEC_LABELS` + `SPEC_INFO` (product page) + `SPEC_LABELS` (compare page).
9. `prisma/seed.ts` : ~12 produits (insérer avant le `];` final).
10. generate → db push → seed → seed:offers → **build** → vérifier → (validation) → prod.

---

## 6. Moteur de score (`lib/scoring/calculateProductScore.ts`)

- **Score final /20** = `0.55·userScore + 0.20·expertScore + 0.25·technicalScore`. Affiché **/100** (×5) côté UI.
- **userScore** : avis plateformes pondérés par `PLATFORM_WEIGHTS` (Darty 1.5, Fnac 1.4, Cdiscount 1.2, Rue du Commerce 1.15) × coefficient de volume × trustScore.
- **technicalScore** : `SPEC_TARGETS[category]` — chaque spec a une valeur idéale + `higherIsBetter`. La même clé de spec peut avoir des cibles/unités différentes **par catégorie**.
- **confidenceScore /100** : volume d'avis + diversité des sources + complétude des specs.
- `energy_class` (lettre A–G) est une spec **affichée uniquement**, hors score (valeur non numérique → ignorée par `specScore`).

### Clés de specs utilisées (label, unité)
`noise_level`(dB) · `airflow`(m³/h) · `power`(W, conso) · `cooling_power`(BTU) · `tank_size`(L) · `energy_rating`(★/5) · `cadr`(m³/h) · `coverage_area`(m²) · `extraction`(L/jour) · `heating_power`(W) · `savings`(%) · `capacity`(kg) · `spin_speed`(tr/min) · `place_settings`(couverts) · `water_use`(L) · `volume`(L) · `consumption`(kWh/an ou kWh/cycle) · `energy_class`(A–G) · `zones`(foyers) · `max_power`(W) · `extraction_rate`(m³/h) · `bottles` · `pressure`(bars) · `bowl_capacity`(L) · `slots`(fentes).

> Les **labels** (`SPEC_LABELS`) et **bulles** (`SPEC_INFO`) sont keyés par clé de spec
> (une seule définition par clé), donc volontairement génériques quand une clé est
> partagée (ex. `heating_power` chauffage/air fryer, `consumption` an/cycle).
> Bulles d'aide = composant **`InfoTooltip`** ; classe énergétique colorée = **`EnergyBadge`**.

---

## 7. Identification produit & affichage des noms

- Identifiant fiable = **(marque, MPN)**. `EAN` réservé pour la vraie clé maître (via flux).
- **`modelName(brand, name)`** (`app/types/index.ts`) retire la marque en doublon **à l'affichage** (le `name` en base garde la marque, utile recherche/SEO). Gère apostrophes et marques multi-mots (« De'Longhi », « Olimpia Splendid »).
- Décision actée : **ne pas inventer d'EAN** ; la recherche web par produit donne de mauvaises variantes.

---

## 8. Monétisation

- **Marchands v1** : `Darty, Fnac, Cdiscount, Rue du Commerce` (tous sur **Awin**). Amazon (→ PA-API) et Boulanger (→ Effiliation) à ajouter plus tard.
- **Offres** : générées par `scripts/seed-offers.ts` (2–4 marchands par produit, rotation déterministe ; liens = recherche par marque+MPN tant qu'il n'y a pas de flux).
- **Meilleur prix** : `bestPrice(product)` (`app/types/index.ts`) → « à partir de X € » sur les cartes ; section **Où acheter** sur la fiche.
- **Redirection + tracking** : **`/api/go/[offerId]`** enrobe le lien affilié côté serveur, incrémente `clickCount`/`lastClickedAt` (**await obligatoire** — PGlite perd les écritures concurrentes non attendues), puis 302 vers le marchand. Si `isAffiliateUrl`, redirige tel quel.
- **Affiliation** : `lib/affiliate.ts`, piloté par env (`*_AFFILIATE_DEEPLINK`, `AMAZON_AFFILIATE_TAG`). Vide par défaut → repli sur l'URL simple.
- **Tableau de bord clics** : `/dashboard` (lien en pied de page) + `app/api/stats/clicks/route.ts`.
- **Ingestion de flux** :
  - Générique CSV : `lib/offers/feedImporter.ts` + `lib/offers/csv.ts` + `scripts/import-feed.ts` (`npm run import:feed -- <fichier|URL>`).
  - **Awin** : `lib/offers/awinFeed.ts` (Create-a-Feed : env `AWIN_FEED_API_KEY` + `AWIN_FEED_IDS`) + `scripts/import-awin.ts` (`npm run import:awin`, ou `-- --file feeds/sample-awin.csv` pour tester sans clés). Le `aw_deep_link` est déjà tracké → importé avec `isAffiliateUrl=true`.
  - Échantillons : `feeds/sample-merchant-feed.csv`, `feeds/sample-awin.csv`.
- **Rafraîchissement de prix** : `lib/pricing/refreshPrices.ts` (+ `scripts/refresh-prices.ts`, `--watch` pour boucle quotidienne) ou `POST /api/cron/refresh-prices` (garde optionnelle `CRON_SECRET`). Le récupérateur `lib/pricing/fetchMerchantPrice.ts` est un **STUB** (±4 % simulé) à remplacer par une vraie API.
- **Résolution canonique** : `lib/offers/resolveCanonical.ts` (+ `npm run resolve:offers`) = **stub no-op**, prêt pour brancher la résolution URL/ASIN directs.
- **Prix indicatifs** : flag **`PRICES_LIVE` dans `app/config.ts`** (= `false`). Quand `false`, l'UI affiche « ≈ », « prix indicatifs (démo) ». **Passer à `true` une fois les vrais prix importés.**

### Passer le réel en production (3 branchements, même source = flux marchand)
1. Vrais prix → remplacer `fetchMerchantPrice`.
2. Vrais liens directs + tags affiliés → flux **Awin** (clés env) ; `import:awin`.
3. Basculer `PRICES_LIVE = true` ; planifier `import:awin` + `refresh:prices`.

### État Awin
Compte créé, **publisher ID `2958139`**. Candidatures **Fnac + Darty** envoyées (sur Awin). Reste : candidater **Cdiscount + Rue du Commerce**, puis récupérer **clé datafeed + feed IDs** (Toolbox → Create-a-Feed). Promotional type retenu : *Content → Comparison engine* (+ Editorial). Secteurs : Home & Garden + Electronics.

---

## 9. Design system

- Tokens dans `app/globals.css` (`@theme`) : `--color-brand` = **#0f766e** (sarcelle), `--color-brand-light` = #14b8a6, `--color-cream` #f8f7f4, `--color-ink` #1c1c1e, `--color-gold` #e9c46a, `--color-line`, `--color-muted`, `--color-danger`, + `--font-sans`/`--font-serif`.
- ⚠️ Quelques **hex codés en dur** suivent le vert de marque : `app/components/ScoreBadge.tsx` (`scoreColor`) et `app/components/SearchBar.tsx` (rgba focus). À mettre à jour en cas de changement de vert.
- **Logo** : `app/components/Logo.tsx` — **recréé en code** (SVG : cible = barre verticale, flèche fine plantée pile au centre + empennage ; wordmark « Sag » noir / « el » sarcelle). Concept : « la flèche en plein dans le mille ». *(Impossible d'extraire une image collée dans le chat ; pour un PNG exact, le placer dans `public/` et brancher.)*
- En-tête : `app/components/SiteHeader.tsx` (nav pleine largeur, logo coin gauche, mégamenu **Produits**). Taxonomie = **`app/catalog.ts`** (source unique : alimente le mégamenu ET l'explorateur d'accueil `CategoryExplorer`).

---

## 10. Scripts npm (`package.json`)

`dev` · `build` (= `prisma generate && next build`) · `start` · `lint` ·
`db:server` (PGlite) · `db:generate` · `db:migrate` · `db:seed` ·
`db:seed:offers` · `resolve:offers` · `import:feed` · `import:awin` ·
`refresh:prices` · `db:studio`.

---

## 11. Décisions importantes (récap)

1. PGlite embarqué pour le dev (pas de Postgres) ; pool `max:1` local ; **stop dev avant scripts DB**.
2. Identifiant = (marque, MPN) ; EAN null sans flux ; pas d'EAN inventé.
3. Tracking de clics en **await**.
4. Awin comme réseau v1 ; `aw_deep_link` pré-tracké → `isAffiliateUrl`.
5. Marchands = Darty/Fnac/Cdiscount/Rue du Commerce.
6. `catalog.ts` = source unique de la taxonomie.
7. `SPEC_TARGETS` par catégorie ; réutilisation de clés avec cibles propres.
8. `energy_class` = affichage seul, hors score.
9. Vercel + Neon ; build régénère Prisma ; **build de contrôle avant push**.
10. Logo en code (image collée non extractible).
11. Données démo (prix/avis/specs best-effort) jusqu'au flux réel.

### Règles de travail (préférences utilisateur)
- **Demander une validation explicite avant toute modification multi-système** (déploiement, base distante Neon, env prod, flux, cron, bascule de flag visible en prod). Le local réversible ne nécessite pas d'accord préalable.
- En proposant des **alternatives**, les détailler **simplement** (ce que c'est, avantages/inconvénients, recommandation).

---

## 12. Points restant à faire

- **Sécurité** : révoquer le token Vercel ; régénérer le mot de passe Neon (partagés en clair en session) puis mettre à jour l'env Vercel.
- Brancher le **vrai flux Awin** dès approbation marchands → `import:awin`, puis `PRICES_LIVE=true`.
- **Planifier** `import:awin` + `refresh:prices` (cron/routine quotidienne).
- Petit électroménager **étape 3** ; puis familles Entretien de la maison, Image & son, Maison connectée.
- Adaptateurs **Amazon (PA-API)** et **Boulanger (Effiliation)**.
- Remplacer les stubs `fetchMerchantPrice` et `resolveCanonical`.
- (Optionnel) domaine `sagel.fr` + renommer projet/URL Vercel après validation Awin.

---

## 13. Dettes techniques

- **Données illustratives** : prix, avis, notes, classes énergétiques et certaines specs/MPN sont best-effort, pas réels.
- **Stubs** : `fetchMerchantPrice` (simulé), `resolveCanonical` (no-op).
- **Liens = recherches** (pas la fiche exacte) tant qu'il n'y a pas de deeplinks de flux.
- **`prisma/seed.ts` très volumineux** (~3 000 lignes, 287 produits inline) — un import depuis fichiers/flux serait plus propre.
- **Clés de specs partagées** entre catégories (une seule bulle/label par clé).
- **Neon en connexion directe** (non pooled) — à passer en pooled à l'échelle.
- Re-seed Neon complet à chaque ajout (pas de migrations de données incrémentales).
- `modelName` recalculé à chaque rendu (négligeable).

---

## 14. Bugs connus

- **Centrage vertical du logo** : correction optique de 1px appliquée mais **non vérifiée au pixel** (aucun navigateur Chrome connecté pour mesurer) → léger décalage possible.
- Processus locaux (`pglite-server`, `next dev`) **ne survivent pas** à la fin de session → relancer manuellement.
- Certains liens de recherche marchands renvoient **403** en test direct (anti-bot) mais s'ouvrent normalement dans un navigateur.
- Le `name` produit contient encore la marque **en base** (retirée seulement à l'affichage via `modelName`).

---

## 15. Sécurité / secrets

- `DATABASE_URL` (Neon, avec mot de passe) : variable d'env Vercel + `.env` local (gitignored). **À régénérer** (partagé en session).
- **Token Vercel** : créé par l'utilisateur pour déployer ; **à révoquer** après chaque série de déploiements.
- Identifiants d'affiliation : en env (`AWIN_FEED_*`, `*_AFFILIATE_DEEPLINK`, `AMAZON_AFFILIATE_TAG`, `CRON_SECRET`) — voir `.env.example`. Vides par défaut.
- `.env*` et `.pglite-data/` sont gitignored.
