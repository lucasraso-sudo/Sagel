# 📋 Passation — Sagel (comparateur-produits)

> Résumé de reprise pour la prochaine session. Pour le détail complet, voir `ARCHITECTURE.md` et `CLAUDE.md`.

## Contexte général
**Sagel** (ex « Qualitas ») — comparateur de produits FR (électroménager, confort thermique). **287 produits / 24 catégories**. En ligne : https://qualitas-rho.vercel.app. Données prix/avis **illustratives (démo)** tant qu'aucun vrai flux marchand n'est branché (`PRICES_LIVE=false`).

## Architecture
- **Stack** : Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4 (`@theme` dans `app/globals.css`), Prisma 7 + `@prisma/adapter-pg`.
- **Dev local** : PostgreSQL embarqué **PGlite** (pas de Postgres installé). `npm run db:server` (port 5432) **puis** `npm run dev`. ⚠️ **Une seule connexion** → arrêter `next dev` avant tout script Prisma/seed (sinon P1001).
- **Prod** : **Vercel + Neon Postgres**. Le site lit Neon en direct (re-seed Neon = MAJ immédiate sans redeploy). Deploy : `npx vercel deploy --prod --yes --scope lucasr33 --token=<TOKEN>`.
- **Monétisation** : modèle `Offer`, route `/api/go/[offerId]` (wrap affilié + tracking clic, **await obligatoire** sur PGlite), dashboard `/dashboard`, importeur Awin.

## Conventions importantes
- Taxonomie unique du menu : `app/catalog.ts`. Constantes UI partagées : `app/constants.ts` (`CATEGORY_EMOJI`, `MERCHANT_EMOJI`, `SPEC_LABELS`).
- Score **/20 stocké, affiché /100** ; cibles techniques par catégorie dans `lib/scoring/calculateProductScore.ts` (`SPEC_TARGETS`).
- Identifiant produit fiable = `(brand, mpn)` ; `ean` null tant que non sourcé. Nom affiché nettoyé par `modelName()`.
- Marchands actifs : **Darty, Fnac, Rue du Commerce, Cdiscount**.
- **Toujours `npm run build` en local avant tout redeploy** (`next dev` ne typecheck pas tout).
- **Validation explicite requise avant toute modif multi-système** (deploy, Neon, env prod, cron, flux, flag prod). Alternatives expliquées simplement.

## État exact du développement
- ✅ Code review effectuée ; 3 correctifs appliqués (cron protégé par `CRON_SECRET` fail-closed ; constantes dédupliquées dans `app/constants.ts` ; incohérence « Puissance froid » corrigée).
- ✅ **Code mort supprimé et validé** : `specLabel` + `SPEC_LABELS` local (explainScore.ts), alias `ScoreBadge`, `affiliateEnabled`.
- ✅ **Build OK, TypeScript OK**, aucun import cassé. Lint : 3 erreurs **préexistantes** `react-hooks/set-state-in-effect` (`compare/page.tsx:28`, `search/page.tsx:42`) — non corrigées (hors périmètre).
- ⚠️ Pas de déploiement effectué (l'utilisateur vérifie d'abord en local).

## Prochaine tâche
**Refactor du parseur CSV** (explicitement reporté à une session dédiée) : `scripts/import-feed.ts` a son propre parseur (`splitLine`/`parseCsv`/`toBool`) qui **duplique** `lib/offers/csv.ts` (`parseDelimited`/`toBool`, utilisé seulement par `lib/offers/awinFeed.ts`). → Faire pointer `import-feed.ts` sur `lib/offers/csv.ts` et adapter `rowToFeed`.

_Backlog : corriger les 2 lint `set-state-in-effect` ; brancher le vrai flux Awin puis `PRICES_LIVE=true` ; planifier `import:awin` + `refresh:prices` ; régénérer/révoquer secrets Neon + token Vercel._

## Fichiers à consulter en priorité
1. **`ARCHITECTURE.md`** — guide complet de reprise (procédures détaillées).
2. **`CLAUDE.md`** — contexte projet + règles de travail + secrets.
3. `app/catalog.ts` / `app/constants.ts` — taxonomie & constantes partagées.
4. `lib/scoring/calculateProductScore.ts` — moteur de score.
5. `scripts/import-feed.ts` + `lib/offers/csv.ts` — **cibles du prochain refactor**.
