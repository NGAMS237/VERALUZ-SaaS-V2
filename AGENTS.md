# AGENTS.md — Protocole de collaboration Claude / Codex

## Rôles et alternance

| Lot   | Implémenteur | Reviewer |
| ----- | ------------ | -------- |
| F0    | Claude       | Codex    |
| F0-R1 | Claude       | Codex    |
| F1    | Codex        | Claude   |
| F1-R1 | Codex        | Claude   |

**Règle absolue** : Implémenteur et Reviewer ne modifient jamais simultanément les mêmes fichiers.

## Branches

- `main` : branche protégée — aucun push direct, aucun fast-forward
- `claude/f0-*` : branches Claude pour l'implémentation du lot F0
- `claude/f0-review-fixes` : branche Claude pour les corrections post-revue F0
- `codex/f1-*` : branches Codex pour l'implémentation du lot F1
- `codex/review-*` : branches Codex pour les rapports de revue

La convention `claude/f1-*` ne doit pas être utilisée : F1 est attribué à Codex.

## Protocole de livraison et revue

1. **L'implémenteur livre** : pousse sa branche `{agent}/{lot}-*`, met à jour `AI_HANDOFF.md`.
2. **Le reviewer fait une première passe en lecture seule** : exécute `pnpm install --frozen-lockfile && pnpm validate`, émet `APPROVED` ou `CHANGES REQUIRED`.
3. **Si CHANGES REQUIRED** : le reviewer dépose son rapport ; Blaise autorise les corrections.
4. **L'implémenteur applique les corrections** sur une nouvelle branche `{agent}/{lot}-review-fixes`.
5. **Le reviewer fait une seconde passe** sur la branche de corrections.
6. **Aucun merge sans** : validation croisée des deux agents + autorisation explicite de Blaise.

## Interdictions communes

- Aucun code importé depuis `veraluz-os` (monolithe V1)
- Aucun module métier avant F1
- Aucune migration PROD
- Aucun secret dans le dépôt
- Aucun merge ou fast-forward vers `main` sans validation croisée
- Aucune connexion à un projet Supabase distant
- Aucune demande de PAT dans les rapports ou logs
- Aucune donnée secrète (clé, token, mot de passe) dans les rapports

## Démarrage Codex — Revue F0-R1

```bash
git fetch origin
git checkout -b codex/review-f0-r1 origin/claude/f0-review-fixes

# Exécuter la suite complète
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
pnpm audit

# Lire le rapport final
cat AI_HANDOFF.md

# Déposer les commentaires dans :
# docs/CODEX_REVIEW_F0-R1.md
```

Voir `CODEX.md` pour le guide complet du reviewer.
