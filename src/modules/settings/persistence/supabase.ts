import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { TenantOperationalSettings, UpdateTenantSettingsCommand } from "../domain/types";
import { TenantSettingsNotFoundError } from "../domain/types";

type DB = Database;
type SettingsRow = DB["public"]["Tables"]["tenant_operational_settings"]["Row"];

function mapSettings(row: SettingsRow): TenantOperationalSettings {
  return {
    tenantId: row.tenant_id,
    timezone: row.timezone,
    currencyCode: row.currency_code,
    locale: row.locale,
    checkInTime: row.check_in_time,
    checkOutTime: row.check_out_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getTenantSettings(
  client: SupabaseClient<DB>,
  tenantId: string,
): Promise<TenantOperationalSettings> {
  const { data, error } = await client
    .from("tenant_operational_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();
  if (error || !data) throw new TenantSettingsNotFoundError(tenantId);
  return mapSettings(data);
}

export async function upsertTenantSettings(
  client: SupabaseClient<DB>,
  tenantId: string,
  cmd: UpdateTenantSettingsCommand,
): Promise<TenantOperationalSettings> {
  type Insert = DB["public"]["Tables"]["tenant_operational_settings"]["Insert"];
  const payload: Insert = { tenant_id: tenantId };
  if (cmd.timezone !== undefined) payload.timezone = cmd.timezone;
  if (cmd.currencyCode !== undefined) payload.currency_code = cmd.currencyCode;
  if (cmd.locale !== undefined) payload.locale = cmd.locale;
  if (cmd.checkInTime !== undefined) payload.check_in_time = cmd.checkInTime;
  if (cmd.checkOutTime !== undefined) payload.check_out_time = cmd.checkOutTime;

  const { data, error } = await client
    .from("tenant_operational_settings")
    .upsert(payload, { onConflict: "tenant_id" })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Upsert settings failed");
  return mapSettings(data);
}
