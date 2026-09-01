/**
 * tests/config/env-supabase.test.ts
 * Vérifie que les nouvelles variables Supabase passent la validation Zod.
 */

import { describe, it, expect } from "vitest";
import { publicEnvSchema } from "@/lib/config/env.schema";

describe("publicEnvSchema — variables Supabase", () => {
  it("accepte une URL Supabase valide", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-anon-key",
    });
    expect(result.success).toBe(true);
  });

  it("utilise la valeur par défaut si URL absente", () => {
    const result = publicEnvSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:54321");
    }
  });

  it("refuse une URL malformée", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "pas-une-url",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-key",
    });
    expect(result.success).toBe(false);
  });
});
