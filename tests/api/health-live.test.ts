import { describe, it, expect, beforeEach, afterEach } from "vitest";

/**
 * Tests for GET /api/kjemo/v1/health/live
 *
 * Liveness contract:
 * - Always returns 200 when the process is alive
 * - Returns 200 EVEN in maintenance mode (liveness ≠ readiness)
 * - Never reads process.env directly (uses validated env from env.ts)
 * - Returns a valid ISO 8601 timestamp and non-negative integer uptime
 */
describe("GET /api/kjemo/v1/health/live", () => {
  const savedMaintenance = process.env["FEATURE_MAINTENANCE"];

  afterEach(() => {
    if (savedMaintenance !== undefined) {
      process.env["FEATURE_MAINTENANCE"] = savedMaintenance;
    } else {
      delete process.env["FEATURE_MAINTENANCE"];
    }
  });

  beforeEach(() => {
    process.env["FEATURE_MAINTENANCE"] = "false";
  });

  it("returns 200 with status ok when not in maintenance", async () => {
    const { GET } = await import("@/app/api/kjemo/v1/health/live/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/live");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body["status"]).toBe("ok");
  });

  it("returns 200 with status ok even when FEATURE_MAINTENANCE is true", async () => {
    // Liveness must NOT return 503 for maintenance — only readiness does.
    process.env["FEATURE_MAINTENANCE"] = "true";
    const { GET } = await import("@/app/api/kjemo/v1/health/live/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/live");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body["status"]).toBe("ok");
  });

  it("timestamp is a valid ISO 8601 date", async () => {
    const { GET } = await import("@/app/api/kjemo/v1/health/live/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/live");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    const parsed = new Date(body["timestamp"] as string);
    expect(parsed.getTime()).not.toBeNaN();
  });

  it("uptime is a non-negative integer", async () => {
    const { GET } = await import("@/app/api/kjemo/v1/health/live/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/live");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    expect(body["uptime"]).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(body["uptime"])).toBe(true);
  });
});
