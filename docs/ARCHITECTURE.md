# Architecture — VERALUZ SaaS V2

## Vue d'ensemble

VERALUZ SaaS V2 est une plateforme **multi-tenant** construite sur Next.js App Router.
Chaque résidence est un **tenant** isolé avec ses propres données, utilisateurs et configuration.

## Stack technique

Voir `package.json` pour les versions exactes verrouillées.

| Couche          | Technologie           | Notes                        |
| --------------- | --------------------- | ---------------------------- |
| Framework       | Next.js App Router    | v16.x                        |
| Langage         | TypeScript strict     | v5.x — TS 7.x incompatible   |
| Runtime         | Node.js               | v22.23.2 (LTS)               |
| Package manager | pnpm                  | v11.24.0                     |
| Base de données | Supabase (PostgreSQL) | local en F0, distant en F1+  |
| Tests           | Vitest                | v4.x                         |
| Validation      | Zod                   | v3.x (3.x stable, 4.x futur) |

## Structure des répertoires

```
veraluz-v2/
├── src/
│   ├── app/                    # Routes Next.js (App Router)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── globals.css         # Styles globaux (importe tokens)
│   │   └── api/
│   │       └── kjemo/
│   │           └── v1/         # API interne VERALUZ
│   │               ├── manifest/route.ts
│   │               └── health/
│   │                   ├── live/route.ts   # liveness probe
│   │                   └── ready/route.ts  # readiness probe (F0+)
│   ├── components/             # Composants React réutilisables
│   │   └── ui/                 # Composants UI primitifs
│   ├── lib/                    # Bibliothèques partagées
│   │   ├── config/
│   │   │   ├── env.schema.ts   # Schéma Zod des variables d'env
│   │   │   ├── env.ts          # Export validé de la config
│   │   │   └── version.ts      # Source unique de la version applicative
│   │   └── utils/              # Utilitaires génériques
│   ├── instrumentation.ts      # Validation env au démarrage (Next.js hook)
│   ├── modules/                # Modules métier (F1+)
│   └── styles/
│       └── tokens.css          # Tokens --vlz-* (source unique)
├── tests/
│   ├── setup.ts                # Initialisation des tests
│   ├── api/                    # Tests des route handlers
│   └── config/                 # Tests de validation config
├── docs/                       # Documentation technique
├── skills/                     # Skills Claude/Codex
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI (actions pinnées aux SHA)
└── ...fichiers de config       # tsconfig, next.config, etc.
```

## Couches applicatives

```
UI
└── src/app/
    └── consomme les tokens CSS --vlz-*

Transport HTTP
└── src/app/api/kjemo/v1/
    └── utilise env via src/lib/config/env.ts

Configuration
└── src/lib/config/
    └── seule frontière autorisée pour process.env

Métier
└── src/modules/
    └── vide en F0 (F1+)

Persistance
└── absente en F0
    └── aucune connexion Supabase
```

## API Interne — Namespace kjemo

Toutes les routes API internes utilisent le préfixe `/api/kjemo/v1/`.

| Route                        | Méthode | Description              | Auth |
| ---------------------------- | ------- | ------------------------ | ---- |
| `/api/kjemo/v1/manifest`     | GET     | Métadonnées instance     | Non  |
| `/api/kjemo/v1/health/live`  | GET     | Liveness probe           | Non  |
| `/api/kjemo/v1/health/ready` | GET     | Readiness probe          | Non  |

### Sémantique liveness vs readiness

**Liveness** (`/health/live`) : retourne toujours 200 si le processus Node.js
répond. Ne retourne jamais 503 pour le mode maintenance — un 503 entraînerait
un redémarrage du pod par l'orchestrateur.

**Readiness** (`/health/ready`) : retourne 200 quand l'application accepte du
trafic, 503 quand `FEATURE_MAINTENANCE=true`. Utilisé par le load balancer
pour retirer l'instance du pool sans la redémarrer.

## Multi-tenancy

L'isolation des tenants en F1+ reposera sur :

1. **Supabase Row Level Security (RLS)** — chaque requête DB filtrée via `auth.uid()` + memberships
2. **Résolution du tenant** — chemin `/t/[tenantSlug]/` ou sous-domaine (décision F1)
3. **NEXT_PUBLIC_TENANT_ID** — hint UX/routing uniquement, jamais un token d'autorisation

Le premier tenant pilote est `veraluz-001` (La Résidence VERALUZ).

## Sécurité

- En-têtes HTTP configurés dans `next.config.ts` (voir `DECISIONS.md`)
- Variables sensibles jamais dans le bundle client
- `src/lib/config/env.ts` — seule frontière pour `process.env` dans l'application
- Validation Zod stricte : `FEATURE_MAINTENANCE` accepte seulement `"true"` ou `"false"`
- RLS Supabase pour l'isolation des données (F1+)
- Secret scanning en CI via gitleaks (action pinnée au SHA)

## Décisions régionales

La région d'hébergement, le domaine internet et les réglementations applicables
sont **à décider avec Blaise avant tout déploiement**. Aucune configuration
de région ne doit être codée en dur dans l'application.
