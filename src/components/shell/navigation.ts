/**
 * src/components/shell/navigation.ts
 * Source unique de la navigation du shell applicatif (SSOT).
 *
 * `mainNavItems` : modules livrés en UI-1 (routes réelles).
 * `futureModules` : domaines de ROADMAP.md non encore implémentés — affichés
 * comme placeholders honnêtes « À venir » (aucune logique métier, aucune donnée simulée).
 */

export interface NavItem {
  id: string;
  label: string;
  segment: string;
}

export const mainNavItems: NavItem[] = [
  { id: "dashboard", label: "Tableau de bord", segment: "dashboard" },
  { id: "rooms", label: "Chambres", segment: "rooms" },
  { id: "room-categories", label: "Catégories", segment: "room-categories" },
  { id: "settings", label: "Paramètres", segment: "settings" },
];

export interface FutureModule {
  slug: string;
  label: string;
  description: string;
  lot: string;
}

/** Domaines de ROADMAP.md non couverts par UI-1 — placeholders uniquement. */
export const futureModules: FutureModule[] = [
  {
    slug: "reservations",
    label: "Réservations",
    description: "Disponibilité, retenue et confirmation de séjour.",
    lot: "RES-1",
  },
  {
    slug: "check-in",
    label: "Arrivée / check-in",
    description: "Enregistrement d'arrivée physique par le personnel.",
    lot: "STAY-1",
  },
  {
    slug: "stay",
    label: "Séjour",
    description: "Suivi du séjour en cours et des charges associées.",
    lot: "STAY-1",
  },
  {
    slug: "check-out",
    label: "Départ / check-out",
    description: "Préparation du départ et clôture du folio.",
    lot: "STAY-2",
  },
  {
    slug: "guest-portal",
    label: "Guest Portal",
    description: "Portail client en libre-service avant et pendant le séjour.",
    lot: "GUEST-1",
  },
  {
    slug: "housekeeping",
    label: "Housekeeping",
    description: "Planification et suivi du nettoyage des chambres.",
    lot: "OPS-1",
  },
  {
    slug: "maintenance",
    label: "Maintenance",
    description: "Tickets et suivi des interventions techniques.",
    lot: "OPS-2",
  },
  {
    slug: "restaurant",
    label: "Restaurant / room service",
    description: "Commandes restaurant, room service et livraison.",
    lot: "FNB-1",
  },
  {
    slug: "payments",
    label: "Paiements",
    description: "Paiements clients en ligne et réconciliation des folios.",
    lot: "PAY-1",
  },
  {
    slug: "accounting",
    label: "Comptabilité",
    description: "Export comptable et rapports financiers.",
    lot: "FIN-1",
  },
  {
    slug: "hr",
    label: "RH",
    description: "Personnel, plannings et éléments de paie.",
    lot: "HR-1",
  },
  {
    slug: "documents",
    label: "Documents",
    description: "Génération et stockage sécurisé des documents.",
    lot: "DOC-1",
  },
  {
    slug: "crm",
    label: "CRM",
    description: "Profils clients, segments et historique des séjours.",
    lot: "CRM-1",
  },
  {
    slug: "reports",
    label: "Rapports",
    description: "Tableaux de bord opérationnels et indicateurs exportables.",
    lot: "REPORT-1",
  },
  {
    slug: "communications",
    label: "Communications",
    description: "Notifications automatiques et collecte d'avis.",
    lot: "CRM-1",
  },
  {
    slug: "ai-agents",
    label: "Agents IA",
    description: "Centre de supervision des agents IA opérationnels.",
    lot: "AI-1",
  },
];

export function findFutureModule(slug: string): FutureModule | undefined {
  return futureModules.find((m) => m.slug === slug);
}
