/**
 * tests/tenant/resolver.test.ts
 * Tests unitaires du résolveur de tenant (F1).
 * Les appels Supabase sont mockés — les tests RLS réels sont dans supabase/tests/.
 */

import { describe, it, expect, vi } from "vitest";
import {
  validateTenantSlug,
  resolveTenantContext,
  TenantSlugError,
  TenantNotFoundError,
  TenantAccessDeniedError,
} from "@/modules/tenant/resolver";

// ─── validateTenantSlug ───────────────────────────────────────────────────────

describe("validateTenantSlug", () => {
  it("accepte un slug valide", () => {
    expect(validateTenantSlug("veraluz-001")).toBe(true);
  });

  it("accepte un slug alphanumérique simple", () => {
    expect(validateTenantSlug("monhotel")).toBe(true);
  });

  it("accepte un slug avec tirets internes", () => {
    expect(validateTenantSlug("la-residence-veraluz")).toBe(true);
  });

  it("refuse les majuscules", () => {
    expect(validateTenantSlug("VERALUZ")).toBe(false);
  });

  it("refuse un slug vide", () => {
    expect(validateTenantSlug("")).toBe(false);
  });

  it("refuse un slug commençant par un tiret", () => {
    expect(validateTenantSlug("-veraluz")).toBe(false);
  });

  it("refuse un slug se terminant par un tiret", () => {
    expect(validateTenantSlug("veraluz-")).toBe(false);
  });

  it("refuse les espaces", () => {
    expect(validateTenantSlug("veraluz 001")).toBe(false);
  });

  it("refuse les underscores", () => {
    expect(validateTenantSlug("veraluz_001")).toBe(false);
  });
});

// ─── resolveTenantContext ─────────────────────────────────────────────────────

function makeMockSupabase(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      getClaims: vi.fn().mockResolvedValue({
        data: { claims: { sub: "user-uuid-123" } },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "tenant-uuid-001",
          slug: "veraluz-001",
          name: "La Résidence VERALUZ",
          created_at: "2026-09-01T00:00:00Z",
          updated_at: "2026-09-01T00:00:00Z",
        },
        error: null,
      }),
    }),
    ...overrides,
  };
}

describe("resolveTenantContext", () => {
  it("lance TenantSlugError pour un slug invalide", async () => {
    const supabase = makeMockSupabase();
    await expect(resolveTenantContext(supabase as never, "INVALID_SLUG")).rejects.toThrow(
      TenantSlugError,
    );
  });

  it("lance TenantAccessDeniedError si getClaims échoue", async () => {
    const supabase = makeMockSupabase();
    (supabase.auth.getClaims as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: new Error("JWT invalide"),
    });
    await expect(resolveTenantContext(supabase as never, "veraluz-001")).rejects.toThrow(
      TenantAccessDeniedError,
    );
  });

  it("lance TenantNotFoundError si le tenant n'existe pas", async () => {
    const supabase = makeMockSupabase();
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error("not found") }),
    });
    (supabase as Record<string, unknown>).from = fromMock;
    await expect(resolveTenantContext(supabase as never, "veraluz-001")).rejects.toThrow(
      TenantNotFoundError,
    );
  });

  it("lance TenantAccessDeniedError si le membership est absent", async () => {
    const supabase = makeMockSupabase();
    let callCount = 0;
    const fromMock = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // tenant trouvé
          return Promise.resolve({
            data: { id: "tenant-uuid-001", slug: "veraluz-001", name: "Test" },
            error: null,
          });
        }
        // membership absent
        return Promise.resolve({ data: null, error: new Error("no membership") });
      }),
    }));
    (supabase as Record<string, unknown>).from = fromMock;
    await expect(resolveTenantContext(supabase as never, "veraluz-001")).rejects.toThrow(
      TenantAccessDeniedError,
    );
  });

  it("retourne le contexte tenant complet si tout est valide", async () => {
    const supabase = makeMockSupabase();
    let callCount = 0;
    const fromMock = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            data: {
              id: "tenant-uuid-001",
              slug: "veraluz-001",
              name: "La Résidence VERALUZ",
              created_at: "2026-09-01T00:00:00Z",
              updated_at: "2026-09-01T00:00:00Z",
            },
            error: null,
          });
        }
        return Promise.resolve({ data: { role: "owner" }, error: null });
      }),
    }));
    (supabase as Record<string, unknown>).from = fromMock;

    const result = await resolveTenantContext(supabase as never, "veraluz-001");
    expect(result.tenant.slug).toBe("veraluz-001");
    expect(result.role).toBe("owner");
    expect(result.userId).toBe("user-uuid-123");
  });
});
