# ROADMAP — VERALUZ SaaS V2

Plateforme de gestion complète pour résidences, hôtels et établissements d'hébergement.
Versions exactes des dépendances : voir `package.json`.

---

## Cycle canonique du séjour

```
Disponibilité
→ pending hold
→ réservation confirmée
→ acompte/paiement selon les règles
→ pré-arrivée
→ arrivée physique
→ check-in par le personnel
→ séjour checked-in
→ charges et paiements
→ préparation du départ
→ check-out
→ housekeeping
→ clôture du folio
→ CRM, avis et rapports
```

**Règles absolues :**

- Une réservation confirmée ou payée n'est **pas** un check-in.
- Le check-in intervient lors de l'arrivée physique.
- Le Guest Portal peut exister avant l'arrivée avec des accès limités.
- Les données sensibles du séjour exigent un véritable check-in.
- Heure de départ métier de référence : `12:00` (future valeur configurable par tenant).

---

## Domaines fonctionnels de la plateforme

La plateforme couvre les domaines suivants (chaque domaine fera l'objet d'un ou plusieurs lots) :

1. Établissements et tenants
2. Chambres
3. Catégories de chambres
4. Tarifs et disponibilités
5. Réservations
6. Pré-arrivée
7. Arrivée / check-in
8. Séjour
9. Folio et charges
10. Départ / check-out
11. Guest Portal
12. Housekeeping
13. Maintenance
14. Restaurant / room service
15. Livraison
16. Paiements clients
17. Facturation
18. Comptabilité
19. RH et paie
20. Documents
21. CRM
22. Rapports
23. Communications et notifications
24. Paramètres opérationnels
25. Agents IA et centre IA
26. PWA et futures applications mobiles

---

## Cycle de développement par module

Chaque module suit obligatoirement cette séquence — sans big bang :

```
Audit
→ contrat
→ schéma
→ sécurité
→ implémentation
→ tests
→ revue indépendante
→ corrections
→ validation
```

---

## Lots

### F0 — Socle technique

**Statut : LIVRÉ — en cours de révision**
**Branche** : `claude/f0-foundation-bootstrap` → `claude/f0-review-fixes`

#### Livré ✅

- [x] Next.js 16.3.3 App Router + TypeScript strict
- [x] pnpm 11.24.0 comme gestionnaire unique (lockfile commité)
- [x] ESLint 9 + Prettier 3 configurés (ESLint 10 incompatible avec eslint-config-next 16)
- [x] Vitest 4 avec tests unitaires des endpoints API (couverture ≥ 80 %)
- [x] Architecture modulaire `src/{app,lib,modules,components,styles}`
- [x] Tokens design `--vlz-*` (source visuelle unique)
- [x] `GET /api/kjemo/v1/manifest` (statique, version depuis `package.json`)
- [x] `GET /api/kjemo/v1/health/live` (toujours 200 — liveness)
- [x] `GET /api/kjemo/v1/health/ready` (200/503 — readiness)
- [x] `.env.example` sans secret
- [x] Validation Zod 3.x stricte (`FEATURE_MAINTENANCE` : enum `"true"|"false"` uniquement)
- [x] Page minimale honnête "En construction"
- [x] CI GitHub Actions (actions pinnées aux SHA)
- [x] `src/instrumentation.ts` — validation env au démarrage serveur

#### Non inclus dans F0 (intentionnel)

- [ ] Client Supabase (→ F1)
- [ ] Authentification (→ F1)
- [ ] Modules métier (→ F1+)
- [ ] UI complète (→ UI-1)

---

### F0-R1 — Corrections post-revue Codex

**Statut : EN COURS**
**Branche** : `claude/f0-review-fixes`
**Assigné à** : Claude (corrections) → Codex (seconde revue)

Corrections R1-01 à R1-16 sur le socle F0.

---

### F1 — Identité, tenant et sécurité

**Statut : PLANIFIÉ**
**Assigné à** : Codex (implémentation) → Claude (revue)

