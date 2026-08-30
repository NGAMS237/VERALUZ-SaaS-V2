# Tests et Processus de Release — VERALUZ SaaS V2

## Stratégie de tests

| Niveau      | Framework        | Répertoire                 | Couverture cible              |
| ----------- | ---------------- | -------------------------- | ----------------------------- |
| Unitaires   | Vitest           | `tests/`                   | 80%+ sur `lib/` et `app/api/` |
| Intégration | Vitest           | `tests/integration/` (F1+) | Endpoints avec DB locale      |
| E2E         | Playwright (F1+) | `e2e/`                     | Parcours critiques            |

## Commandes

```bash
pnpm test              # Tests unitaires (mode CI)
pnpm test:watch        # Mode watch (développement)
pnpm test:coverage     # Avec rapport de couverture
pnpm validate          # Format + Lint + Typecheck + Tests
```

## Pipeline CI

Chaque push déclenche :

1. `pnpm install --frozen-lockfile`
2. `pnpm format:check`
3. `pnpm lint`
4. `pnpm typecheck`
5. `pnpm test`
6. `pnpm build`
7. `git diff --check`
8. Scan secrets (gitleaks)

## Processus de release

### Entre lots (Claude ↔ Codex)

1. L'implementer pousse sa branche `{agent}/{lot}-*`
2. L'implementer produit le rapport final dans `AI_HANDOFF.md`
3. Le reviewer clone la branche et exécute `pnpm validate`
4. Le reviewer produit ses commentaires dans `docs/{AGENT}_REVIEW_{LOT}.md`
5. Les corrections sont committées sur la même branche
6. Merge vers `main` uniquement après validation des deux agents

### Versioning

Format : `MAJOR.MINOR.PATCH` (semver)

- `MAJOR` : changement d'architecture ou de contrat API
- `MINOR` : nouveau lot fonctionnel
- `PATCH` : corrections dans un lot

Version actuelle : `0.1.0` (F0 — socle)
