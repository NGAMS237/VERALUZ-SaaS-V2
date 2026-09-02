/**
 * src/app/t/[tenantSlug]/rooms/page.tsx
 * Liste, filtres, création, modification et statut des chambres.
 *
 * Dans Next.js 16, params et searchParams sont asynchrones.
 */

import { createClient } from "@/lib/supabase/server";
import { getTenantContext, canWrite } from "@/lib/tenant-context";
import { listRooms } from "@/modules/rooms/services/room.service";
import { listRoomCategories } from "@/modules/rooms/services/room-category.service";
import type { RoomOperationalStatus } from "@/modules/rooms/domain/types";
import { ROOM_OPERATIONAL_STATUSES } from "@/modules/rooms/domain/types";
import { RoomsView } from "./rooms-view";

interface RoomsPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ categoryId?: string; status?: string }>;
}

function isValidStatus(value: string): value is RoomOperationalStatus {
  return (ROOM_OPERATIONAL_STATUSES as readonly string[]).includes(value);
}

export default async function RoomsPage({ params, searchParams }: RoomsPageProps) {
  const { tenantSlug } = await params;
  const sp = await searchParams;
  const categoryId = sp.categoryId ?? "";
  const status = sp.status ?? "";

  const { tenant, role } = await getTenantContext(tenantSlug);
  const supabase = await createClient();

  const [rooms, categories] = await Promise.all([
    listRooms(supabase, {
      tenantId: tenant.id,
      ...(categoryId !== "" ? { roomCategoryId: categoryId } : {}),
      ...(isValidStatus(status) ? { operationalStatus: status } : {}),
    }),
    listRoomCategories(supabase, { tenantId: tenant.id }),
  ]);

  return (
    <RoomsView
      tenantSlug={tenantSlug}
      rooms={rooms}
      categories={categories}
      canWrite={canWrite(role)}
      filters={{ categoryId, status }}
    />
  );
}
