# DECISIONS.md — Journal des décisions techniques

## Format

```
## [DECISION-XXX] Titre
- **Date** : YYYY-MM-DD
- **Lot** : F0 / F1 / ...
- **Statut** : Acceptée | Rejetée | Remplacée par DECISION-YYY
- **Décideur** : Claude | Codex | Humain
- **Contexte** : Pourquoi cette décision était nécessaire
- **Décision** : Ce qui a été choisi
- **Alternatives** : Ce qui a été écarté et pourquoi
- **Conséquences** : Impact prévisible
```

---

## [DECISION-001] Next.js 16 App Router comme framework principal

- **Date** : 2026-08-30
- **Lot** : F0
- **Statut** : Acceptée
- **Décideur** : Claude
- **Contexte** : Besoin d'un framework full-stack React avec SSR/SSG, routing file-based, API routes intégrées.
- **Décision** : Next.js 16.3.3 avec App Router et TypeScript strict.
- **Alternatives** : Remix (moins de traction ecosystème), Nuxt (Vue, pas React), SvelteKit (réécriture trop importante).
- **Conséquences** : Route Handlers dans `app/api/`, Server Components par défaut, layouts composables.

## [DECISION-002] pnpm comme gestionnaire de paquets unique

- **Date** : 2026-08-30
- **Lot** : F0
- **Statut** : Acceptée
- **Décideur** : Claude
- **Contexte** : Besoin d'un gestionnaire rapide avec support de workspaces pour une future architecture monorepo.
- **Décision** : pnpm 11.24.0, lockfile `pnpm-lock.yaml` commité.
- **Alternatives** : npm (plus lent, pas de hoisting strict), yarn (complexité Berry).
- **Conséquences** : `--frozen-lockfile` en CI, `packageManager` dans package.json.

## [DECISION-003] Vitest comme framework de tests

- **Date** : 2026-08-30
- **Lot** : F0
- **Statut** : Acceptée
- **Décideur** : Claude
- **Contexte** : Jest est lent avec ESM et TypeScript. Vitest est natif Vite, compatible avec l'écosystème Next.js.
- **Décision** : Vitest 4.1.11 avec environnement Node pour les tests API.
- **Alternatives** : Jest (config ESM complexe), Playwright uniquement (pas de tests unitaires).
- **Conséquences** : `vitest.config.ts` séparé, alias `@/` configuré manuellement, couverture ≥ 80 % sur `src/lib/` et `src/app/api/`.

## [DECISION-004] Zod pour la validation de configuration serveur

- **Date** : 2026-08-30
- **Lot** : F0
- **Statut** : Acceptée
- **Décideur** : Claude
- **Contexte** : Les variables d'environnement manquantes ou malformées causent des bugs silencieux en production.
- **Décision** : Zod 3.24.4 avec `safeParse` au démarrage, échec rapide si invalide. Versions exactes dans `package.json`.
- **Alternatives** : t3-env (dépendance additionnelle), validation manuelle (fragile).
- **Conséquences** : `src/lib/config/env.ts` est le seul point d'accès aux env vars côté serveur. `FEATURE_MAINTENANCE` utilise un enum strict — `"True"`, `"yes"`, `"1"` sont rejetés.

Note : Zod 4.x n'a pas été retenu en F0 car il était trop récent au moment du développement (politique supply-chain minimumReleaseAge).

## [DECISION-005] Namespace API `kjemo/v1`

- **Date** : 2026-08-30
- **Lot** : F0
- **Statut** : Acceptée
- **Décideur** : Claude
- **Contexte** : L'API interne VERALUZ utilise le namespace `kjemo` pour éviter les collisions avec des APIs tierces.
- **Décision** : Toutes les routes API internes sous `/api/kjemo/v1/`.
- **Alternatives** : `/api/v1/` (trop générique), `/api/veraluz/` (redondant dans le contexte).
- **Conséquences** : Route handlers dans `src/app/api/kjemo/v1/`, versionné dès F0.

## [DECISION-006] Tokens CSS `--vlz-*` comme source visuelle unique

- **Date** : 2026-08-30
- **Lot** : F0
- **Statut** : Acceptée
- **Décideur** : Claude
- **Contexte** : Besoin de cohérence visuelle et de thémabilité multi-tenant future.
- **Décision** : Tous les tokens définis dans `src/styles/tokens.css`, convention `--vlz-{category}-{variant}-{property}`.
- **Alternatives** : Tailwind CSS (config JS, moins portable), CSS Modules sans tokens (duplication).
- **Conséquences** : Aucune valeur brute dans les composants. Exception documentée pour les attributs structurels SVG (viewBox, coordonnées géométriques, données de tracé) — voir `docs/DESIGN_SYSTEM.md`.

## [DECISION-007] Supabase uniquement en local pour F0

- **Date** : 2026-08-30
- **Lot** : F0
- **Statut** : Acceptée
- **Décideur** : Claude
- **Contexte** : Aucune connexion à un projet Supabase distant autorisée en F0. Pas de `supabase link`.
- **Décision** : Le schéma Supabase sera préparé en F1. F0 se contente du `.env.example` avec des placeholders.
- **Alternatives** : Initialiser Supabase maintenant (hors périmètre F0, risque de migration PROD).
- **Conséquences** : Pas de client Supabase dans F0. Les imports seront ajoutés en F1.

## [DECISION-008] Suppression de l'en-tête X-XSS-Protection

- **Date** : 2026-08-31
- **Lot** : F0-R1
- **Statut** : Acceptée
- **Décideur** : Claude (correction Codex review)
- **Contexte** : L'en-tête `X-XSS-Protection: 1; mode=block` était présent dans `next.config.ts`. Les navigateurs modernes (Chrome, Firefox, Edge) ignorent cet en-tête ou l'ont retiré. Il peut introduire des vulnérabilités dans Internet Explorer 8 en permettant l'injection via les pages d'erreur XSS.
- **Décision** : Retirer `X-XSS-Protection` des en-têtes HTTP. La protection XSS repose sur la CSP (à implémenter dans un lot sécurité dédié) et le mode strict de React.
- **Alternatives** : Conserver avec valeur `0` (désactivation explicite) — écarté, car un en-tête absent est plus propre qu'un en-tête désactivé.
- **Conséquences** : En-têtes restants : `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. CSP reportée à un lot dédié.
