# VERALUZ SaaS V2

Plateforme multi-tenant destinée aux résidences, hôtels et établissements
d'hébergement — deuxième génération. Lancement orienté Cameroun, architecture
conçue pour s'étendre à d'autres pays africains.

> **Statut : Lot F0-R1 — Corrections socle (en construction)**
> Aucune fonctionnalité métier n'est encore disponible.

## Architecture

Next.js 16 · App Router · TypeScript strict · pnpm · Vitest · Supabase (F1+)

```
src/
├── app/          # Routes Next.js (App Router)
│   └── api/
│       └── kjemo/v1/   # API interne VERALUZ
├── components/   # Composants React réutilisables
├── lib/          # Utilitaires partagés
│   └── config/   # Validation Zod — seule frontière pour process.env
├── instrumentation.ts  # Validation env au démarrage serveur
├── modules/      # Modules métier (F1+, vide en F0)
└── styles/       # Tokens CSS --vlz-* (source visuelle unique)
```

Voir `package.json` pour les versions exactes verrouillées.

## Démarrage local

```bash
# 1. Prérequis : Node 22.23.2, pnpm 11.24.0
node -v && pnpm -v

# 2. Variables d'environnement
cp .env.example .env.local
# APP_ENV est obligatoire ; remplir les valeurs dans .env.local

# 3. Dépendances
pnpm install

# 4. Serveur de développement
pnpm dev
```

## Commandes disponibles

| Commande             | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Serveur de développement (Turbopack) |
| `pnpm build`         | Build de production                  |
| `pnpm lint`          | Lint ESLint (0 warning toléré)       |
| `pnpm format:check`  | Vérification Prettier                |
| `pnpm typecheck`     | Vérification TypeScript              |
| `pnpm test`          | Tests unitaires Vitest               |
| `pnpm test:coverage` | Tests avec couverture ≥ 80 %         |
| `pnpm validate`      | Toutes les vérifications en séquence |
| `pnpm audit`         | Audit de sécurité des dépendances    |

## Endpoints API

| Endpoint                         | Description                          |
| -------------------------------- | ------------------------------------ |
| `GET /api/kjemo/v1/manifest`     | Métadonnées de l'instance            |
| `GET /api/kjemo/v1/health/live`  | Liveness probe (toujours 200)        |
| `GET /api/kjemo/v1/health/ready` | Readiness probe (503 en maintenance) |

## Conventions

- Variables applicatives via `src/lib/config/env.ts` uniquement
- Exception framework documentée : `NEXT_RUNTIME` dans `src/instrumentation.ts`
- `FEATURE_MAINTENANCE` accepte seulement `"true"` ou `"false"` — pas de coercition silencieuse
- Version applicative depuis `package.json#version` via `src/lib/config/version.ts`
- Tokens CSS `--vlz-*` pour toutes les valeurs visuelles
- Commits conventionnels : `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- Aucun secret dans le dépôt (voir `.gitignore`)

## Multi-tenancy

La Résidence VERALUZ sera le premier tenant pilote (`veraluz-001`).
L'isolation multi-tenant sera implémentée à partir du lot F1.

---

Voir `docs/ARCHITECTURE.md` pour la vue d'ensemble technique complète.
