/**
 * src/app/t/[tenantSlug]/settings/page.tsx
 * Paramètres opérationnels — fuseau horaire, devise, locale, check-in/check-out.
 *
 * Dans Next.js 16, params est asynchrone.
 */

import { createClient } from "@/lib/supabase/server";
import { getTenantContext, canWrite } from "@/lib/tenant-context";
import { getTenantSettings } from "@/modules/settings/services/tenant-settings.service";
import { TenantSettingsNotFoundError } from "@/modules/settings/domain/types";
import type { TenantOperationalSettings } from "@/modules/settings/domain/types";
import { SettingsView } from "./settings-view";

interface SettingsPageProps {
  params: Promise<{ tenantSlug: string }>;
}

const DEFAULT_SETTINGS_TEMPLATE = {
  timezone: "Africa/Douala",
  currencyCode: "XAF",
  locale: "fr-CM",
  checkInTime: null,
  checkOutTime: "12:00",
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { tenantSlug } = await params;
  const { tenant, role } = await getTenantContext(tenantSlug);
  const supabase = await createClient();

  let settings: TenantOperationalSettings;
  try {
    settings = await getTenantSettings(supabase, tenant.id);
  } catch (err) {
    if (err instanceof TenantSettingsNotFoundError) {
      settings = {
        tenantId: tenant.id,
        ...DEFAULT_SETTINGS_TEMPLATE,
        createdAt: "",
        updatedAt: "",
      };
    } else {
      throw err;
    }
  }

  return <SettingsView tenantSlug={tenantSlug} settings={settings} canWrite={canWrite(role)} />;
}
