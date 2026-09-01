# AI_HANDOFF — F0-R1 corrections Codex autorisées

## Statut

- **Projet** : VERALUZ SaaS V2
- **Lot** : F0-R1 — remise en conformité du socle
- **Branche locale** : `codex/f0-r1-review-fixes`
- **Source examinée** : `1651c5f7c40eb5b6ee8b1d9a63bae4b00f7183ba`
- **Commit correctif validé** : `f36bdbc7dc16c272e1e5bb82707c81f0fc75ad56`
- **Agent correcteur** : Codex, avec autorisation explicite de Blaise
- **Prochain agent** : Claude — revue indépendante
- **Date** : 2026-08-31

## Corrections livrées

1. Configuration pnpm 11 déplacée de `.npmrc` vers `pnpm-workspace.yaml`.
2. `minimumReleaseAge: 1440` est effectif et vérifié.
3. Les scripts de build `esbuild` et `unrs-resolver` sont explicitement approuvés.
4. Les tokens CSS ajoutés en F0-R1 sont replacés dans `:root`.
5. L'affectation TypeScript invalide de `NODE_ENV` dans les tests est supprimée.
6. `APP_ENV` devient une variable serveur obligatoire.
7. `FEATURE_MAINTENANCE` devient un flag serveur strict.
8. Les placeholders Supabase inutilisés sont retirés de F0 ; ils seront introduits en F1.
9. Le manifest est réellement statique avec `revalidate = false`.
10. L'exception framework `process.env.NEXT_RUNTIME` est documentée dans le skill et l'architecture.
11. `docs/PRODUCT.md` est réaligné sur les 26 domaines et les lots de `ROADMAP.md`.
12. Les anciennes références produit `F2/F3` incompatibles avec la roadmap sont retirées.

## Validation indépendante dans un worktree neuf

Runtime exact : Node.js `22.23.2` et pnpm `11.24.0`.

| Vérification                     | Résultat                                        |
| -------------------------------- | ----------------------------------------------- |
| `pnpm install --frozen-lockfile` | PASS — 394 packages, lockfile figé              |
| Politique supply-chain           | PASS — 502 entrées                              |
| Scripts approuvés                | PASS — esbuild et unrs-resolver exécutés        |
| `pnpm format:check`              | PASS                                            |
| `pnpm lint`                      | PASS — 0 warning                                |
| `pnpm typecheck`                 | PASS                                            |
| `pnpm test:coverage`             | PASS — 34/34                                    |
| Couverture                       | PASS — 100 % déclaré sur le périmètre configuré |
| `pnpm build`                     | PASS                                            |
| Manifest                         | PASS — route pré-rendue statiquement            |
| Health live/ready                | PASS — routes dynamiques                        |
| `pnpm audit`                     | PASS — aucune vulnérabilité connue              |
| `git diff --check`               | PASS                                            |

Test négatif supplémentaire :

- un build sans `APP_ENV` échoue avec une erreur explicite nommant la variable manquante.

## Sécurité et périmètre

- Aucun secret détecté dans le delta.
- Aucun import ni copie de code depuis `NGAMS237/veraluz-os`.
- Aucun client, migration ou accès Supabase en F0.
- Aucun déploiement.
- Aucun email Resend.
- Aucun merge ou fast-forward vers `main`.

## Roadmap produit

`ROADMAP.md` reste la source canonique. Elle contient les 26 domaines, notamment
chambres et catégories, réservations, check-in, séjour, check-out, Guest Portal,
housekeeping, maintenance, restaurant/room service, paiements, comptabilité, RH,
documents, CRM, rapports, communications et agents IA.

`MIG-R1` et `MIG-G1` autorisent uniquement l'audit métier en lecture seule de V1.
Les modules V2 devront être réimplémentés après contrat, schéma, sécurité et tests.

## Point externe restant

Le connecteur GitHub retourne actuellement `404 Repository not found` pour le dépôt
privé `NGAMS237/veraluz-v2`. La branche n'a donc pas été poussée et le statut CI
distant n'a pas pu être vérifié. Aucun PAT ne doit être demandé ou communiqué.

## Prêt pour revue Claude

**READY FOR CLAUDE REVIEW : OUI**

La revue Claude doit porter sur le delta complet entre la source F0-R1 et le
HEAD livré de `codex/f0-r1-review-fixes`. Le commit de code validé est inclus
dans ce delta :

