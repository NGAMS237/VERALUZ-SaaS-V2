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

| Module         | Description                         | Lot |
| -------------- | ----------------------------------- | --- |
| Auth           | Authentification, gestion des accès | F1  |
| Résidents      | CRUD des résidents et unités        | F2  |
| Paiements      | Suivi des loyers et charges         | F2  |
| Communications | Messages et avis                    | F3  |
| Rapports       | Tableaux de bord et exports         | F3  |

## Décisions en attente

Les points suivants seront décidés avec Blaise avant tout déploiement :

- Région d'hébergement des données (Supabase ou autre)
- Domaine internet de l'application
- Pays et réglementations applicables
- Certifications ou normes à respecter

## Principes UX

- Interface sobre et professionnelle
- Accessibilité WCAG 2.1 AA (cible F2+)
