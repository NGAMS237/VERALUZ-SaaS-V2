# CODEX.md — Guide persistant pour l'agent Codex

Ce document complète `AGENTS.md` avec les instructions spécifiques à Codex.
Il ne recopie pas le protocole général — lire `AGENTS.md` en premier.

## Rôle de Codex par lot

| Lot   | Rôle Codex   |
| ----- | ------------ |
| F0    | Reviewer     |
| F0-R1 | Reviewer     |
| F1    | Implémenteur |
| F1-R1 | Reviewer     |

Le rôle alterne : Codex implémente les lots impairs, Claude implémente les lots pairs (convention initiale). Le rôle exact est confirmé dans le prompt de lot fourni par Blaise.

## Démarrage d'une session Codex

Avant toute action, lire dans cet ordre :

1. `AGENTS.md` — protocole général
2. `CLAUDE.md` — conventions de code
3. `AI_HANDOFF.md` — état livré par le lot précédent
4. `DECISIONS.md` — décisions techniques actées
5. `ROADMAP.md` — périmètre de chaque lot
6. `docs/ARCHITECTURE.md` — structure attendue
7. `docs/MULTITENANCY_AND_SECURITY.md` — règles de sécurité

Ne jamais travailler sans avoir lu ces documents. Ils évoluent à chaque lot.

## Règles de revue (Codex reviewer)

### Première passe : lecture seule

1. Cloner la branche livrée par l'implémenteur.
2. Lire le rapport final (`AI_HANDOFF.md`).
3. Exécuter la suite complète :
   ```bash
   pnpm install --frozen-lockfile
   pnpm format:check
   pnpm lint
   pnpm typecheck
   pnpm test:coverage
   pnpm build
   pnpm audit
   ```
4. Émettre `APPROVED` ou `CHANGES REQUIRED`.
5. **Ne modifier aucun fichier** pendant la première passe.
6. Déposer le rapport de revue dans `docs/CODEX_REVIEW_{LOT}.md`.

### Corrections (si CHANGES REQUIRED)

- Attendre l'autorisation de Blaise avant d'appliquer des corrections.
- Les corrections sont appliquées par l'implémenteur du lot, pas le reviewer.
- Exception : si Blaise autorise explicitement Codex à corriger, créer une branche `codex/{lot}-review-fixes`.

### Seconde passe

- Revérifier uniquement les points signalés en première passe.
- Émettre `APPROVED` ou `CHANGES REQUIRED` (second cycle).

## Interdictions absolues (rappel)

Ces règles s'appliquent à Codex comme à Claude. Voir `AGENTS.md` pour la liste complète.

- Aucun import depuis `veraluz-os`
- Aucune connexion Supabase distante (`supabase link` interdit)
- Aucune demande de PAT dans les rapports ou les logs
- Aucune donnée secrète dans les rapports (valeur de token, mot de passe, clé)
- Aucun merge vers `main` sans double validation + autorisation Blaise
- Aucune modification simultanée des mêmes fichiers entre deux agents

## Rapport de revue

Le rapport commence par les anomalies classées par gravité :

```
VERDICT: APPROVED | CHANGES REQUIRED

## Anomalies critiques (bloquantes)
## Anomalies majeures (correction avant merge)
## Anomalies mineures (recommandées)
## Observations (non bloquantes)
```

Chaque anomalie indique : fichier, ligne, description, impact, correction suggérée.

## Versions de référence

Ne pas corriger des versions qui fonctionnent. Avant toute mise à jour de dépendance :

1. Vérifier la compatibilité avec Next.js 16 et TypeScript 5.9.
2. Consulter `DECISIONS.md` pour les décisions déjà actées.
3. Documenter la décision si une version est modifiée.

Les versions exactes verrouillées sont dans `package.json`.
