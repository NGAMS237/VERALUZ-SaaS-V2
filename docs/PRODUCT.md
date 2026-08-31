# Product — VERALUZ SaaS V2

## Vision

VERALUZ SaaS V2 est une plateforme multi-tenant destinée aux résidences,
hôtels et établissements d'hébergement. Le lancement est orienté Cameroun,
avec une architecture conçue pour s'étendre progressivement à d'autres pays
africains.

## Premier tenant pilote

**La Résidence VERALUZ** — `veraluz-001`

Ce tenant sera le terrain de validation de chaque fonctionnalité avant
déploiement général. Les décisions de configuration propres à ce tenant
(région, domaine, paramètres locaux) seront définies avec Blaise avant le
déploiement.

## Modules prévus

`ROADMAP.md` est la source canonique du périmètre et de l'ordre des lots.
La plateforme couvre notamment :

| Famille                     | Contenu principal                                              | Lots                    |
| --------------------------- | -------------------------------------------------------------- | ----------------------- |
| Identité et établissements  | Auth, tenants, chambres, catégories, paramètres                | F1, CORE-1, UI-1        |
| Réservations et séjour      | Réservation, pré-arrivée, check-in, séjour, folio, check-out   | MIG-R1, RES-1, STAY-1/2 |
| Expérience client           | Guest Portal, documents et communications                      | MIG-G1, GUEST-1, DOC-1  |
| Opérations                  | Housekeeping, maintenance, restaurant, room service, livraison | OPS-1/2, FNB-1          |
| Finance et administration   | Paiements clients, comptabilité, RH et paie                    | PAY-1, FIN-1, HR-1      |
| Pilotage                    | CRM, rapports, tableaux de bord, agents IA                     | CRM-1, REPORT-1, AI-1   |
| Mobilité et mise en service | PWA, applications mobiles, pilote `veraluz-001`                | MOB-1, GA               |

Les modules Réservations et Guest Portal de V1 servent uniquement de référence
métier en lecture seule. Le code V1 n'est ni importé ni copié : chaque module V2
passe par audit, contrat, schéma, sécurité, implémentation, tests et revue indépendante.

## Décisions en attente

Les points suivants seront décidés avec Blaise avant tout déploiement :

- Région d'hébergement des données (Supabase ou autre)
- Domaine internet de l'application
- Pays et réglementations applicables
- Certifications ou normes à respecter

## Principes UX

- Interface sobre et professionnelle
- Accessibilité WCAG 2.1 AA (cible UI-1+)
