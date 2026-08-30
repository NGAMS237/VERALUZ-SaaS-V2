# Architecture — VERALUZ SaaS V2

## Vue d'ensemble

VERALUZ SaaS V2 est une plateforme **multi-tenant** construite sur Next.js App Router.
Chaque résidence est un **tenant** isolé avec ses propres données, utilisateurs et configuration.

## Stack technique

| Couche          | Technologie           | Version     |
| --------------- | --------------------- | ----------- |
| Framework       | Next.js App Router    | 16.3.3      |
| Langage         | TypeScript strict     | 7.0.2       |
| Runtime         | Node.js               | 22+         |
| Package manager | pnpm                  | 11.24.0     |
| Base de données | Supabase (PostgreSQL) | local en F0 |
| Tests           | Vitest                | 4.1.11      |
| Validation      | Zod                   | 4.5.4       |

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
│   │               └── health/live/route.ts
│   ├── components/             # Composants React réutilisables
│   │   └── ui/                 # Composants UI primitifs
│   ├── lib/                    # Bibliothèques partagées
│   │   ├── config/
│   │   │   ├── env.schema.ts   # Schéma Zod des variables d'env
│   │   │   └── env.ts          # Export validé de la config
│   │   └── utils/              # Utilitaires génériques
│   ├── modules/                # Modules métier (F1+)
│   │   └── .keep               # Placeholder — vide en F0
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
│       └── ci.yml              # Pipeline CI
└── ...fichiers de config       # tsconfig, next.config, etc.
```

## API Interne — Namespace kjemo

Toutes les routes API internes utilisent le préfixe `/api/kjemo/v1/`.

| Route                       | Méthode | Description          | Auth |
| --------------------------- | ------- | -------------------- | ---- |
| `/api/kjemo/v1/manifest`    | GET     | Métadonnées instance | Non  |
| `/api/kjemo/v1/health/live` | GET     | Liveness probe       | Non  |

Les endpoints futurs (F1+) ajouteront :

- `/api/kjemo/v1/auth/*` — Authentification
- `/api/kjemo/v1/tenants/*` — Gestion multi-tenant
- `/api/kjemo/v1/residents/*` — Module résidents

## Multi-tenancy

L'isolation des tenants repose sur :

1. **Supabase Row Level Security (RLS)** — chaque requête DB est filtrée par `tenant_id`
2. **Middleware Next.js** — résolution du tenant depuis le sous-domaine ou l'en-tête
3. **Variables d'environnement** — `NEXT_PUBLIC_TENANT_ID` pour le tenant courant

Le premier tenant pilote est `veraluz-001` (La Résidence VERALUZ).

## Design System

Les tokens CSS `--vlz-*` dans `src/styles/tokens.css` sont la **seule source de vérité visuelle**.
Aucune valeur brute (couleur, taille, espacement) ne doit apparaître dans les composants.

Convention de nommage : `--vlz-{catégorie}-{variante}-{propriété}`

## Sécurité

- En-têtes de sécurité HTTP configurés dans `next.config.ts`
- Variables sensibles jamais dans le bundle client
- Validation Zod des variables d'environnement au démarrage
- RLS Supabase pour l'isolation des données (F1+)
- Secret scanning en CI via gitleaks
