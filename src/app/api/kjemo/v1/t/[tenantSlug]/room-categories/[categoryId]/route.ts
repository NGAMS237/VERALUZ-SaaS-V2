import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/modules/tenant/resolver";
import * as svc from "@/modules/rooms/services/room-category.service";
import { updateRoomCategorySchema } from "@/modules/rooms/domain/validators";
import type { UpdateRoomCategoryCommand } from "@/modules/rooms/domain/types";
import { ok, handleError } from "@/lib/api/response";

interface Ctx {
  params: Promise<{ tenantSlug: string; categoryId: string }>;
}

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug, categoryId } = await params;
    const supabase = await createClient();
    const { tenant } = await resolveTenantContext(supabase, tenantSlug);
    return ok(await svc.getRoomCategoryById(supabase, tenant.id, categoryId));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug, categoryId } = await params;
    const supabase = await createClient();
    const { tenant, role } = await resolveTenantContext(supabase, tenantSlug);
    if (role !== "owner" && role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const p = updateRoomCategorySchema.parse(body);
    const cmd: UpdateRoomCategoryCommand = {};
    if (p.name !== undefined) cmd.name = p.name;
    if (p.description !== undefined) cmd.description = p.description;
    if (p.baseOccupancy !== undefined) cmd.baseOccupancy = p.baseOccupancy;
    if (p.maxAdults !== undefined) cmd.maxAdults = p.maxAdults;
    if (p.maxChildren !== undefined) cmd.maxChildren = p.maxChildren;
    if (p.maxOccupancy !== undefined) cmd.maxOccupancy = p.maxOccupancy;
    return ok(await svc.updateRoomCategory(supabase, tenant.id, categoryId, cmd));
  } catch (err) {
    return handleError(err);
  }
}
