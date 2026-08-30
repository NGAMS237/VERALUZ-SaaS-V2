# VERALUZ SaaS V2

Plateforme multi-tenant de gestion résidentielle — deuxième génération.

> **Statut : Lot F0 — Socle technique (en construction)**
> Aucune fonctionnalité métier n'est encore disponible.

## Architecture

Next.js 16 · App Router · TypeScript strict · pnpm · Vitest · Supabase (local)

```
src/
├── app/          # Routes Next.js (App Router)
│   └── api/
│       └── kjemo/v1/   # API interne VERALUZ
├── components/   # Composants React réutilisables
├── lib/          # Utilitaires partagés (config, utils)
│   └── config/   # Validation Zod des variables d'environnement
├── modules/      # Modules métier (F1+, vide en F0)
└── styles/       # Tokens CSS --vlz-* (source visuelle unique)
```

## Démarrage local

```bash
# 1. Prérequis : Node 22+, pnpm 11+
node -v && pnpm -v

# 2. Variables d'environnement
cp .env.example .env.local
# Remplir les valeurs dans .env.local

# 3. Dépendances
pnpm install

# 4. Serveur de développement
pnpm dev
```

## Commandes disponibles

| Commande            | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Serveur de développement (Turbopack) |
| `pnpm build`        | Build de production                  |
| `pnpm lint`         | Lint ESLint (0 warning toléré)       |
| `pnpm format:check` | Vérification Prettier                |
| `pnpm typecheck`    | Vérification TypeScript              |
| `pnpm test`         | Tests unitaires Vitest               |
| `pnpm validate`     | Toutes les vérifications en séquence |

## Endpoints API

| Endpoint                        | Description                        |
| ------------------------------- | ---------------------------------- |
| `GET /api/kjemo/v1/manifest`    | Métadonnées de l'instance          |
| `GET /api/kjemo/v1/health/live` | Sonde de vivacité (liveness probe) |

## Conventions

- Aucune valeur brute dans les composants — tout passe par les tokens `--vlz-*`
- Variables d'environnement validées via Zod au démarrage (`src/lib/config/env.ts`)
- Aucun secret dans le dépôt (voir `.gitignore`)
- Commits conventionnels : `feat:`, `fix:`, `chore:`, `docs:`, `test:`

## Multi-tenancy

La Résidence VERALUZ sera le premier tenant pilote (`veraluz-001`).
L'isolation multi-tenant sera implémentée à partir du lot F1.

---

Voir `docs/ARCHITECTURE.md` pour la vue d'ensemble technique complète.
