# Sagel

Comparateur de produits français (électroménager, confort thermique…). Chaque
produit reçoit un **score transparent sur /100** (avis utilisateurs + tests
experts + specs techniques) et des liens vers les marchands.

- **En ligne** : https://qualitas-rho.vercel.app
- **Stack** : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 · PostgreSQL
- **État** : 287 produits / 24 catégories. Prix & avis **illustratifs (démo)** tant que le flux marchand réel n'est pas branché.

> 📖 **Documentation complète & guide de reprise : [`ARCHITECTURE.md`](./ARCHITECTURE.md)**
> Contexte agent : [`CLAUDE.md`](./CLAUDE.md) · règles Next.js : [`AGENTS.md`](./AGENTS.md)

## Démarrer en local

Cette machine n'a pas Postgres installé : on utilise un **PostgreSQL embarqué
(PGlite)** exposé sur un port TCP. Il faut **deux terminaux** :

```bash
npm install
npm run db:server   # terminal 1 — PGlite sur 127.0.0.1:5432 (données dans .pglite-data/)
npm run dev         # terminal 2 — http://localhost:3000
```

Première initialisation de la base :

```bash
# (next dev doit être ARRÊTÉ : PGlite n'accepte qu'une connexion)
npx prisma db push
npm run db:seed          # produits + scores
npm run db:seed:offers   # offres marchandes
```

> ⚠️ **Toujours arrêter `npm run dev` avant un script Prisma/seed** (db push, seed,
> import, refresh), sinon erreur P1001. Relancer `dev` ensuite.

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | Next.js (`build` régénère le client Prisma) |
| `npm run db:server` | PostgreSQL embarqué PGlite (dev local) |
| `npm run db:seed` | Seed produits + scores |
| `npm run db:seed:offers` | Génère les offres marchandes |
| `npm run refresh:prices` | Rafraîchit les prix (stub simulé ; `--watch` = boucle) |
| `npm run import:awin` | Importe le flux Awin (`-- --file feeds/sample-awin.csv` pour tester) |
| `npm run import:feed` | Importe un flux CSV générique |
| `npm run resolve:offers` | Résolution URL/ASIN canoniques (stub) |
| `npm run db:studio` | Prisma Studio |

## Déploiement

**Vercel + Neon Postgres.** Le site lit Neon en direct (re-seed Neon = mise à jour
immédiate, sans redéploiement). Build : `prisma generate && next build`.

```bash
npm run build   # build de contrôle local OBLIGATOIRE avant tout déploiement
npx vercel deploy --prod --yes --scope lucasr33 --token=<TOKEN>
```

Détails (modèle de données, ajout de catégorie, branchement Awin, décisions,
dettes, bugs connus, sécurité) : voir [`ARCHITECTURE.md`](./ARCHITECTURE.md).
