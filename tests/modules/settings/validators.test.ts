/**
 * tests/modules/settings/validators.test.ts
 * Tests des validateurs Zod CORE-1 — Paramètres opérationnels tenant.
 */

import { describe, it, expect } from "vitest";
import { updateTenantSettingsSchema } from "@/modules/settings/domain/validators";

describe("updateTenantSettingsSchema", () => {
  it("valide un payload partiel minimal", () => {
    const r = updateTenantSettingsSchema.parse({ timezone: "Africa/Douala" });
    expect(r.timezone).toBe("Africa/Douala");
  });

  it("valide check_out_time au format HH:MM", () => {
    const r = updateTenantSettingsSchema.parse({ checkOutTime: "12:00" });
    expect(r.checkOutTime).toBe("12:00");
  });

  it("valide check_in_time au format HH:MM", () => {
    const r = updateTenantSettingsSchema.parse({ checkInTime: "15:00" });
    expect(r.checkInTime).toBe("15:00");
  });

  it("accepte check_in_time null", () => {
    const r = updateTenantSettingsSchema.parse({ checkInTime: null });
    expect(r.checkInTime).toBeNull();
  });

  it("rejette un format d'heure invalide", () => {
    expect(() => updateTenantSettingsSchema.parse({ checkOutTime: "25:00" })).toThrow();
  });

  it("rejette un code devise invalide", () => {
    expect(() => updateTenantSettingsSchema.parse({ currencyCode: "xaf" })).toThrow();
  });

  it("valide un code devise XAF", () => {
    const r = updateTenantSettingsSchema.parse({ currencyCode: "XAF" });
    expect(r.currencyCode).toBe("XAF");
  });

  it("valide une locale fr-CM", () => {
    const r = updateTenantSettingsSchema.parse({ locale: "fr-CM" });
    expect(r.locale).toBe("fr-CM");
  });

  it("rejette une locale malformée", () => {
    expect(() => updateTenantSettingsSchema.parse({ locale: "FR_cm" })).toThrow();
  });

  it("rejette les champs inconnus (strict)", () => {
    expect(() => updateTenantSettingsSchema.parse({ tenantId: "hack" })).toThrow();
  });

  it("accepte un payload vide (aucune mise à jour)", () => {
    const r = updateTenantSettingsSchema.parse({});
    expect(Object.keys(r)).toHaveLength(0);
  });
});
