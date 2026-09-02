/**
 * tests/tenant/queries.test.ts
 * Tests unitaires — liste des tenants accessibles à l'utilisateur courant.
 */

import { describe, it, expect, vi } from "vitest";
import { listAccessibleTenants } from "@/modules/tenant/queries";

function makeMockSupabase(membershipsResult: unknown, tenantsResult: unknown) {
  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "memberships") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue(membershipsResult),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue(tenantsResult),
      };
    }),
  };
}

describe("listAccessibleTenants", () => {
  it("retourne une liste vide si aucun membership", async () => {
    const supabase = makeMockSupabase({ data: [], error: null }, { data: [], error: null });
    const result = await listAccessibleTenants(supabase as never, "user-1");
    expect(result).toEqual([]);
  });

  it("retourne une liste vide si la requête memberships échoue", async () => {
    const supabase = makeMockSupabase(
      { data: null, error: new Error("db error") },
      { data: [], error: null },
    );
    const result = await listAccessibleTenants(supabase as never, "user-1");
    expect(result).toEqual([]);
  });

  it("associe chaque tenant à son rôle et trie par nom", async () => {
    const supabase = makeMockSupabase(
      {
        data: [
          { tenant_id: "t2", role: "staff" },
          { tenant_id: "t1", role: "owner" },
        ],
        error: null,
      },
      {
        data: [
          { id: "t1", slug: "alpha", name: "Alpha Residence", created_at: "", updated_at: "" },
          { id: "t2", slug: "zeta", name: "Zeta Residence", created_at: "", updated_at: "" },
        ],
        error: null,
      },
    );

    const result = await listAccessibleTenants(supabase as never, "user-1");

    expect(result).toHaveLength(2);
    expect(result[0]?.tenant.slug).toBe("alpha");
    expect(result[0]?.role).toBe("owner");
    expect(result[1]?.tenant.slug).toBe("zeta");
    expect(result[1]?.role).toBe("staff");
  });

  it("ignore un tenant sans rôle correspondant", async () => {
    const supabase = makeMockSupabase(
      { data: [{ tenant_id: "t1", role: "owner" }], error: null },
      {
        data: [
          { id: "t1", slug: "alpha", name: "Alpha", created_at: "", updated_at: "" },
          { id: "t-orphan", slug: "orphan", name: "Orphan", created_at: "", updated_at: "" },
        ],
        error: null,
      },
    );

    const result = await listAccessibleTenants(supabase as never, "user-1");
    expect(result).toHaveLength(1);
    expect(result[0]?.tenant.slug).toBe("alpha");
  });
});
