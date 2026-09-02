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
- **Conséquences** : `src/lib/config/env.ts` est le seul point d'accès aux valeurs
  applicatives. `APP_ENV` est obligatoire. `FEATURE_MAINTENANCE` est serveur uniquement
  et utilise un enum strict — `"True"`, `"yes"`, `"1"` sont rejetés. La sentinelle
  framework `NEXT_RUNTIME` dans `src/instrumentation.ts` est l'unique exception.

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

## [DECISION-009] Mapping Horizon Signature UI System dans les tokens `--vlz-*`

- **Date** : 2026-09-02
- **Lot** : UI-1
- **Statut** : Acceptée
- **Décideur** : Claude
- **Contexte** : Le système de direction artistique « Horizon Signature UI System »
  (fourni hors dépôt) définit une esthétique premium (Ink/Navy, Or, géométrie
  asymétrique signature) via des tokens `--hz-*` propres à sa spécification.
  DECISION-006 impose `--vlz-*` comme seule source visuelle.
- **Décision** : Les rôles sémantiques Horizon (surfaces canvas/base/raised/soft,
  texte primary/secondary/muted/inverse, bordures, focus ring, rayons organic/
  signature) sont ajoutés comme nouvelles catégories dans `src/styles/tokens.css`
  sous la convention `--vlz-{catégorie}-{variante}-{propriété}` existante. Les
  couleurs de marque VERALUZ déjà actées (DECISION-006 : `#1B3A5C`, `#C89B4A`,
  `#F5F3EE`) ne sont pas remplacées par les valeurs Horizon d'exemple — seule la
  structure sémantique (rôles, géométrie, hiérarchie) est adoptée.
- **Alternatives** : Créer un système `--hz-*` parallèle (rejeté — duplique la
  source de vérité visuelle) ; remplacer la palette VERALUZ par la palette
  Horizon d'exemple (rejeté — DECISION-006 fixe déjà l'identité de marque).
- **Conséquences** : Thème sombre ajouté via `[data-theme="dark"]` sur `<html>`,
  amorcé par un script inline anti-FOUC (`src/components/shell/theme-script.ts`)
  et persisté en `localStorage`. Voir `docs/DESIGN_SYSTEM.md` pour la liste
  complète des tokens ajoutés.

## [DECISION-010] Server Actions UI-1 appellent directement la couche services

- **Date** : 2026-09-02
- **Lot** : UI-1
- **Statut** : Acceptée
- **Décideur** : Claude
- **Contexte** : Les mutations UI (créer/modifier une chambre ou une catégorie,
  changer un statut, mettre à jour les paramètres) doivent respecter la même
  logique métier que les Route Handlers `kjemo/v1` livrés en CORE-1, sans la
  dupliquer.
- **Décision** : Les Server Actions (`src/app/t/[tenantSlug]/*/actions.ts`)
  importent et appellent directement `src/modules/*/services/*.ts` — la même
  couche services que les Route Handlers. Les Route Handlers restent le contrat
  HTTP public (clients externes, intégrations futures) ; les Server Actions sont
  un second adaptateur de transport pour l'UI, tous deux au-dessus des mêmes
  services et de la même validation Zod.
- **Alternatives** : Faire des Server Actions un simple `fetch()` vers les routes
  `kjemo/v1` internes (rejeté — complexité inutile de propagation des cookies de
  session pour un appel serveur-à-serveur intra-processus, latence ajoutée sans
  bénéfice).
- **Conséquences** : Toute évolution de la logique métier (validation, règles de
  cohérence) se fait une seule fois dans les services et bénéficie automatiquement
  aux deux transports. Chaque Server Action revérifie indépendamment le rôle
  (`owner`/`admin`) — ne jamais faire confiance à l'UI qui masque déjà les actions
  pour `staff`/`viewer`.

## [DECISION-011] Route générique pour les modules futurs « À venir »

- **Date** : 2026-09-02
- **Lot** : UI-1
- **Statut** : Acceptée
- **Décideur** : Claude
- **Contexte** : ROADMAP.md liste 16 domaines futurs (réservations, check-in,
  housekeeping, etc.) qui doivent apparaître dans la navigation avec un
  placeholder honnête, sans aucune logique métier en UI-1.
- **Décision** : Une seule route dynamique `/t/[tenantSlug]/modules/[moduleSlug]`
  résout le module depuis une configuration unique (`src/components/shell/
navigation.ts` — SSOT `futureModules`), plutôt que 16 dossiers de route
  quasi identiques.
- **Alternatives** : Un dossier de route statique par domaine (rejeté — 16
  fichiers dupliqués pour un rendu strictement identique, viole la règle SSOT).
- **Conséquences** : Ajouter un nouveau domaine « à venir » ne nécessite qu'une
  entrée dans `navigation.ts`. Un slug inconnu retourne 404 (`notFound()`).
