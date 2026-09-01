/**
 * PATCH /api/kjemo/v1/t/[tenantSlug]/room-categories/[categoryId]/active
 * Active ou désactive une catégorie.
 */

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/modules/tenant/resolver";
import * as svc from "@/modules/rooms/services/room-category.service";
import { setRoomCategoryActiveSchema } from "@/modules/rooms/domain/validators";
import { ok, handleError } from "@/lib/api/response";

interface Ctx {
  params: Promise<{ tenantSlug: string; categoryId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug, categoryId } = await params;
    const supabase = await createClient();
    const { tenant, role } = await resolveTenantContext(supabase, tenantSlug);

    if (role !== "owner" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = setRoomCategoryActiveSchema.parse(body);
    const category = await svc.setRoomCategoryActive(supabase, tenant.id, categoryId, parsed);
    return ok(category);
  } catch (err) {
    return handleError(err);
  }
}
