# Skill : veraluz-architecture-guardian

## Rôle

Vérifier la conformité architecturale du code VERALUZ SaaS V2 avant tout commit.

## Déclenchement

À activer au début de chaque session de travail sur le dépôt `veraluz-v2`.

## Checklist de garde-fou

### 🚫 Interdictions absolues

- [ ] Aucun import depuis `veraluz-os` (`import.*veraluz-os`)
- [ ] Aucun secret commité (clés, tokens, passwords dans les fichiers)
- [ ] Aucun `process.env.*` en dehors de `src/lib/config/env.ts`
- [ ] Aucune valeur brute de couleur/taille dans les composants (vérifier `#[0-9A-Fa-f]{3,6}`, `[0-9]+px` inline)
- [ ] Aucun `supabase link` ou connexion distante Supabase
- [ ] Aucun push vers `main`

### ✅ Conformité architecturale

- [ ] Les tokens CSS suivent la convention `--vlz-{catégorie}-{variante}-{propriété}`
- [ ] Les variables d'environnement passent par `src/lib/config/env.ts`
- [ ] Les nouveaux endpoints API sont sous `/api/kjemo/v1/`
- [ ] Les tests sont dans `tests/` avec Vitest
- [ ] Le lockfile `pnpm-lock.yaml` est commité

### ✅ Qualité avant commit

```bash
pnpm validate  # format:check + lint + typecheck + test
git diff --check  # pas de whitespace errors
```

## Commandes de vérification rapide

```bash
# Chercher des imports veraluz-os
grep -r "veraluz-os" src/ --include="*.ts" --include="*.tsx"

# Chercher des accès directs à process.env hors config
grep -rn "process\.env\." src/ --include="*.ts" --include="*.tsx" \
  | grep -v "src/lib/config/"

# Chercher des valeurs brutes de couleur inline
grep -rn "style.*#[0-9A-Fa-f]\{3,6\}" src/components/ src/modules/ 2>/dev/null || echo "OK"
```

## Actions correctives

Si une violation est détectée :

1. Ne pas commiter
2. Corriger la violation
3. Relancer `pnpm validate`
4. Documenter dans `DECISIONS.md` si la correction implique un changement de pattern
