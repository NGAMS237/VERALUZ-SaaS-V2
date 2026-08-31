# Tests et Processus de Release — VERALUZ SaaS V2

## Stratégie de tests

| Niveau      | Framework        | Répertoire                 | Couverture cible                |
| ----------- | ---------------- | -------------------------- | ------------------------------- |
| Unitaires   | Vitest           | `tests/`                   | ≥ 80 % sur `lib/` et `app/api/` |
| Intégration | Vitest           | `tests/integration/` (F1+) | Endpoints avec DB locale        |
| E2E         | Playwright (F1+) | `e2e/`                     | Parcours critiques              |

## Commandes

```bash
pnpm test              # Tests unitaires (mode CI)
pnpm test:watch        # Mode watch (développement)
pnpm test:coverage     # Avec rapport de couverture et seuils
pnpm validate          # Format + Lint + Typecheck + Tests
pnpm audit             # Audit de sécurité des dépendances
```

## Seuils de couverture (appliqués en CI)

Les seuils définis dans `vitest.config.ts` font échouer le build si non atteints :

- Lignes : ≥ 80 %
- Instructions : ≥ 80 %
- Fonctions : ≥ 80 %
- Branches : ≥ 80 %

Périmètre de couverture : `src/lib/**/*.ts` et `src/app/api/**/*.ts`.

## Pipeline CI

Chaque push déclenche (via `.github/workflows/ci.yml`, actions pinnées aux SHA) :

1. `pnpm install --frozen-lockfile`
2. `pnpm format:check`
3. `pnpm lint`
4. `pnpm typecheck`
5. `pnpm test:coverage` (avec seuils)
6. `pnpm build`
7. `pnpm audit`
8. Vérification whitespace du delta commité (BASE_SHA → HEAD)
9. Scan secrets (gitleaks)

## Vérification du delta whitespace

La CI compare le vrai delta commité (pas seulement l'index de travail) :

- Pour un PR : `git diff --check <base.sha> HEAD`
- Pour un push : `git diff --check <before.sha> HEAD`
- Pour un premier push : comparaison avec l'arbre vide (`hash-object -t tree /dev/null`)

## Processus de release

### Entre lots (Claude ↔ Codex)

1. L'implémenteur pousse sa branche `{agent}/{lot}-*`
2. L'implémenteur met à jour `AI_HANDOFF.md` avec SHA, commits, résultats de tests
3. Le reviewer clone la branche et exécute `pnpm install --frozen-lockfile && pnpm validate`
4. Le reviewer émet `APPROVED` ou `CHANGES REQUIRED`
5. Si corrections : l'implémenteur applique sur une branche `{agent}/{lot}-review-fixes`
6. Merge vers `main` uniquement après validation des deux agents + autorisation Blaise

### Versioning

Format : `MAJOR.MINOR.PATCH` (semver) — source unique : `package.json#version`

- `MAJOR` : changement d'architecture ou de contrat API
- `MINOR` : nouveau lot fonctionnel
- `PATCH` : corrections dans un lot

Version actuelle : voir `package.json#version`
