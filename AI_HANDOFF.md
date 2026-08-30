# AI_HANDOFF.md — Lot F0 : Socle technique

## Statut de livraison

**LOT** : F0 — Foundation Bootstrap  
**Branche** : `claude/f0-foundation-bootstrap`  
**Agent implémenteur** : Claude  
**Prochain agent** : Codex (revue)  
**Date** : 2026-08-30

---

## Résumé de ce qui a été livré

Le socle technique complet de VERALUZ SaaS V2 est en place :

- Next.js 16.3.3 (App Router, TypeScript strict, `typedRoutes`)
- pnpm 11.24.0 comme gestionnaire unique (lockfile `pnpm-lock.yaml` commité)
- TypeScript 5.9.3 (strict : `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- ESLint 9.39.5 + Prettier 3.9.6 (0 warning toléré)
- Vitest 4.1.11 — 15 tests unitaires, 3 suites, tous verts
- Zod 3.24.4 — validation serveur de la configuration
- Architecture modulaire `src/{app,lib,modules,components,styles}`
- Tokens CSS `--vlz-*` dans `src/styles/tokens.css`
- `GET /api/kjemo/v1/manifest` (statique, cache 60s)
- `GET /api/kjemo/v1/health/live` (dynamique, liveness probe avec mode maintenance)
- `.env.example` sans secret
- Page d'accueil minimale "En construction"
- CI GitHub Actions (format + lint + typecheck + tests + build + gitleaks)
- Tous les documents de référence créés (`DECISIONS.md`, `ROADMAP.md`, `AGENTS.md`, `CLAUDE.md`, `docs/*`)

---

## Versions techniques retenues

| Package     | Version | Motif                                                             |
| ----------- | ------- | ----------------------------------------------------------------- |
| Next.js     | 16.3.3  | Dernier stable au 2026-08-30                                      |
| TypeScript  | 5.9.3   | Dernier 5.x — TS 7.x incompatible avec typescript-eslint 8        |
| React       | 19.2.8  | Bundlée avec Next.js 16                                           |
| pnpm        | 11.24.0 | Support monorepo, lockfile strict                                 |
| Vitest      | 4.1.11  | Natif ESM, compatible Next.js                                     |
| Zod         | 3.24.4  | 3.x stable (4.x trop récent — supply-chain policy)                |
| ESLint      | 9.39.5  | 9.x requis — ESLint 10 incompatible avec eslint-scope des plugins |
| Prettier    | 3.9.6   | Dernier stable                                                    |
| @types/node | 26.4.0  | Aligné Node 22                                                    |

---

## Structure créée

```
veraluz-v2/
├── .github/workflows/ci.yml
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          ← "En construction"
│   │   ├── globals.css
│   │   └── api/kjemo/v1/
│   │       ├── manifest/route.ts
│   │       └── health/live/route.ts
│   ├── components/ui/.gitkeep
│   ├── lib/
│   │   ├── config/
│   │   │   ├── env.schema.ts
│   │   │   └── env.ts
│   │   └── utils/.gitkeep
│   ├── modules/.gitkeep
│   └── styles/tokens.css     ← Tokens --vlz-*
├── tests/
│   ├── setup.ts
│   ├── api/manifest.test.ts       (3 tests)
│   ├── api/health-live.test.ts    (4 tests)
│   └── config/env.test.ts         (8 tests)
├── docs/{ARCHITECTURE,PRODUCT,SSOT_MAP,MULTITENANCY_AND_SECURITY,TEST_AND_RELEASE,DESIGN_SYSTEM}.md
├── skills/veraluz-architecture-guardian/SKILL.md
├── .env.example
├── .npmrc
├── .gitignore
├── .prettierrc + .prettierignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── vitest.config.ts
├── README.md + AGENTS.md + CLAUDE.md + DECISIONS.md + ROADMAP.md + AI_HANDOFF.md
```

---

## Tests réellement exécutés et résultats

| Test             | Commande                    | Résultat            |
| ---------------- | --------------------------- | ------------------- |
| Formatage        | `pnpm format:check`         | ✅ PASS             |
| Lint             | `pnpm lint`                 | ✅ PASS (0 warning) |
| Typecheck        | `pnpm typecheck`            | ✅ PASS             |
| Tests unitaires  | `pnpm test`                 | ✅ 15/15 PASS       |
| Build production | `pnpm build`                | ✅ PASS             |
| git diff --check | `git diff --cached --check` | ✅ PASS             |
| Secret scan      | grep patterns               | ✅ PASS (0 secret)  |

---

## Tests non exécutés dans ce lot

| Test                     | Raison                                           |
| ------------------------ | ------------------------------------------------ |
| Tests d'intégration (DB) | Supabase non initialisé en F0 (intentionnel)     |
| Tests E2E Playwright     | Pas encore installé (F1+)                        |
| `pnpm audit` sécurité    | npm audit non autorisé (réseau sandbox)          |
| gitleaks scan local      | Outil non disponible en sandbox (couvert par CI) |

---

## Services externes modifiés

**AUCUN** — Aucune connexion à Supabase, Vercel, Hostinger ou tout autre service distant.

---

## Décisions et risques

### Décisions de portée locale (sandbox)

- **TypeScript 5.9.3** au lieu de 7.x : typescript-eslint 8.x (requis par eslint-config-next 16) ne supporte pas TS 7.x. TS 5.9.3 est entièrement compatible.
- **ESLint 9.39.5** au lieu de 10.x : ESLint 10.9.1 + eslint-config-next 16 produit `scopeManager.addGlobals is not a function` (incompatibilité eslint-scope). ESLint 9 est stable.
- **Zod 3.24.4** au lieu de 4.x : pnpm 11 supply-chain policy bloque les packages publiés il y a moins de 24h. Zod 4.5.4 (publié 2026-08-29) violait cette politique. Zod 3 couvre 100% des besoins F0.
- **`.npmrc` avec `minimumReleaseAge=0`** : nécessaire en sandbox pour bypasser le cutoff local. En CI, cette contrainte sera retirée et le `--frozen-lockfile` garantira l'intégrité.

### Risques résiduels

- Aucune migration ni connexion Supabase — à adresser en F1
- Le `.npmrc` contient `minimumReleaseAge=0` — Codex reviewer devra décider si cette valeur doit être retirée ou conservée
- `pnpm approve-builds` marque `esbuild` et `unrs-resolver` comme `allowBuilds: false` — ces outils s'exécutent quand même via le cache du store ; à monitorer en CI

---

## Commande pour Codex — Démarrage de la revue

```bash
# Sur la machine locale avec accès au dépôt NGAMS237/veraluz-v2
git fetch origin
git checkout -b codex/review-f0 origin/claude/f0-foundation-bootstrap

# Exécuter la suite complète
pnpm install --frozen-lockfile
pnpm validate   # format:check + lint + typecheck + test

# Build de vérification
pnpm build

# Lire les décisions
cat DECISIONS.md
cat AI_HANDOFF.md

# Déposer les commentaires de revue dans :
# docs/CODEX_REVIEW_F0.md
```

---

## READY FOR CODEX REVIEW : OUI
