/**
 * src/app/t/[tenantSlug]/dashboard/page.tsx
 * Tableau de bord — nombres réels de chambres et catégories, aucune donnée simulée.
 *
 * Dans Next.js 16, params est asynchrone.
 */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTenantContext } from "@/lib/tenant-context";
import { listRooms } from "@/modules/rooms/services/room.service";
import { listRoomCategories } from "@/modules/rooms/services/room-category.service";
import { futureModules } from "@/components/shell/navigation";

interface DashboardPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { tenantSlug } = await params;
  const { tenant } = await getTenantContext(tenantSlug);
  const supabase = await createClient();

  const [rooms, categories] = await Promise.all([
    listRooms(supabase, { tenantId: tenant.id }),
    listRoomCategories(supabase, { tenantId: tenant.id }),
  ]);

  const activeRooms = rooms.filter((r) => r.isActive).length;
  const outOfServiceRooms = rooms.filter((r) => r.operationalStatus === "out_of_service").length;
  const activeCategories = categories.filter((c) => c.isActive).length;

  return (
    <>
      <section className="vlz-dashboard-hero">
        <span className="vlz-dashboard-hero-eyebrow">Espace {tenant.name}</span>
        <h1 className="vlz-dashboard-hero-title">Tableau de bord</h1>
        <p className="vlz-dashboard-hero-subtitle">
          Vue d&apos;ensemble de l&apos;inventaire de chambres et des catégories pour cet
          établissement.
        </p>
      </section>

      <section className="vlz-metrics-grid" aria-label="Indicateurs clés">
        <div className="vlz-metric-card">
          <span className="vlz-metric-card-label">Chambres actives</span>
          <span className="vlz-metric-card-value">{activeRooms}</span>
          <span className="vlz-metric-card-meta">sur {rooms.length} au total</span>
        </div>
        <div className="vlz-metric-card">
          <span className="vlz-metric-card-label">Chambres hors service</span>
          <span className="vlz-metric-card-value">{outOfServiceRooms}</span>
          <span className="vlz-metric-card-meta">nécessitent une attention</span>
        </div>
        <div className="vlz-metric-card">
          <span className="vlz-metric-card-label">Catégories actives</span>
          <span className="vlz-metric-card-value">{activeCategories}</span>
          <span className="vlz-metric-card-meta">sur {categories.length} au total</span>
        </div>
      </section>

      <section className="vlz-section">
        <div className="vlz-section-header">
          <h2 className="vlz-section-title">Modules à venir</h2>
        </div>
        <div className="vlz-modules-grid">
          {futureModules.map((module) => (
            <Link
              key={module.slug}
              href={`/t/${tenantSlug}/modules/${module.slug}`}
              className="vlz-module-tile"
            >
              <span className="vlz-module-tile-title">{module.label}</span>
              <span className="vlz-module-tile-description">{module.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
