/**
 * tests/modules/rooms/domain.test.ts
 * Tests des types et erreurs domaine CORE-1 — Chambres.
 */

import { describe, it, expect } from "vitest";
import {
  RoomNotFoundError,
  RoomCategoryNotFoundError,
  RoomCodeConflictError,
  RoomCategoryCodeConflictError,
  CrossTenantError,
  OccupancyCoherenceError,
  ROOM_OPERATIONAL_STATUSES,
} from "@/modules/rooms/domain/types";

describe("ROOM_OPERATIONAL_STATUSES", () => {
  it("contient exactement les statuts CORE-1", () => {
    expect(ROOM_OPERATIONAL_STATUSES).toEqual(["active", "inactive", "out_of_service"]);
  });

  it("ne contient pas occupied (séjour)", () => {
    expect(ROOM_OPERATIONAL_STATUSES).not.toContain("occupied");
  });

  it("ne contient pas dirty (housekeeping)", () => {
    expect(ROOM_OPERATIONAL_STATUSES).not.toContain("dirty");
  });
});

describe("Erreurs domaine", () => {
  it("RoomNotFoundError a le bon code", () => {
    const err = new RoomNotFoundError("id-1");
    expect(err.code).toBe("ROOM_NOT_FOUND");
    expect(err.name).toBe("RoomDomainError");
  });

  it("RoomCategoryNotFoundError a le bon code", () => {
    const err = new RoomCategoryNotFoundError("id-2");
    expect(err.code).toBe("ROOM_CATEGORY_NOT_FOUND");
  });

  it("RoomCodeConflictError a le bon code", () => {
    const err = new RoomCodeConflictError("101");
    expect(err.code).toBe("ROOM_CODE_CONFLICT");
    expect(err.message).toContain("101");
  });

  it("RoomCategoryCodeConflictError a le bon code", () => {
    const err = new RoomCategoryCodeConflictError("STD");
    expect(err.code).toBe("ROOM_CATEGORY_CODE_CONFLICT");
  });

  it("CrossTenantError a le bon code", () => {
    const err = new CrossTenantError();
    expect(err.code).toBe("CROSS_TENANT_FORBIDDEN");
  });

  it("OccupancyCoherenceError a le bon code", () => {
    const err = new OccupancyCoherenceError();
    expect(err.code).toBe("OCCUPANCY_INCOHERENT");
  });
});