```text
source : 1651c5f7c40eb5b6ee8b1d9a63bae4b00f7183ba
code   : f36bdbc7dc16c272e1e5bb82707c81f0fc75ad56
final  : HEAD de codex/f0-r1-review-fixes (handoff inclus)
```

---

# AI_HANDOFF — F1 Identité, tenant et authentification

## Statut

- **Projet** : VERALUZ SaaS V2
- **Lot** : F1 — identité multi-tenant + authentification Supabase Auth
- **Branche** : `claude/f1-identity-tenant-auth`
- **Implémenteur** : Claude (gouvernance F1 révisée par Blaise)
- **Réviseur attendu** : Codex
- **Date** : 2026-08-31

## SHA des commits F1

| SHA       | Message                                                          |
| --------- | ---------------------------------------------------------------- |
| `76bc62f` | feat(f1): init supabase local + migration multi-tenant + RLS    |
| `f25741f` | feat(f1): clients Supabase typés + variables env + types DB     |
| `34951c9` | feat(f1): proxy Next.js 16 + résolution tenant                  |
| `3e4c9db` | feat(f1): routing /t/[tenantSlug] + login/logout UI + API       |
| `3488b89` | test(f1): tests Vitest clients Supabase, resolver, env, logout  |
| `7028b15` | chore(f1): CI + env.example + package.json + fix build          |

## Résultats de validation

| Vérification          | Résultat                                           |
| --------------------- | -------------------------------------------------- |
| `pnpm format:check`   | ✅ PASS — 0 erreur                                 |
| `pnpm lint`           | ✅ PASS — 0 warning                                |
| `pnpm typecheck`      | ✅ PASS — 0 erreur                                 |
| `pnpm test`           | ✅ PASS — 58/58 tests                              |
| `pnpm test:coverage`  | ✅ PASS — 90.9 % stmts, 100 % branches, 80 % fns  |
| `pnpm build`          | ✅ PASS (avec APP_ENV=production)                  |
| `git diff --check`    | ✅ PASS — 0 espace de fin                          |
| Scan secrets          | ✅ PASS — 0 secret détecté                         |
| pgTAP RLS (local)     | ⚠️ Non exécuté (Docker indisponible en sandbox)   |

### Note pgTAP
Les 24 tests pgTAP sont écrits dans `supabase/tests/01_rls_tenant_isolation.test.sql`.
Le job CI `supabase-local` les exécutera automatiquement sur GitHub Actions (Docker disponible).
Codex peut les valider en local avec : `supabase start && supabase test db`

## Décisions techniques F1

| Décision | Choix | Raison |
| --- | --- | --- |
| Naming clé publique | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Convention Supabase 2025+ (pas ANON_KEY) |
| Session server-side | `getClaims()` uniquement | Jamais `getSession()` côté serveur (vulnérabilité) |
| Middleware Next.js 16 | `src/proxy.ts` | Next.js 16 n'utilise plus `middleware.ts` |
| Params async App Router | `params: Promise<{...}>` | Obligatoire en Next.js 16 |
| redirect() type | `as any` cast | Next.js 16 RouteImpl — chemin dynamique non statiquement connu |
| ENUM role | PostgreSQL ENUM | Cohérence DB, pas CHECK TEXT |
| Schema private | SECURITY DEFINER functions | Isoler triggers et helpers des rôles publics |

## Périmètre respecté

- ✅ Aucun import depuis `NGAMS237/veraluz-os`
- ✅ Aucune migration distante / `supabase link` / `supabase db push`
- ✅ Aucun secret dans les commits, logs ou fichiers
- ✅ Aucun push direct vers `main`
- ✅ Aucun module métier (réservations, chambres, séjour)
- ✅ Aucun développement F1-v3.1 / KJORA / KAJORA / KJEMO Studios
- ✅ Aucun email Resend; aucun appel HyperFrames

## Commande de démarrage pour Codex (revue)

```bash
git fetch origin claude/f1-identity-tenant-auth
git checkout claude/f1-identity-tenant-auth
# Lire AI_HANDOFF.md section F1
pnpm install && pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:coverage && APP_ENV=production NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=test pnpm build
# Optionnel — pgTAP si Docker disponible :
# supabase start && supabase test db
```
