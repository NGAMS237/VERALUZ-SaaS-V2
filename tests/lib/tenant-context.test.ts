/**
 * tests/lib/tenant-context.test.ts
 * Tests unitaires — mémoïsation du contexte tenant et vérification des droits d'écriture.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ mocked: "supabase-client" }),
}));

vi.mock("@/modules/tenant/resolver", async () => {
  const actual = await vi.importActual<typeof import("@/modules/tenant/resolver")>(
    "@/modules/tenant/resolver",
  );
  return {
    ...actual,
    resolveTenantContext: vi.fn(),
  };
});

import { getTenantContext, canWrite } from "@/lib/tenant-context";
import { resolveTenantContext } from "@/modules/tenant/resolver";

describe("canWrite", () => {
  it("autorise owner", () => {
    expect(canWrite("owner")).toBe(true);
  });

  it("autorise admin", () => {
    expect(canWrite("admin")).toBe(true);
  });

  it("refuse staff", () => {
    expect(canWrite("staff")).toBe(false);
  });

  it("refuse viewer", () => {
    expect(canWrite("viewer")).toBe(false);
  });
});

describe("getTenantContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("délègue à resolveTenantContext avec le client Supabase serveur", async () => {
    const expected = {
      tenant: {
        id: "t1",
        slug: "veraluz-context-test",
        name: "Test",
        created_at: "",
        updated_at: "",
      },
      role: "owner" as const,
      userId: "u1",
    };
    (resolveTenantContext as ReturnType<typeof vi.fn>).mockResolvedValue(expected);

    const result = await getTenantContext("veraluz-context-test");

    expect(result).toEqual(expected);
    expect(resolveTenantContext).toHaveBeenCalledWith(
      { mocked: "supabase-client" },
      "veraluz-context-test",
    );
  });

  it("propage l'erreur du résolveur", async () => {
    (resolveTenantContext as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));
    await expect(getTenantContext("veraluz-context-error")).rejects.toThrow("boom");
  });
});
