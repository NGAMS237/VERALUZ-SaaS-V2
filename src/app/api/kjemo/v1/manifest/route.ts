import { type NextRequest, NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/config/version";
import { env } from "@/lib/config/env";

/**
 * GET /api/kjemo/v1/manifest
 *
 * Returns static metadata about this VERALUZ SaaS V2 instance.
 * No authentication required. No sensitive data exposed.
 *
 * NOTE on buildTime: this route uses force-static, meaning Next.js
 * generates the response once at build time. The `buildTime` value
 * therefore represents the moment the production build was created,
 * not the moment of the HTTP request.
 */
export const dynamic = "force-static";
export const revalidate = 60;

export interface ManifestResponse {
  name: string;
  version: string;
  api: string;
  platform: string;
  status: "bootstrap" | "active" | "maintenance";
  buildTime: string;
}

export function GET(_req: NextRequest): NextResponse<ManifestResponse> {
  // Access env to ensure validation is triggered at startup.
  // (instrumentation.ts already does this; this is a belt-and-suspenders guard.)
  void env;

  return NextResponse.json(
    {
      name: "VERALUZ SaaS V2",
      version: APP_VERSION,
      api: "kjemo/v1",
      platform: "veraluz-saas-v2",
      status: "bootstrap",
      buildTime: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}
