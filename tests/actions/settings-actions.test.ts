/**
 * tests/actions/settings-actions.test.ts
 * Tests unitaires — Server Action Paramètres opérationnels (UI-1).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ mocked: "supabase-client" }),
}));

const getTenantContextMock = vi.fn();
vi.mock("@/lib/tenant-context", () => ({
  getTenantContext: (...args: unknown[]) => getTenantContextMock(...args),
  canWrite: (role: string) => role === "owner" || role === "admin",
}));

const updateTenantSettingsMock = vi.fn();
vi.mock("@/modules/settings/services/tenant-settings.service", () => ({
  updateTenantSettings: (...args: unknown[]) => updateTenantSettingsMock(...args),
}));

import { updateSettingsAction } from "@/app/t/[tenantSlug]/settings/actions";
import { initialActionResult } from "@/app/t/[tenantSlug]/action-result";

const TENANT = {
  id: "tenant-1",
  slug: "veraluz-001",
  name: "Test",
  created_at: "",
  updated_at: "",
};

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

const VALID = {
  timezone: "Africa/Douala",
  currencyCode: "XAF",
  locale: "fr-CM",
  checkOutTime: "12:00",
};

describe("updateSettingsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "owner", userId: "u1" });
  });

  it("refuse pour un rôle viewer", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "viewer", userId: "u1" });
    const result = await updateSettingsAction("veraluz-001", initialActionResult, formData(VALID));
    expect(result.status).toBe("error");
    expect(updateTenantSettingsMock).not.toHaveBeenCalled();
  });

  it("refuse pour un rôle staff", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "staff", userId: "u1" });
    const result = await updateSettingsAction("veraluz-001", initialActionResult, formData(VALID));
    expect(result.status).toBe("error");
  });

  it("rejette une devise mal formée", async () => {
    const result = await updateSettingsAction(
      "veraluz-001",
      initialActionResult,
      formData({ ...VALID, currencyCode: "xaf" }),
    );
    expect(result.status).toBe("error");
    expect(result.fieldErrors?.["currencyCode"]).toBeDefined();
    expect(updateTenantSettingsMock).not.toHaveBeenCalled();
  });

  it("rejette une heure de check-out mal formée", async () => {
    const result = await updateSettingsAction(
      "veraluz-001",
      initialActionResult,
      formData({ ...VALID, checkOutTime: "midi" }),
    );
    expect(result.status).toBe("error");
    expect(result.fieldErrors?.["checkOutTime"]).toBeDefined();
  });

  it("met à jour les paramètres pour un rôle admin avec des données valides", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "admin", userId: "u1" });
    updateTenantSettingsMock.mockResolvedValue({ ...VALID, tenantId: "tenant-1" });
    const result = await updateSettingsAction("veraluz-001", initialActionResult, formData(VALID));
    expect(result.status).toBe("success");
    expect(updateTenantSettingsMock).toHaveBeenCalledWith(
      { mocked: "supabase-client" },
      "tenant-1",
      expect.objectContaining({ checkOutTime: "12:00" }),
    );
  });

  it("accepte une heure de check-in vide (non renseignée)", async () => {
    updateTenantSettingsMock.mockResolvedValue({ ...VALID, tenantId: "tenant-1" });
    const result = await updateSettingsAction(
      "veraluz-001",
      initialActionResult,
      formData({ ...VALID, checkInTime: "" }),
    );
    expect(result.status).toBe("success");
    const cmd = updateTenantSettingsMock.mock.calls[0]?.[2];
    expect(cmd.checkInTime).toBeNull();
  });
});
