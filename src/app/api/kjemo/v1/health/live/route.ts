import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/kjemo/v1/health/live
 *
 * Kubernetes/Docker liveness probe endpoint.
 * Returns 200 if the process is alive and able to handle requests.
 * Returns 503 if the app is in maintenance mode.
 *
 * No authentication required. No sensitive data exposed.
 */
export const dynamic = "force-dynamic";

export interface HealthLiveResponse {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  uptime: number;
}

export function GET(_req: NextRequest): NextResponse<HealthLiveResponse> {
  const maintenance = process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] === "true";

  if (maintenance) {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
    { status: 200 },
  );
}
