# Product — VERALUZ SaaS V2

## Vision

VERALUZ SaaS V2 est une plateforme multi-tenant de gestion résidentielle,
conçue pour les gestionnaires d'immeubles résidentiels au Québec.

## Premier tenant pilote

**La Résidence VERALUZ** — `veraluz-001`

Cette résidence sera le terrain de validation de chaque fonctionnalité
avant déploiement général.

## Modules prévus

| Module         | Description                         | Lot |
| -------------- | ----------------------------------- | --- |
| Auth           | Authentification, gestion des accès | F1  |
| Résidents      | CRUD des résidents et unités        | F2  |
| Paiements      | Suivi des loyers et charges         | F2  |
| Communications | Messages et avis                    | F3  |
| Rapports       | Tableaux de bord et exports         | F3  |

## Contraintes réglementaires

- Données hébergées au Canada (Supabase région ca-central-1)
- Conformité LPRPDE / Loi 25 (Québec)
- Rétention des données configurable par tenant

## Principes UX

- Interface sobre et professionnelle
- Vocabulaire adapté au secteur résidentiel québécois
- Accessibilité WCAG 2.1 AA (cible F2+)
