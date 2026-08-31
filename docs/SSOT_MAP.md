# SSOT Map — Sources de vérité uniques

## Principe

Chaque donnée, configuration ou règle a une **source de vérité unique (SSOT)**.
Toute duplication doit être éliminée au profit d'une référence.

## Carte des SSOT

| Domaine                        | SSOT                           | Consommateurs               |
| ------------------------------ | ------------------------------ | --------------------------- |
| Tokens visuels                 | `src/styles/tokens.css`        | Tous les composants CSS     |
| Variables applicatives         | `src/lib/config/env.ts`        | Tout le code serveur        |
| Schéma des env vars            | `src/lib/config/env.schema.ts` | `env.ts`, tests             |
| Version applicative            | `package.json#version`         | `src/lib/config/version.ts` |
| Versions des dépendances       | `package.json`                 | `pnpm-lock.yaml`, CI        |
| Décisions techniques           | `DECISIONS.md`                 | Agents, équipe              |
| Roadmap                        | `ROADMAP.md`                   | Agents, équipe              |
| Contrat API kjemo              | `src/app/api/kjemo/`           | Clients API, tests          |
| Schéma DB (F1+)                | `supabase/migrations/`         | Supabase, types générés     |
| Types TypeScript générés (F1+) | `src/lib/database.types.ts`    | Modules métier              |

## Règles

1. **Ne jamais dupliquer** : si une valeur apparaît deux fois, extraire vers la SSOT
2. **Générer plutôt que dupliquer** : types DB générés depuis le schéma Supabase
3. **Importer, pas copier** : toujours importer depuis la SSOT, jamais copier
4. **Version depuis package.json** : ne jamais maintenir une seconde version dans une variable d'environnement ou une constante dupliquée

## Anti-patterns à éviter

| Anti-pattern                                  | Correction                                        |
| --------------------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_APP_VERSION` en env var          | Importer `APP_VERSION` depuis `version.ts`        |
| Version dans un doc différent de package.json | Écrire "Voir package.json pour la version exacte" |
| `process.env.X` dans une route API            | Importer `env` depuis `src/lib/config/env.ts`     |
| Décision non actée dans DECISIONS.md          | Documenter avant d'implémenter                    |
