/**
 * tests/modules/rooms/validators.test.ts
 * Tests des validateurs Zod CORE-1 — Catégories et Chambres.
 */

import { describe, it, expect } from "vitest";
import {
  roomCategoryCodeSchema,
  roomCodeSchema,
  createRoomCategorySchema,
  updateRoomCategorySchema,
  createRoomSchema,
  updateRoomSchema,
  setRoomStatusSchema,
  setRoomCategoryActiveSchema,
} from "@/modules/rooms/domain/validators";

// ─────────────────────────────────────────────────────────────────────────────
// Code catégorie
// ─────────────────────────────────────────────────────────────────────────────

describe("roomCategoryCodeSchema", () => {
  it("normalise en UPPERCASE", () => {
    expect(roomCategoryCodeSchema.parse("std")).toBe("STD");
  });
  it("trim les espaces", () => {
    expect(roomCategoryCodeSchema.parse("  STD  ")).toBe("STD");
  });
  it("accepte alphanumérique + tirets", () => {
    expect(roomCategoryCodeSchema.parse("DLX-SUP")).toBe("DLX-SUP");
  });
  it("rejette une chaîne vide", () => {
    expect(() => roomCategoryCodeSchema.parse("")).toThrow();
  });
  it("rejette si > 32 chars", () => {
    expect(() => roomCategoryCodeSchema.parse("A".repeat(33))).toThrow();
  });
  it("rejette les caractères spéciaux", () => {
    expect(() => roomCategoryCodeSchema.parse("STD@1")).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Code chambre
// ─────────────────────────────────────────────────────────────────────────────

describe("roomCodeSchema", () => {
  it("accepte un numéro de chambre classique", () => {
    expect(roomCodeSchema.parse("101")).toBe("101");
  });
  it("accepte alphanumérique mixte", () => {
    expect(roomCodeSchema.parse("A-101")).toBe("A-101");
  });
  it("rejette une chaîne vide", () => {
    expect(() => roomCodeSchema.parse("")).toThrow();
  });
  it("rejette si > 32 chars", () => {
    expect(() => roomCodeSchema.parse("1".repeat(33))).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createRoomCategorySchema
// ─────────────────────────────────────────────────────────────────────────────

const validCategory = {
  code: "STD",
  name: "Standard",
  baseOccupancy: 1,
  maxAdults: 2,
  maxChildren: 1,
  maxOccupancy: 2,
};

describe("createRoomCategorySchema", () => {
  it("valide un payload correct", () => {
    const result = createRoomCategorySchema.parse(validCategory);
    expect(result.code).toBe("STD");
  });

  it("rejette si maxOccupancy < baseOccupancy", () => {
    expect(() =>
      createRoomCategorySchema.parse({ ...validCategory, baseOccupancy: 5, maxOccupancy: 3 }),
    ).toThrow();
  });

  it("rejette si maxAdults > maxOccupancy", () => {
    expect(() =>
      createRoomCategorySchema.parse({ ...validCategory, maxAdults: 5, maxOccupancy: 2 }),
    ).toThrow();
  });

  it("accepte description optionnelle", () => {
    const result = createRoomCategorySchema.parse({
      ...validCategory,
      description: "Chambre standard",
    });
    expect(result.description).toBe("Chambre standard");
  });

  it("rejette un code vide", () => {
    expect(() => createRoomCategorySchema.parse({ ...validCategory, code: "" })).toThrow();
  });

  it("rejette un nom vide", () => {
    expect(() => createRoomCategorySchema.parse({ ...validCategory, name: "" })).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// updateRoomCategorySchema — strict (rejette les champs inconnus)
// ─────────────────────────────────────────────────────────────────────────────

describe("updateRoomCategorySchema", () => {
  it("valide un patch partiel", () => {
    const result = updateRoomCategorySchema.parse({ name: "Deluxe" });
    expect(result.name).toBe("Deluxe");
  });

  it("rejette tenant_id (champ non autorisé)", () => {
    expect(() => updateRoomCategorySchema.parse({ name: "X", tenantId: "hack" })).toThrow();
  });

  it("rejette code (non modifiable par cette commande)", () => {
    expect(() => updateRoomCategorySchema.parse({ code: "NEW" })).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setRoomCategoryActiveSchema
// ─────────────────────────────────────────────────────────────────────────────

describe("setRoomCategoryActiveSchema", () => {
  it("accepte isActive: false", () => {
    expect(setRoomCategoryActiveSchema.parse({ isActive: false }).isActive).toBe(false);
  });
  it("rejette une chaîne", () => {
    expect(() => setRoomCategoryActiveSchema.parse({ isActive: "yes" })).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createRoomSchema
// ─────────────────────────────────────────────────────────────────────────────

const VALID_UUID = "00000000-0000-0000-0000-000000000001";

describe("createRoomSchema", () => {
  it("valide un payload minimal", () => {
    const result = createRoomSchema.parse({ roomCategoryId: VALID_UUID, code: "101" });
    expect(result.operationalStatus).toBe("active");
  });

  it("rejette un UUID invalide pour roomCategoryId", () => {
    expect(() => createRoomSchema.parse({ roomCategoryId: "not-uuid", code: "101" })).toThrow();
  });

  it("accepte les statuts valides", () => {
    const r = createRoomSchema.parse({
      roomCategoryId: VALID_UUID,
      code: "102",
      operationalStatus: "inactive",
    });
    expect(r.operationalStatus).toBe("inactive");
  });

  it("rejette un statut invalide", () => {
    expect(() =>
      createRoomSchema.parse({
        roomCategoryId: VALID_UUID,
        code: "103",
        operationalStatus: "cleaning",
      }),
    ).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// updateRoomSchema — strict
// ─────────────────────────────────────────────────────────────────────────────

describe("updateRoomSchema", () => {
  it("valide un patch partiel", () => {
    const r = updateRoomSchema.parse({ name: "Suite 1", floor: "3" });
    expect(r.name).toBe("Suite 1");
  });

  it("rejette tenant_id (field inconnu)", () => {
    expect(() => updateRoomSchema.parse({ tenantId: "hack" })).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setRoomStatusSchema
// ─────────────────────────────────────────────────────────────────────────────

describe("setRoomStatusSchema", () => {
  it("accepte out_of_service", () => {
    const r = setRoomStatusSchema.parse({ operationalStatus: "out_of_service" });
    expect(r.operationalStatus).toBe("out_of_service");
  });
  it("rejette occupied (hors CORE-1)", () => {
    expect(() => setRoomStatusSchema.parse({ operationalStatus: "occupied" })).toThrow();
  });
});
