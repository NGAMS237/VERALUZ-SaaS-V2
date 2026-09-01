import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/modules/tenant/resolver";
import * as svc from "@/modules/rooms/services/room.service";
import { setRoomStatusSchema } from "@/modules/rooms/domain/validators";
import type { SetRoomStatusCommand } from "@/modules/rooms/domain/types";
import { ROOM_OPERATIONAL_STATUSES } from "@/modules/rooms/domain/types";
import { ok, handleError } from "@/lib/api/response";

interface Ctx {
  params: Promise<{ tenantSlug: string; roomId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug, roomId } = await params;
    const supabase = await createClient();
    const { tenant, role } = await resolveTenantContext(supabase, tenantSlug);
    if (role !== "owner" && role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const p = setRoomStatusSchema.parse(body);
    const status = p.operationalStatus as (typeof ROOM_OPERATIONAL_STATUSES)[number];
    const cmd: SetRoomStatusCommand = { operationalStatus: status };
    if (p.isActive !== undefined) cmd.isActive = p.isActive;
    return ok(await svc.setRoomStatus(supabase, tenant.id, roomId, cmd));
  } catch (err) {
    return handleError(err);
  }
}
