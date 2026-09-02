/**
 * src/modules/settings/services/tenant-settings.service.ts
 * Service domaine — Paramètres opérationnels tenant.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { TenantOperationalSettings, UpdateTenantSettingsCommand } from "../domain/types";
import * as repo from "../persistence/supabase";

type DB = Database;

export async function getTenantSettings(
  client: SupabaseClient<DB>,
  tenantId: string,
): Promise<TenantOperationalSettings> {
  return repo.getTenantSettings(client, tenantId);
}

export async function updateTenantSettings(
  client: SupabaseClient<DB>,
  tenantId: string,
  cmd: UpdateTenantSettingsCommand,
): Promise<TenantOperationalSettings> {
  return repo.upsertTenantSettings(client, tenantId, cmd);
}