- Supabase local : initialisation du projet, migrations initiales
- Schéma multi-tenant : `tenants`, `users`, `memberships`
- Authentification Supabase Auth
- Résolution du tenant (`/t/[tenantSlug]/`)
- Isolation des données par tenant (RLS avec `auth.uid()` + `memberships`)
- Premier tenant pilote : `veraluz-001`

---

### CORE-1 — Établissements, chambres, catégories et paramètres

**Statut : PLANIFIÉ**

- CRUD établissements et propriétés par tenant
- CRUD chambres et unités
- CRUD catégories de chambres
- Paramètres opérationnels (heure de départ, politiques, etc.)
- Tarifs de base et disponibilités

---

### UI-1 — Design System et shell applicatif

**Statut : PLANIFIÉ**

- Composants React fondamentaux consommant les tokens `--vlz-*`
- Layout applicatif (sidebar, header, contenu)
- Page de login et dashboard vide
- Shell responsive pour les modules métier à venir

---

### MIG-R1 — Audit fonctionnel Réservations V1

**Statut : PLANIFIÉ**
**Source** : `NGAMS237/veraluz-os` (lecture seule)

Audit autorisé :

1. Lecture seule du code V1
2. Inventaire des fonctionnalités de réservation
3. Extraction des règles métier et machines d'états
4. Identification des données canoniques
5. Production des contrats V2
6. Production des tests d'acceptation V2

Interdit :

- Importer les fichiers source V1
- Copier-coller le monolithe
- Importer les composants HTML V1
- Connecter V2 à la base distante V1
- Reproduire les anciennes politiques RLS permissives

---

### RES-1 — Réservations V2

**Statut : PLANIFIÉ** (après MIG-R1)

- Cycle complet : disponibilité → pending hold → confirmation → acompte
- Politiques d'annulation et de modification
- Gestion des tarifs et des disponibilités en temps réel
- Audit trail des changements d'état

---

### STAY-1 — Arrivée, check-in et séjour

**Statut : PLANIFIÉ** (après RES-1)

- Pré-arrivée : communications, préférences, documents
- Enregistrement d'arrivée physique (check-in par le personnel)
- Transition réservation → séjour checked-in
- Gestion du séjour en cours

---

### STAY-2 — Folio, charges et check-out

**Statut : PLANIFIÉ** (après STAY-1)

- Folio client : charges, extras, room service
- Paiements partiels et solde au départ
- Préparation et exécution du check-out (heure de référence 12:00)
- Clôture du folio

---

### MIG-G1 — Audit fonctionnel Guest Portal V1

**Statut : PLANIFIÉ**
**Source** : `NGAMS237/veraluz-os` (lecture seule)

Même périmètre d'audit que MIG-R1, appliqué au Guest Portal V1.

---

### GUEST-1 — Guest Portal V2

**Statut : PLANIFIÉ** (après MIG-G1)

- Portail accessible avant l'arrivée (accès limités)
- Accès aux données sensibles uniquement après check-in
- Self-service : réservations d'extras, demandes, documents

---

### OPS-1 — Housekeeping

**Statut : PLANIFIÉ**

- Planification des tâches de nettoyage par chambre
- Suivi de l'état des chambres (sale / propre / en cours / bloquée)
- Intégration avec le cycle check-out → disponibilité

---

### OPS-2 — Maintenance

**Statut : PLANIFIÉ**

- Tickets de maintenance par chambre ou zone
- Priorités et assignation
- Blocage de chambre pour maintenance
- Suivi de résolution

---

### FNB-1 — Restaurant, room service et livraison

**Statut : PLANIFIÉ**

- Gestion des commandes restaurant et room service
- Intégration folio (charges automatiques au séjour)
- Livraison interne et traçabilité

---

### PAY-1 — Paiements clients

**Statut : PLANIFIÉ**

- Intégration passerelle de paiement (à décider avec Blaise)
- Paiements en ligne : acomptes, soldes, extras
- Réconciliation automatique avec les folios
- Remboursements

---

### FIN-1 — Comptabilité et rapports financiers

**Statut : PLANIFIÉ**

- Export comptable (format à définir)
- Rapports de revenus par période, par catégorie, par tenant
- Clôture de caisse journalière

