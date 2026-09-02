/**
 * src/app/t/[tenantSlug]/room-categories/page.tsx
 * Liste, création, modification et activation des catégories de chambres.
 *
 * Dans Next.js 16, params et searchParams sont asynchrones.
 */

import { createClient } from "@/lib/supabase/server";
import { getTenantContext, canWrite } from "@/lib/tenant-context";
import { listRoomCategories } from "@/modules/rooms/services/room-category.service";
import { RoomCategoriesView } from "./room-categories-view";

interface RoomCategoriesPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ active?: string }>;
}

export default async function RoomCategoriesPage({
  params,
  searchParams,
}: RoomCategoriesPageProps) {
  const { tenantSlug } = await params;
  const { active } = await searchParams;
  const activeFilter: "all" | "active" | "inactive" =
    active === "active" || active === "inactive" ? active : "all";

  const { tenant, role } = await getTenantContext(tenantSlug);
  const supabase = await createClient();
  const categories = await listRoomCategories(supabase, {
    tenantId: tenant.id,
    ...(activeFilter === "active" ? { activeOnly: true } : {}),
  });

  const filtered = activeFilter === "inactive" ? categories.filter((c) => !c.isActive) : categories;

  return (
    <RoomCategoriesView
      tenantSlug={tenantSlug}
      categories={filtered}
      canWrite={canWrite(role)}
      activeFilter={activeFilter}
    />
  );
}
