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

La revue Claude doit porter sur le delta :

```text
1651c5f7c40eb5b6ee8b1d9a63bae4b00f7183ba
..f36bdbc7dc16c272e1e5bb82707c81f0fc75ad56
```
