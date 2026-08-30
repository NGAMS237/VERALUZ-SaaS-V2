# CLAUDE.md — Instructions pour l'agent Claude

## Contexte projet

Tu travailles sur **VERALUZ SaaS V2**, une plateforme multi-tenant de gestion
résidentielle. C'est un nouveau projet — le monolithe `veraluz-os` est une
référence métier uniquement, jamais une source de code à copier.

## Dépôt canonique

`NGAMS237/veraluz-v2`

## Règles absolues

1. **Ne jamais importer de code depuis `veraluz-os`**
2. **Ne jamais committer de secrets** (clés API, tokens, mots de passe)
3. **Ne jamais pousser vers `main`** directement
4. **Ne jamais exécuter `supabase link`** ou toute connexion à un projet Supabase distant
5. **Ne jamais déployer** (Vercel, Hostinger, Supabase PROD) depuis un lot en cours
6. **Ne jamais demander** qu'un PAT soit collé dans la conversation

## Conventions de code

- TypeScript strict : `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Tokens CSS `--vlz-*` comme seule source visuelle
- Variables d'environnement via `src/lib/config/env.ts` uniquement
- Tests dans `tests/` avec Vitest
- Commits atomiques avec préfixe conventionnel

## Architecture

Voir `docs/ARCHITECTURE.md` pour la structure modulaire complète.

## Workflow par lot

1. Lire `AI_HANDOFF.md` et `DECISIONS.md`
2. Créer une branche `claude/{lot}-{feature}`
3. Implémenter le périmètre défini
4. Exécuter `pnpm validate` avant tout commit
5. Mettre à jour `AI_HANDOFF.md`, `DECISIONS.md`, `ROADMAP.md`
6. Pousser la branche (jamais vers main)
7. Produire le rapport final

## Skill de garde-fou

Le skill `veraluz-architecture-guardian` doit être activé à chaque session
pour vérifier la conformité architecturale avant tout commit.
