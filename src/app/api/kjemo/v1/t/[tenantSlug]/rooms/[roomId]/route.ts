import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/modules/tenant/resolver";
import * as svc from "@/modules/rooms/services/room.service";
import { updateRoomSchema } from "@/modules/rooms/domain/validators";
import type { UpdateRoomCommand } from "@/modules/rooms/domain/types";
import { ok, handleError } from "@/lib/api/response";

interface Ctx {
  params: Promise<{ tenantSlug: string; roomId: string }>;
}

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug, roomId } = await params;
    const supabase = await createClient();
    const { tenant } = await resolveTenantContext(supabase, tenantSlug);
    return ok(await svc.getRoomById(supabase, tenant.id, roomId));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug, roomId } = await params;
    const supabase = await createClient();
    const { tenant, role } = await resolveTenantContext(supabase, tenantSlug);
    if (role !== "owner" && role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const p = updateRoomSchema.parse(body);
    const cmd: UpdateRoomCommand = {};
    if (p.roomCategoryId !== undefined) cmd.roomCategoryId = p.roomCategoryId;
    if (p.name !== undefined) cmd.name = p.name;
    if (p.floor !== undefined) cmd.floor = p.floor;
    if (p.description !== undefined) cmd.description = p.description;
    return ok(await svc.updateRoom(supabase, tenant.id, roomId, cmd));
  } catch (err) {
    return handleError(err);
  }
}
