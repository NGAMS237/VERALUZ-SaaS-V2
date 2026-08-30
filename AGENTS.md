# AGENTS.md — Protocole de collaboration Claude / Codex

## Rôles et alternance

| Tour                    | Rôle        | Agent  |
| ----------------------- | ----------- | ------ |
| Lot F0 — Implémentation | Implementer | Claude |
| Lot F0 — Revue          | Reviewer    | Codex  |
| Lot F1 — Implémentation | Implementer | Codex  |
| Lot F1 — Revue          | Reviewer    | Claude |

**Règle absolue** : Implementer et Reviewer ne modifient jamais simultanément les mêmes fichiers.

## Branches

- `main` : branche protégée — aucun push direct, aucun fast-forward
- `claude/f0-*` : branches Claude pour le lot F0
- `codex/f0-*` : branches Codex pour la revue F0
- `claude/f1-*` : branches Claude pour le lot F1

## Protocole de revue

1. L'implementer ouvre une PR vers `main` depuis sa branche de lot
2. Le reviewer lit le rapport final fourni dans la PR
3. Le reviewer crée une branche `{agent}/review-{lot}` et y dépose ses commentaires/corrections
4. Aucun merge sans que les deux agents aient signé

## Interdictions communes

- Aucun code importé depuis `veraluz-os` (monolithe V1)
- Aucun module métier avant F1
- Aucune migration PROD
- Aucun secret dans le dépôt
- Aucun merge ou fast-forward vers `main` sans validation croisée

## Démarrage Codex — Revue F0

```bash
git fetch origin
git checkout -b codex/review-f0 origin/claude/f0-foundation-bootstrap
# Lire le rapport final dans AI_HANDOFF.md
# Exécuter : pnpm validate
# Déposer les commentaires dans docs/CODEX_REVIEW_F0.md
```
