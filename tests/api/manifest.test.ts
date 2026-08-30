import { describe, it, expect, beforeEach } from "vitest";

// We test the handler logic directly without Next.js runtime
// by importing the GET function and calling it with a mock request.

describe("GET /api/kjemo/v1/manifest", () => {
  beforeEach(() => {
    process.env["NEXT_PUBLIC_APP_VERSION"] = "0.1.0";
  });

  it("returns 200 with correct content-type fields", async () => {
    const { GET } = await import("@/app/api/kjemo/v1/manifest/route");

    const mockReq = new Request("http://localhost:3000/api/kjemo/v1/manifest");
    const response = await GET(mockReq as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;

    expect(body["name"]).toBe("VERALUZ SaaS V2");
    expect(body["version"]).toBe("0.1.0");
    expect(body["api"]).toBe("kjemo/v1");
    expect(body["platform"]).toBe("veraluz-saas-v2");
    expect(body["status"]).toBe("bootstrap");
    expect(typeof body["buildTime"]).toBe("string");
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
});