---

### HR-1 — RH et paie

**Statut : PLANIFIÉ**

- Gestion du personnel par établissement
- Plannings et présences
- Éléments de paie (calculs, exports)

---

### DOC-1 — Documents

**Statut : PLANIFIÉ**

- Génération de documents : confirmations, factures, contrats
- Stockage sécurisé par tenant
- Envoi automatique par email / notifications

---

### CRM-1 — CRM, communications et notifications

**Statut : PLANIFIÉ**

- Profils clients et historique des séjours
- Segments et campagnes
- Notifications automatiques (pré-arrivée, départ, suivi)
- Collecte d'avis post-séjour

---

### REPORT-1 — Rapports et tableaux de bord

**Statut : PLANIFIÉ**

- Tableaux de bord opérationnels (taux d'occupation, RevPAR, etc.)
- Rapports exportables
- Indicateurs par tenant et par établissement

---

### AI-1 — Centre IA et agents

**Statut : PLANIFIÉ**

- Agents IA opérationnels (housekeeping, réservations, maintenance)
- Centre de supervision des agents
- Intégration avec les modules métier existants

---

### MOB-1 — PWA et applications mobiles

**Statut : PLANIFIÉ**

- Progressive Web App pour le personnel et les gestionnaires
- Futures applications mobiles natives (iOS / Android)
- Notifications push

---

### GA — Préparation production et pilote veraluz-001

**Statut : PLANIFIÉ** (après validation de tous les modules critiques)
**À décider avec Blaise avant tout déploiement.**

- Choix de la région de déploiement
- Conformité réglementaire applicable
- Pilote sur le tenant `veraluz-001`
- Monitoring et alertes production

---

## Tableau de bord des lots

| Lot      | Contenu                               | Statut      | Assignation            |
| -------- | ------------------------------------- | ----------- | ---------------------- |
| F0       | Socle technique                       | ✅ LIVRÉ    | Claude → Codex (revue) |
| F0-R1    | Corrections socle                     | 🔄 EN COURS | Claude → Codex (revue) |
| F1       | Identité, tenant et sécurité          | PLANIFIÉ    | Codex → Claude (revue) |
| CORE-1   | Établissements, chambres, paramètres  | PLANIFIÉ    | TBD                    |
| UI-1     | Design System et shell applicatif     | PLANIFIÉ    | TBD                    |
| MIG-R1   | Audit fonctionnel Réservations V1     | PLANIFIÉ    | TBD                    |
| RES-1    | Réservations V2                       | PLANIFIÉ    | TBD                    |
| STAY-1   | Arrivée, check-in et séjour           | PLANIFIÉ    | TBD                    |
| STAY-2   | Folio, charges et check-out           | PLANIFIÉ    | TBD                    |
| MIG-G1   | Audit fonctionnel Guest Portal V1     | PLANIFIÉ    | TBD                    |
| GUEST-1  | Guest Portal V2                       | PLANIFIÉ    | TBD                    |
| OPS-1    | Housekeeping                          | PLANIFIÉ    | TBD                    |
| OPS-2    | Maintenance                           | PLANIFIÉ    | TBD                    |
| FNB-1    | Restaurant, room service et livraison | PLANIFIÉ    | TBD                    |
| PAY-1    | Paiements clients                     | PLANIFIÉ    | TBD                    |
| FIN-1    | Comptabilité et rapports financiers   | PLANIFIÉ    | TBD                    |
| HR-1     | RH et paie                            | PLANIFIÉ    | TBD                    |
| DOC-1    | Documents                             | PLANIFIÉ    | TBD                    |
| CRM-1    | CRM, communications et notifications  | PLANIFIÉ    | TBD                    |
| REPORT-1 | Rapports et tableaux de bord          | PLANIFIÉ    | TBD                    |
| AI-1     | Centre IA et agents                   | PLANIFIÉ    | TBD                    |
| MOB-1    | PWA et applications mobiles           | PLANIFIÉ    | TBD                    |
| GA       | Préparation production et pilote      | PLANIFIÉ    | À décider avec Blaise  |
