import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/modules/tenant/resolver";
import * as svc from "@/modules/rooms/services/room.service";
import { createRoomSchema } from "@/modules/rooms/domain/validators";
import type { CreateRoomCommand, ListRoomsFilter } from "@/modules/rooms/domain/types";
import { ROOM_OPERATIONAL_STATUSES } from "@/modules/rooms/domain/types";
import { ok, created, handleError } from "@/lib/api/response";

interface Ctx {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug } = await params;
    const supabase = await createClient();
    const { tenant } = await resolveTenantContext(supabase, tenantSlug);
    const sp = new URL(req.url).searchParams;
    const filter: ListRoomsFilter = {
      tenantId: tenant.id,
      activeOnly: sp.get("active") === "true",
    };
    const catId = sp.get("categoryId");
    if (catId) filter.roomCategoryId = catId;
    return ok(await svc.listRooms(supabase, filter));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug } = await params;
    const supabase = await createClient();
    const { tenant, role } = await resolveTenantContext(supabase, tenantSlug);
    if (role !== "owner" && role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const p = createRoomSchema.parse(body);
    const status = ROOM_OPERATIONAL_STATUSES.includes(
      p.operationalStatus as (typeof ROOM_OPERATIONAL_STATUSES)[number],
    )
      ? (p.operationalStatus as (typeof ROOM_OPERATIONAL_STATUSES)[number])
      : ("active" as const);
    const cmd: CreateRoomCommand = {
      tenantId: tenant.id,
      roomCategoryId: p.roomCategoryId,
      code: p.code,
      operationalStatus: status,
    };
    if (p.name !== undefined) cmd.name = p.name;
    if (p.floor !== undefined) cmd.floor = p.floor;
    if (p.description !== undefined) cmd.description = p.description;
    return created(await svc.createRoom(supabase, cmd));
  } catch (err) {
    return handleError(err);
  }
}
