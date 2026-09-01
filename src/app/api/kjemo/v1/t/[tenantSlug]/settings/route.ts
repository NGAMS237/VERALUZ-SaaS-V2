import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/modules/tenant/resolver";
import * as svc from "@/modules/settings/services/tenant-settings.service";
import { updateTenantSettingsSchema } from "@/modules/settings/domain/validators";
import type { UpdateTenantSettingsCommand } from "@/modules/settings/domain/types";
import { ok, handleError } from "@/lib/api/response";

interface Ctx {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug } = await params;
    const supabase = await createClient();
    const { tenant } = await resolveTenantContext(supabase, tenantSlug);
    return ok(await svc.getTenantSettings(supabase, tenant.id));
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const { tenantSlug } = await params;
    const supabase = await createClient();
    const { tenant, role } = await resolveTenantContext(supabase, tenantSlug);
    if (role !== "owner" && role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const p = updateTenantSettingsSchema.parse(body);
    const cmd: UpdateTenantSettingsCommand = {};
    if (p.timezone !== undefined) cmd.timezone = p.timezone;
    if (p.currencyCode !== undefined) cmd.currencyCode = p.currencyCode;
    if (p.locale !== undefined) cmd.locale = p.locale;
    if (p.checkInTime !== undefined) cmd.checkInTime = p.checkInTime;
    if (p.checkOutTime !== undefined) cmd.checkOutTime = p.checkOutTime;
    return ok(await svc.updateTenantSettings(supabase, tenant.id, cmd));
  } catch (err) {
    return handleError(err);
  }
}
