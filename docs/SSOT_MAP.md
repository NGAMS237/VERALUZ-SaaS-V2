# SSOT Map — Sources de vérité uniques

## Principe

Chaque donnée, configuration ou règle a une **source de vérité unique (SSOT)**.
Toute duplication doit être éliminée au profit d'une référence.

## Carte des SSOT

| Domaine                        | SSOT                           | Consommateurs             |
| ------------------------------ | ------------------------------ | ------------------------- |
| Tokens visuels                 | `src/styles/tokens.css`        | Tous les composants CSS   |
| Variables d'environnement      | `src/lib/config/env.ts`        | Tout le code serveur      |
| Schéma des env vars            | `src/lib/config/env.schema.ts` | `env.ts`, tests           |
| Versions des dépendances       | `package.json`                 | `pnpm-lock.yaml`, CI      |
| Version de l'app               | `package.json#version`         | `NEXT_PUBLIC_APP_VERSION` |
| Décisions techniques           | `DECISIONS.md`                 | Agents, équipe            |
| Roadmap                        | `ROADMAP.md`                   | Agents, équipe            |
| Contrat API kjemo              | `src/app/api/kjemo/`           | Clients API, tests        |
| Schéma DB (F1+)                | `supabase/migrations/`         | Supabase, types générés   |
| Types TypeScript générés (F1+) | `src/lib/database.types.ts`    | Modules métier            |

## Règles

1. **Ne jamais dupliquer** : si une valeur apparaît deux fois, extraire vers la SSOT
2. **Générer plutôt que dupliquer** : types DB générés depuis le schéma Supabase
3. **Importer, pas copier** : toujours importer depuis la SSOT, jamais copier
