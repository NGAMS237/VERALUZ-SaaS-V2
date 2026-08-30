import { describe, it, expect, afterEach } from "vitest";

describe("GET /api/kjemo/v1/health/live", () => {
  const savedMaintenance = process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"];

  afterEach(() => {
    if (savedMaintenance !== undefined) {
      process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = savedMaintenance;
    } else {
      delete process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"];
    }
  });

  it("returns 200 with status ok when not in maintenance", async () => {
    process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "false";

    // Reset module cache to pick up env change
    const { GET } = await import("@/app/api/kjemo/v1/health/live/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/live");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body["status"]).toBe("ok");
    expect(typeof body["timestamp"]).toBe("string");
    expect(typeof body["uptime"]).toBe("number");
  });

  it("timestamp is a valid ISO 8601 date", async () => {
    process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "false";
    const { GET } = await import("@/app/api/kjemo/v1/health/live/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/live");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    const parsed = new Date(body["timestamp"] as string);
    expect(parsed.getTime()).not.toBeNaN();
  });

  it("returns 503 with status degraded when maintenance=true", async () => {
    process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "true";
    const { GET } = await import("@/app/api/kjemo/v1/health/live/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/live");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);

    expect(response.status).toBe(503);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body["status"]).toBe("degraded");
  });

  it("uptime is a non-negative integer", async () => {
    process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "false";
    const { GET } = await import("@/app/api/kjemo/v1/health/live/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/health/live");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);
    const body = (await response.json()) as Record<string, unknown>;

    expect(body["uptime"]).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(body["uptime"])).toBe(true);
  });
});
