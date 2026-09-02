/**
 * tests/actions/room-categories-actions.test.ts
 * Tests unitaires — Server Actions Catégories de chambres (UI-1).
 * Vérifie les permissions par rôle, la validation Zod et le mapping d'erreurs domaine.
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

const createRoomCategoryMock = vi.fn();
const updateRoomCategoryMock = vi.fn();
const setRoomCategoryActiveMock = vi.fn();
vi.mock("@/modules/rooms/services/room-category.service", () => ({
  createRoomCategory: (...args: unknown[]) => createRoomCategoryMock(...args),
  updateRoomCategory: (...args: unknown[]) => updateRoomCategoryMock(...args),
  setRoomCategoryActive: (...args: unknown[]) => setRoomCategoryActiveMock(...args),
}));

import {
  createRoomCategoryAction,
  updateRoomCategoryAction,
  setRoomCategoryActiveAction,
} from "@/app/t/[tenantSlug]/room-categories/actions";
import { initialActionResult } from "@/app/t/[tenantSlug]/action-result";
import {
  OccupancyCoherenceError,
  RoomCategoryCodeConflictError,
} from "@/modules/rooms/domain/types";

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

describe("createRoomCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "owner", userId: "u1" });
  });

  it("refuse la création pour un rôle staff", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "staff", userId: "u1" });
    const result = await createRoomCategoryAction(
      "veraluz-001",
      initialActionResult,
      formData({
        code: "STD",
        name: "Standard",
        baseOccupancy: "1",
        maxAdults: "2",
        maxChildren: "0",
        maxOccupancy: "2",
      }),
    );
    expect(result.status).toBe("error");
    expect(createRoomCategoryMock).not.toHaveBeenCalled();
  });

  it("refuse la création pour un rôle viewer", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "viewer", userId: "u1" });
    const result = await createRoomCategoryAction(
      "veraluz-001",
      initialActionResult,
      formData({
        code: "STD",
        name: "Standard",
        baseOccupancy: "1",
        maxAdults: "2",
        maxChildren: "0",
        maxOccupancy: "2",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("retourne des erreurs de champ pour un formulaire invalide", async () => {
    const result = await createRoomCategoryAction(
      "veraluz-001",
      initialActionResult,
      formData({
        code: "",
        name: "",
        baseOccupancy: "0",
        maxAdults: "0",
        maxChildren: "0",
        maxOccupancy: "0",
      }),
    );
    expect(result.status).toBe("error");
    expect(result.fieldErrors).toBeDefined();
    expect(createRoomCategoryMock).not.toHaveBeenCalled();
  });

  it("traduit une incohérence d'occupation renvoyée par le service en message français", async () => {
    // Données valides côté schéma Zod : l'incohérence est détectée par le service
    // (garde défensive en profondeur — le schéma la couvre déjà normalement).
    createRoomCategoryMock.mockRejectedValue(new OccupancyCoherenceError());
    const result = await createRoomCategoryAction(
      "veraluz-001",
      initialActionResult,
      formData({
        code: "STD",
        name: "Standard",
        baseOccupancy: "1",
        maxAdults: "2",
        maxChildren: "0",
        maxOccupancy: "2",
      }),
    );
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/capacité/i);
  });

  it("rejette côté Zod une incohérence d'occupation avant d'appeler le service", async () => {
    const result = await createRoomCategoryAction(
      "veraluz-001",
      initialActionResult,
      formData({
        code: "STD",
        name: "Standard",
        baseOccupancy: "4",
        maxAdults: "2",
        maxChildren: "0",
        maxOccupancy: "2",
      }),
    );
    expect(result.status).toBe("error");
    expect(result.fieldErrors).toBeDefined();
    expect(createRoomCategoryMock).not.toHaveBeenCalled();
  });

  it("traduit un conflit de code en message français", async () => {
    createRoomCategoryMock.mockRejectedValue(new RoomCategoryCodeConflictError("STD"));
    const result = await createRoomCategoryAction(
      "veraluz-001",
      initialActionResult,
      formData({
        code: "STD",
        name: "Standard",
        baseOccupancy: "1",
        maxAdults: "2",
        maxChildren: "0",
        maxOccupancy: "2",
      }),
    );
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/déjà utilisé/i);
  });

  it("crée la catégorie pour un rôle owner avec des données valides", async () => {
    createRoomCategoryMock.mockResolvedValue({ id: "cat-1" });
    const result = await createRoomCategoryAction(
      "veraluz-001",
      initialActionResult,
      formData({
        code: "std",
        name: "Standard",
        baseOccupancy: "1",
        maxAdults: "2",
        maxChildren: "0",
        maxOccupancy: "2",
      }),
    );
    expect(result.status).toBe("success");
    expect(createRoomCategoryMock).toHaveBeenCalledTimes(1);
    const cmd = createRoomCategoryMock.mock.calls[0]?.[1];
    expect(cmd.tenantId).toBe("tenant-1");
    expect(cmd.code).toBe("STD"); // normalisé en majuscules par le schéma
  });
});

describe("updateRoomCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "admin", userId: "u1" });
  });

  it("refuse la modification pour un rôle non autorisé", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "viewer", userId: "u1" });
    const result = await updateRoomCategoryAction(
      "veraluz-001",
      "cat-1",
      initialActionResult,
      formData({
        name: "Standard",
        baseOccupancy: "1",
        maxAdults: "2",
        maxChildren: "0",
        maxOccupancy: "2",
      }),
    );
    expect(result.status).toBe("error");
    expect(updateRoomCategoryMock).not.toHaveBeenCalled();
  });

  it("met à jour la catégorie pour un rôle admin", async () => {
    updateRoomCategoryMock.mockResolvedValue({ id: "cat-1" });
    const result = await updateRoomCategoryAction(
      "veraluz-001",
      "cat-1",
      initialActionResult,
      formData({
        name: "Standard+",
        baseOccupancy: "1",
        maxAdults: "2",
        maxChildren: "0",
        maxOccupancy: "3",
      }),
    );
    expect(result.status).toBe("success");
    expect(updateRoomCategoryMock).toHaveBeenCalledWith(
      { mocked: "supabase-client" },
      "tenant-1",
      "cat-1",
      expect.objectContaining({ name: "Standard+" }),
    );
  });
});

describe("setRoomCategoryActiveAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuse pour un rôle staff", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "staff", userId: "u1" });
    const result = await setRoomCategoryActiveAction("veraluz-001", "cat-1", false);
    expect(result.status).toBe("error");
    expect(setRoomCategoryActiveMock).not.toHaveBeenCalled();
  });

  it("active/désactive pour un rôle owner", async () => {
    getTenantContextMock.mockResolvedValue({ tenant: TENANT, role: "owner", userId: "u1" });
    setRoomCategoryActiveMock.mockResolvedValue({ id: "cat-1", isActive: false });
    const result = await setRoomCategoryActiveAction("veraluz-001", "cat-1", false);
    expect(result.status).toBe("success");
    expect(setRoomCategoryActiveMock).toHaveBeenCalledWith(
      { mocked: "supabase-client" },
      "tenant-1",
      "cat-1",
      { isActive: false },
    );
  });
});
