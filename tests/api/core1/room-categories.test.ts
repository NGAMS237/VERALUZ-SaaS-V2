/**
 * tests/api/core1/room-categories.test.ts
 * Tests route handlers CORE-1 — room-categories
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCategory = {
  id: "cat-1",
  tenantId: "tenant-1",
  code: "STD",
  name: "Standard",
  description: null,
  baseOccupancy: 1,
  maxAdults: 2,
  maxChildren: 0,
  maxOccupancy: 2,
  isActive: true,
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z",
};

const mockTenantCtx = {
  tenant: { id: "tenant-1", slug: "veraluz-001", name: "Test", created_at: "", updated_at: "" },
  role: "owner" as const,
  userId: "user-1",
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/modules/tenant/resolver", () => ({
  resolveTenantContext: vi.fn().mockResolvedValue(mockTenantCtx),
  TenantSlugError: class extends Error {},
  TenantNotFoundError: class extends Error {},
  TenantAccessDeniedError: class extends Error {},
}));

vi.mock("@/modules/rooms/services/room-category.service", () => ({
  listRoomCategories: vi.fn().mockResolvedValue([mockCategory]),
  getRoomCategoryById: vi.fn().mockResolvedValue(mockCategory),
  createRoomCategory: vi.fn().mockResolvedValue(mockCategory),
  updateRoomCategory: vi.fn().mockResolvedValue(mockCategory),
  setRoomCategoryActive: vi.fn().mockResolvedValue({ ...mockCategory, isActive: false }),
}));

function makeRequest(method: string, body?: unknown, search = ""): Request {
  return new Request(`http://localhost/api/kjemo/v1/t/veraluz-001/room-categories${search}`, {
    method,
    ...(body !== undefined
      ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      : {}),
  });
}

const params = Promise.resolve({ tenantSlug: "veraluz-001" });

describe("GET /room-categories", () => {
  it("retourne la liste", async () => {
    const { GET } = await import("@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/route");
    const res = await GET(makeRequest("GET") as never, { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
  });
});

describe("POST /room-categories", () => {
  it("crée une catégorie", async () => {
    const { POST } = await import("@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/route");
    const body = {
      code: "STD",
      name: "Standard",
      baseOccupancy: 1,
      maxAdults: 2,
      maxChildren: 0,
      maxOccupancy: 2,
    };
    const res = await POST(makeRequest("POST", body) as never, { params });
    expect(res.status).toBe(201);
  });

  it("retourne 403 pour un staff", async () => {
    const { resolveTenantContext } = await import("@/modules/tenant/resolver");
    vi.mocked(resolveTenantContext).mockResolvedValueOnce({ ...mockTenantCtx, role: "staff" });
    const { POST } = await import("@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/route");
    const body = {
      code: "X",
      name: "X",
      baseOccupancy: 1,
      maxAdults: 1,
      maxChildren: 0,
      maxOccupancy: 1,
    };
    const res = await POST(makeRequest("POST", body) as never, { params });
    expect(res.status).toBe(403);
  });
});

describe("GET /room-categories — erreur service", () => {
  it("retourne 500 si service throw", async () => {
    const { listRoomCategories } = await import("@/modules/rooms/services/room-category.service");
    vi.mocked(listRoomCategories).mockRejectedValueOnce(new Error("fail"));
    const { GET } = await import("@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/route");
    const res = await GET(makeRequest("GET", undefined, "?active=true") as never, { params });
    expect(res.status).toBe(500);
  });
});
