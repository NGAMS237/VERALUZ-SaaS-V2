/**
 * tests/supabase/client.test.ts
 * Tests unitaires du client Supabase navigateur.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn().mockReturnValue({ from: vi.fn() }),
  createServerClient: vi.fn().mockReturnValue({ from: vi.fn(), auth: { getClaims: vi.fn() } }),
}));

describe("createClient (browser)", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env["NEXT_PUBLIC_SUPABASE_URL"] = "http://127.0.0.1:54321";
    process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] = "test-anon-key";
  });

  it("crée un client quand les variables sont définies", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const client = createClient();
    expect(client).toBeDefined();
  });

  it("lance une erreur si NEXT_PUBLIC_SUPABASE_URL est absent", async () => {
    delete process.env["NEXT_PUBLIC_SUPABASE_URL"];
    const { createClient } = await import("@/lib/supabase/client");
    expect(() => createClient()).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("lance une erreur si NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY est absent", async () => {
    delete process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
    const { createClient } = await import("@/lib/supabase/client");
    expect(() => createClient()).toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });
});

describe("createClient (server)", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env["NEXT_PUBLIC_SUPABASE_URL"] = "http://127.0.0.1:54321";
    process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] = "test-anon-key";
  });

  it("lance une erreur si URL absente côté serveur", async () => {
    delete process.env["NEXT_PUBLIC_SUPABASE_URL"];
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue({
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
      }),
    }));
    const { createClient } = await import("@/lib/supabase/server");
    await expect(createClient()).rejects.toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("lance une erreur si clé absente côté serveur", async () => {
    delete process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue({
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
      }),
    }));
    const { createClient } = await import("@/lib/supabase/server");
    await expect(createClient()).rejects.toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });

  it("crée un client serveur quand les variables sont définies", async () => {
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue({
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
      }),
    }));
    const { createClient } = await import("@/lib/supabase/server");
    const client = await createClient();
    expect(client).toBeDefined();
  });
});
