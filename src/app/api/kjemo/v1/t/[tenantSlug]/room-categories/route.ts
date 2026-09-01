import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/modules/tenant/resolver";
import * as svc from "@/modules/rooms/services/room-category.service";
import { createRoomCategorySchema } from "@/modules/rooms/domain/validators";
import type { CreateRoomCategoryCommand } from "@/modules/rooms/domain/types";
import { ok, created, handleError } from "@/lib/api/response";

interface Ctx {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug } = await params;
    const supabase = await createClient();
    const { tenant } = await resolveTenantContext(supabase, tenantSlug);
    const url = new URL(_req.url);
    const activeOnly = url.searchParams.get("active") === "true";
    return ok(await svc.listRoomCategories(supabase, { tenantId: tenant.id, activeOnly }));
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
    const p = createRoomCategorySchema.parse(body);
    const cmd: CreateRoomCategoryCommand = {
      tenantId: tenant.id,
      code: p.code,
      name: p.name,
      baseOccupancy: p.baseOccupancy,
      maxAdults: p.maxAdults,
      maxChildren: p.maxChildren,
      maxOccupancy: p.maxOccupancy,
      ...(p.description !== undefined ? { description: p.description } : {}),
    };
    return created(await svc.createRoomCategory(supabase, cmd));
  } catch (err) {
    return handleError(err);
  }
}
