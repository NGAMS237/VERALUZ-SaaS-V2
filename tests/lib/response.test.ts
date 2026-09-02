/**
 * tests/lib/response.test.ts
 */
import { describe, it, expect } from "vitest";
import { ok, created, handleError } from "@/lib/api/response";
import { ZodError } from "zod";
import {
  RoomNotFoundError,
  RoomCategoryNotFoundError,
  RoomCodeConflictError,
  RoomCategoryCodeConflictError,
  RoomDomainError,
} from "@/modules/rooms/domain/types";
import { TenantSettingsNotFoundError } from "@/modules/settings/domain/types";
import {
  TenantSlugError,
  TenantNotFoundError,
  TenantAccessDeniedError,
} from "@/modules/tenant/resolver";

describe("ok / created", () => {
  it("ok retourne 200 avec data", async () => {
    const res = ok({ id: 1 });
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual({ id: 1 });
  });
  it("created retourne 201", async () => {
    const res = created({ id: 2 });
    expect(res.status).toBe(201);
  });
});

describe("handleError", () => {
  it("TenantSlugError → 400", async () => {
    const res = handleError(new TenantSlugError("bad"));
    expect(res.status).toBe(400);
  });
  it("TenantAccessDeniedError → 403", async () => {
    const res = handleError(new TenantAccessDeniedError("denied"));
    expect(res.status).toBe(403);
  });
  it("TenantNotFoundError → 404", async () => {
    const res = handleError(new TenantNotFoundError("not found"));
    expect(res.status).toBe(404);
  });
  it("ZodError → 400", async () => {
    const ze = new ZodError([{ code: "custom", message: "bad", path: [] }]);
    const res = handleError(ze);
    expect(res.status).toBe(400);
  });
  it("RoomNotFoundError → 404", async () => {
    const res = handleError(new RoomNotFoundError("x"));
    expect(res.status).toBe(404);
  });
  it("RoomCategoryNotFoundError → 404", async () => {
    const res = handleError(new RoomCategoryNotFoundError("x"));
    expect(res.status).toBe(404);
  });
  it("TenantSettingsNotFoundError → 404", async () => {
    const res = handleError(new TenantSettingsNotFoundError("x"));
    expect(res.status).toBe(404);
  });
  it("RoomCodeConflictError → 409", async () => {
    const res = handleError(new RoomCodeConflictError("x"));
    expect(res.status).toBe(409);
  });
  it("RoomCategoryCodeConflictError → 409", async () => {
    const res = handleError(new RoomCategoryCodeConflictError("x"));
    expect(res.status).toBe(409);
  });
  it("RoomDomainError → 400", async () => {
    const res = handleError(new RoomDomainError("x", "ERR"));
    expect(res.status).toBe(400);
  });
  it("erreur inconnue → 500", async () => {
    const res = handleError(new Error("boom"));
    expect(res.status).toBe(500);
  });
});
