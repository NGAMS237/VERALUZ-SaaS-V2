# Skill : veraluz-architecture-guardian

## Rôle

Vérifier la conformité architecturale du code VERALUZ SaaS V2 avant tout commit.

## Déclenchement

À activer au début de chaque session de travail sur le dépôt `veraluz-v2`.

## Checklist de garde-fou

### 🚫 Interdictions absolues

- [ ] Aucun import depuis `veraluz-os`
- [ ] Aucun secret commité (clés, tokens, passwords dans les fichiers)
- [ ] Aucun accès direct à `process.env` hors de `src/lib/config/env.ts`
- [ ] Aucune valeur CSS brute dans `src/app`, `src/components`, `src/modules`
- [ ] Aucun fichier Supabase (client, migrations, seeds) en F0
- [ ] Aucun push vers `main`
- [ ] Aucun fichier `.env` (hors `.env.example`) suivi par Git

### ✅ Conformité architecturale

- [ ] Les tokens CSS suivent la convention `--vlz-{catégorie}-{variante}-{propriété}`
- [ ] Les variables d'environnement passent par `src/lib/config/env.ts`
- [ ] La version applicative vient de `package.json` via `src/lib/config/version.ts`
- [ ] Les nouveaux endpoints API sont sous `/api/kjemo/v1/`
- [ ] Les tests sont dans `tests/` avec Vitest
- [ ] Le lockfile `pnpm-lock.yaml` est commité
- [ ] `minimumReleaseAge` ≥ 1440 dans `.npmrc`

### ✅ Qualité avant commit

```bash
pnpm validate   # format:check + lint + typecheck + test
pnpm audit      # sécurité des dépendances
git diff --check <base-sha> HEAD   # pas de whitespace errors dans le delta
```

## Commandes de vérification rapide

Utiliser `rg` (ripgrep) lorsqu'il est disponible — plus rapide et sûr que grep.

```bash
# 1. Chercher des imports veraluz-os
rg "veraluz-os" src/ --type ts --type tsx -l 2>/dev/null || \
  grep -rl "veraluz-os" src/ --include="*.ts" --include="*.tsx"

# 2. Chercher des accès directs à process.env hors de la frontière config
# Détecte les 3 formes : process.env.X, process.env["X"], process.env['X']
rg 'process\.env(\.|(\[["'"'"']))' src/ --type ts --type tsx \
  --glob '!src/lib/config/**' -n 2>/dev/null || \
  grep -rn "process\.env" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "src/lib/config/"

# 3. Chercher des valeurs CSS brutes dans les composants
# Détecte: px, dvh, em, rem, %, vh, vw inline (hors exceptions SVG structurelles)
# Exceptions acceptées : viewBox, coordonnées géométriques, données de tracé SVG
rg '(style|className).*"[0-9]+px|[0-9]+dvh|[0-9]+\.[0-9]+em|[0-9]+rem|[0-9]+%|[0-9]+vh|[0-9]+vw"' \
  src/app src/components src/modules -n 2>/dev/null || \
  grep -rn 'style.*[0-9]\+px\|style.*[0-9]\+dvh\|style.*[0-9]\+em\|style.*[0-9]\+rem' \
  src/app src/components src/modules 2>/dev/null | grep -v "var(--vlz"

# 4. Chercher des couleurs hex brutes dans les composants
rg '#[0-9A-Fa-f]{3,8}' src/app src/components src/modules --type ts --type tsx -n 2>/dev/null | \
  grep -v "// " | grep -v "tokens.css"

# 5. Vérifier les fichiers .env non ignorés par Git
git ls-files | grep -E "^\.env($|\.|local|production|staging)"

# 6. Chercher des références à veraluz-os ou KJORA/KJEMO dans les fichiers source
rg "veraluz-os|KJORA|KAJORA" src/ --type ts --type tsx -l 2>/dev/null

# 7. Vérifier minimumReleaseAge dans .npmrc
grep "minimumReleaseAge=0" .npmrc && echo "VIOLATION: minimumReleaseAge=0 détecté" || echo "OK"

# 8. Vérifier les whitespace errors dans le delta commité
git diff --check "$(git merge-base HEAD origin/claude/f0-foundation-bootstrap 2>/dev/null || git rev-list --max-parents=0 HEAD)" HEAD
```

## Exceptions SVG structurelles

Les attributs suivants sont acceptés en valeur brute dans les fichiers SVG et JSX :
- `viewBox`, `d` (path data), `x`, `y`, `rx`, `ry`, `cx`, `cy`, `r`
- `fontSize`, `fontWeight`, `fontFamily` sur des éléments `<text>` SVG
- `width`, `height` sur `<svg>` → préférer `style={{ width: "var(--vlz-...)" }}`

Les attributs `fill` et `stroke` doivent utiliser des tokens CSS (`var(--vlz-*)`).

Voir `docs/DESIGN_SYSTEM.md` §Exceptions SVG structurelles pour le détail.

## Actions correctives

Si une violation est détectée :

1. Ne pas commiter
2. Corriger la violation
3. Relancer `pnpm validate && pnpm audit`
4. Documenter dans `DECISIONS.md` si la correction implique un changement de pattern
