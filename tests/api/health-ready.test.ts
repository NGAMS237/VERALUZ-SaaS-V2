import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Tests for GET /api/kjemo/v1/health/ready
 *
 * Readiness contract:
 * - Returns 200 when the application is ready to accept traffic
 * - Returns 503 when FEATURE_MAINTENANCE is true
 * - Never depends on a remote service (no Supabase in F0)
 * - Returns a valid ISO 8601 timestamp and non-negative integer uptime
 *
 * Note: each test resets module cache (vi.resetModules) because env.ts
 * validates process.env once at module load time. Resetting ensures
 * the route picks up the test's env state.
 */
describe("GET /api/kjemo/v1/health/ready", () => {
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    // Snapshot current env
    savedEnv["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"];
    process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "false";
    // Reset module cache so env.ts re-evaluates with current process.env
    vi.resetModules();
  });

  afterEach(() => {
    const saved = savedEnv["NEXT_PUBLIC_FEATURE_MAINTENANCE"];
    if (saved !== undefined) {
      process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = saved;
    } else {
      delete process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"];
    }
    vi.resetModules();
  });

  it("returns 200 with status ready when not in maintenance", async () => {
    process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "false";
    vi.resetModules();
    const { GET } = await import("@/app/api/kjemo/v1/health/ready/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/ready");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body["status"]).toBe("ready");
  });

  it("returns 503 with status unavailable when FEATURE_MAINTENANCE is true", async () => {
    process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "true";
    vi.resetModules();
    const { GET } = await import("@/app/api/kjemo/v1/health/ready/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/ready");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);

    expect(response.status).toBe(503);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body["status"]).toBe("unavailable");
  });

  it("timestamp is a valid ISO 8601 date", async () => {
    vi.resetModules();
    const { GET } = await import("@/app/api/kjemo/v1/health/ready/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/ready");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    const parsed = new Date(body["timestamp"] as string);
    expect(parsed.getTime()).not.toBeNaN();
  });

  it("uptime is a non-negative integer", async () => {
    vi.resetModules();
    const { GET } = await import("@/app/api/kjemo/v1/health/ready/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/ready");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    expect(body["uptime"]).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(body["uptime"])).toBe(true);
  });

  it("returns expected JSON shape in ready state", async () => {
    vi.resetModules();
    const { GET } = await import("@/app/api/kjemo/v1/health/ready/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/ready");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("uptime");
  });

  it("returns expected JSON shape in maintenance state", async () => {
    process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "true";
    vi.resetModules();
    const { GET } = await import("@/app/api/kjemo/v1/health/ready/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/ready");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("uptime");
  });
});
