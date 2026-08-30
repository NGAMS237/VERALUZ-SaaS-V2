import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/kjemo/v1/manifest
 *
 * Returns static metadata about this VERALUZ SaaS V2 instance.
 * No authentication required. No sensitive data exposed.
 */
export const dynamic = "force-static";
export const revalidate = false;

export interface ManifestResponse {
  name: string;
  version: string;
  api: string;
  platform: string;
  status: "bootstrap" | "active" | "maintenance";
  buildTime: string;
}

export function GET(_req: NextRequest): NextResponse<ManifestResponse> {
  return NextResponse.json(
    {
      name: "VERALUZ SaaS V2",
      version: process.env["NEXT_PUBLIC_APP_VERSION"] ?? "0.1.0",
      api: "kjemo/v1",
      platform: "veraluz-saas-v2",
      status: "bootstrap",
      buildTime: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    },
  );
}
