/**
 * tests/shell/navigation.test.ts
 * Tests unitaires — configuration de navigation du shell (SSOT).
 */

import { describe, it, expect } from "vitest";
import { mainNavItems, futureModules, findFutureModule } from "@/components/shell/navigation";

describe("mainNavItems", () => {
  it("expose les 4 routes fonctionnelles UI-1", () => {
    const segments = mainNavItems.map((item) => item.segment);
    expect(segments).toEqual(["dashboard", "rooms", "room-categories", "settings"]);
  });

  it("n'a pas de doublon d'identifiant", () => {
    const ids = mainNavItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("futureModules", () => {
  it("couvre les 16 domaines annoncés comme « à venir »", () => {
    expect(futureModules).toHaveLength(16);
  });

  it("n'a pas de doublon de slug", () => {
    const slugs = futureModules.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("chaque module a une description non vide et un lot associé", () => {
    for (const entry of futureModules) {
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.lot.length).toBeGreaterThan(0);
    }
  });
});

describe("findFutureModule", () => {
  it("retrouve un module par son slug", () => {
    const result = findFutureModule("reservations");
    expect(result?.label).toBe("Réservations");
  });

  it("retourne undefined pour un slug inconnu", () => {
    expect(findFutureModule("does-not-exist")).toBeUndefined();
  });
});
