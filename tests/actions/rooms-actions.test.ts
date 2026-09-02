/**
 * tests/actions/rooms-actions.test.ts
 * Tests unitaires — Server Actions Chambres (UI-1).
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

const createRoomMock = vi.fn();
const updateRoomMock = vi.fn();
const setRoomStatusMock = vi.fn();
vi.mock("@/modules/rooms/services/room.service", () => ({
  createRoom: (...args: unknown[]) => createRoomMock(...args),
  updateRoom: (...args: unknown[]) => updateRoomMock(...args),
  setRoomStatus: (...args: unknown[]) => setRoomStatusMock(...args),
}));

import {
  createRoomAction,
  updateRoomAction,
  setRoomStatusAction,
} from "@/app/t/[tenantSlug]/rooms/actions";
import { initialActionResult } from "@/app/t/[tenantSlug]/action-result";
import { RoomCodeConflictError } from "@/modules/rooms/domain/types";

const TENANT = {
  id: "tenant-1",
  slug: "veraluz-001",
  name: "Test",
  created_at: "",
  updated_at: "",
};
const CATEGORY_ID = "11111111-1111-4111-8111-111111111111";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe("createRoomAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "owner", userId: "u1" });
  });

  it("refuse pour un rôle viewer", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "viewer", userId: "u1" });
    const result = await createRoomAction(
      "veraluz-001",
      initialActionResult,
      formData({ code: "101", roomCategoryId: CATEGORY_ID }),
    );
    expect(result.status).toBe("error");
    expect(createRoomMock).not.toHaveBeenCalled();
  });

  it("retourne une erreur de champ si roomCategoryId n'est pas un UUID", async () => {
    const result = await createRoomAction(
      "veraluz-001",
      initialActionResult,
      formData({ code: "101", roomCategoryId: "not-a-uuid" }),
    );
    expect(result.status).toBe("error");
    expect(result.fieldErrors?.["roomCategoryId"]).toBeDefined();
  });

  it("traduit un conflit de code chambre", async () => {
    createRoomMock.mockRejectedValue(new RoomCodeConflictError("101"));
    const result = await createRoomAction(
      "veraluz-001",
      initialActionResult,
      formData({ code: "101", roomCategoryId: CATEGORY_ID }),
    );
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/déjà utilisé/i);
  });

  it("crée la chambre pour un rôle admin", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "admin", userId: "u1" });
    createRoomMock.mockResolvedValue({ id: "room-1" });
    const result = await createRoomAction(
      "veraluz-001",
      initialActionResult,
      formData({ code: "101", roomCategoryId: CATEGORY_ID }),
    );
    expect(result.status).toBe("success");
    expect(createRoomMock).toHaveBeenCalledTimes(1);
  });
});

describe("updateRoomAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "owner", userId: "u1" });
  });

  it("met à jour la chambre pour un rôle autorisé", async () => {
    updateRoomMock.mockResolvedValue({ id: "room-1" });
    const result = await updateRoomAction(
      "veraluz-001",
      "room-1",
      initialActionResult,
      formData({ roomCategoryId: CATEGORY_ID, name: "Chambre vue mer" }),
    );
    expect(result.status).toBe("success");
    expect(updateRoomMock).toHaveBeenCalledWith(
      { mocked: "supabase-client" },
      "tenant-1",
      "room-1",
      expect.objectContaining({ name: "Chambre vue mer" }),
    );
  });
});

describe("setRoomStatusAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuse pour un rôle staff", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "staff", userId: "u1" });
    const result = await setRoomStatusAction("veraluz-001", "room-1", "out_of_service");
    expect(result.status).toBe("error");
    expect(setRoomStatusMock).not.toHaveBeenCalled();
  });

  it("applique le nouveau statut pour un rôle owner", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "owner", userId: "u1" });
    setRoomStatusMock.mockResolvedValue({ id: "room-1", operationalStatus: "out_of_service" });
    const result = await setRoomStatusAction("veraluz-001", "room-1", "out_of_service");
    expect(result.status).toBe("success");
    expect(setRoomStatusMock).toHaveBeenCalledWith(
      { mocked: "supabase-client" },
      "tenant-1",
      "room-1",
      { operationalStatus: "out_of_service" },
    );
  });
});
