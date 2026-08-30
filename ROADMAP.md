# ROADMAP — VERALUZ SaaS V2

## Lot F0 — Socle technique (Actuel)

**Statut : EN COURS**
**Branche** : `claude/f0-foundation-bootstrap`

### Livré ✅

- [x] Next.js 16.3.3 App Router + TypeScript strict
- [x] pnpm 11.24.0 comme gestionnaire unique (lockfile commité)
- [x] ESLint 10 + Prettier 3 configurés
- [x] Vitest 4 avec tests unitaires des endpoints API
- [x] Architecture modulaire `src/{app,lib,modules,components,styles}`
- [x] Tokens design `--vlz-*` (source visuelle unique)
- [x] `GET /api/kjemo/v1/manifest`
- [x] `GET /api/kjemo/v1/health/live`
- [x] `.env.example` sans secret
- [x] Validation Zod de la configuration serveur
- [x] Page minimale honnête "En construction"
- [x] CI GitHub Actions (lint + typecheck + tests + build)
- [x] `AI_HANDOFF.md`, `DECISIONS.md`, `ROADMAP.md` mis à jour

### Non inclus dans F0 (intentionnel)

- [ ] Client Supabase (→ F1)
- [ ] Authentification (→ F1)
- [ ] Modules métier (→ F1+)
- [ ] UI complète (→ UI-1)

---

## Lot F1 — Authentification + Tenant (À venir)

**Statut : PLANIFIÉ**
**Assigné à** : Codex (implémentation) → Claude (revue)

- Supabase local : initialisation du projet, migrations initiales
- Schéma multi-tenant : `tenants`, `users`, `memberships`
- Authentification Supabase Auth (email + magic link)
- Middleware de protection des routes
- Isolation des données par tenant (Row Level Security)
- Premier tenant pilote : `veraluz-001`

---

## Lot UI-1 — Design System de base (À venir)

**Statut : PLANIFIÉ**

- Composants React fondamentaux consommant les tokens `--vlz-*`
- Layout applicatif (sidebar, header, contenu)
- Page de login et de dashboard vide
- Storybook ou équivalent pour la documentation des composants

---

## Lot F2 — Gestion résidentielle (À venir)

**Statut : PLANIFIÉ**

- Module Résidents (CRUD)
- Module Unités
- Module Paiements (lecture seule)
- Dashboard Résidence VERALUZ (tenant `veraluz-001`)

---

## Horizon

| Lot  | Contenu                     | Assignation            |
| ---- | --------------------------- | ---------------------- |
| F0   | Socle technique             | Claude → Codex (revue) |
| F1   | Auth + Multi-tenant         | Codex → Claude (revue) |
| UI-1 | Design System               | TBD                    |
| F2   | Modules résidentiels        | TBD                    |
| F3   | Facturation + Notifications | TBD                    |
| GA   | Mise en production          | TBD                    |
