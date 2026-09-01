/**
 * src/modules/settings/domain/types.ts
 * Types de domaine CORE-1 — Paramètres opérationnels tenant.
 */

export interface TenantOperationalSettings {
  tenantId: string;
  timezone: string;
  currencyCode: string;
  locale: string;
  checkInTime: string | null;
  checkOutTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantSettingsCommand {
  timezone?: string;
  currencyCode?: string;
  locale?: string;
  checkInTime?: string | null;
  checkOutTime?: string;
}

export class TenantSettingsNotFoundError extends Error {
  constructor(tenantId: string) {
    super(`Operational settings not found for tenant: ${tenantId}`);
    this.name = "TenantSettingsNotFoundError";
  }
}
