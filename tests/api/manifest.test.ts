import { describe, it, expect } from "vitest";
import { APP_VERSION } from "@/lib/config/version";

/**
 * Tests for GET /api/kjemo/v1/manifest
 *
 * The manifest route:
 * - uses APP_VERSION from package.json (not process.env)
 * - is force-static (response generated at build time)
 * - exposes no sensitive data
 */
describe("GET /api/kjemo/v1/manifest", () => {
  it("returns 200 with correct content-type fields", async () => {
    const { GET } = await import("@/app/api/kjemo/v1/manifest/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/manifest");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;

    expect(body["name"]).toBe("VERALUZ SaaS V2");
    expect(body["version"]).toBe(APP_VERSION);
    expect(body["api"]).toBe("kjemo/v1");
    expect(body["platform"]).toBe("veraluz-saas-v2");
    expect(body["status"]).toBe("bootstrap");
    expect(typeof body["buildTime"]).toBe("string");
  });

  it("version matches package.json (not an env var)", async () => {
    const { GET } = await import("@/app/api/kjemo/v1/manifest/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/manifest");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    // APP_VERSION is the single source of truth — check it matches
    expect(body["version"]).toBe(APP_VERSION);
    // Must follow semver pattern
    expect(body["version"]).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("buildTime is a valid ISO 8601 date", async () => {
    const { GET } = await import("@/app/api/kjemo/v1/manifest/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/manifest");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    const parsed = new Date(body["buildTime"] as string);
    expect(parsed.getTime()).not.toBeNaN();
  });

  it("includes expected cache-control header", async () => {
    const { GET } = await import("@/app/api/kjemo/v1/manifest/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/manifest");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);

    expect(response.headers.get("cache-control")).toContain("max-age=60");
  });

  it("does not expose sensitive data", async () => {
    const { GET } = await import("@/app/api/kjemo/v1/manifest/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/manifest");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    // No secret-like keys
    const bodyStr = JSON.stringify(body);
    expect(bodyStr).not.toContain("secret");
    expect(bodyStr).not.toContain("password");
    expect(bodyStr).not.toContain("key");
  });
});
