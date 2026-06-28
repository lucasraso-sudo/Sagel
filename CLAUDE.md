@AGENTS.md

# Sagel — contexte projet (lire `ARCHITECTURE.md` pour le détail complet)

Comparateur de produits FR (électroménager, confort thermique) — Next.js 16 +
Prisma 7 + PostgreSQL. Marque **Sagel** (ex « Qualitas »). En ligne :
https://qualitas-rho.vercel.app — **287 produits / 24 catégories**. Données
prix/avis **illustratives** (démo) jusqu'au branchement d'un vrai flux marchand.

## À savoir absolument

- **Dev local = PostgreSQL embarqué (PGlite)**, pas de Postgres installé.
  Lancer : `npm run db:server` (PGlite sur :5432) **puis** `npm run dev`.
  Ces process ne survivent pas à la session → les relancer.
- ⚠️ **PGlite n'a qu'UNE connexion** → **arrêter `next dev` avant tout script
  Prisma/seed** (`db push`, `db:seed`, `db:seed:offers`, `import:*`,
  `refresh:prices`), sinon erreur P1001. Relancer `dev` après (et après modif `.env`).
- **Avant tout redéploiement, lancer `npm run build` en local** : `next dev` ne
  typecheck pas tout et laisse passer des erreurs que Vercel bloque.
- **Prod = Vercel + Neon Postgres.** Le site lit Neon en direct (re-seed Neon =
  mise à jour immédiate, sans redeploy). Redeploy :
  `npx vercel deploy --prod --yes --scope lucasr33 --token=<TOKEN>` (token fourni
  par l'utilisateur). Scripts contre Neon : préfixer `DATABASE_URL="<neon>"`.

## Règles de travail (préférences utilisateur — IMPORTANT)

- **Toujours demander une validation explicite avant une modification
  multi-système** : déploiement Vercel, base distante Neon, variables d'env prod,
  import de flux, cron, bascule de flag visible en prod. Le travail purement local
  et réversible (édition de fichiers, base/serveur local, lecture, builds de test)
  ne nécessite pas d'accord préalable.
- En proposant des **alternatives**, les détailler **simplement** (ce que c'est,
  avantages/inconvénients, recommandation), sans jargon non expliqué.

## Conventions clés

- Source unique de la taxonomie du menu : `app/catalog.ts` (alimente mégamenu + accueil).
- Score /20 stocké, affiché /100. Critères techniques par catégorie : `lib/scoring/calculateProductScore.ts` (`SPEC_TARGETS`).
- Identifiant produit fiable = `(brand, mpn)` ; `ean` null tant que non sourcé. Nom affiché nettoyé par `modelName()`.
- Prix « indicatifs » tant que `PRICES_LIVE=false` dans `app/config.ts`.
- Ajouter une catégorie / brancher un flux / déployer : procédures détaillées dans **`ARCHITECTURE.md`**.

## Secrets

`DATABASE_URL` (Neon) et token Vercel ont été partagés en session → **à régénérer/révoquer**.
Identifiants d'affiliation en env (voir `.env.example`), vides par défaut.
