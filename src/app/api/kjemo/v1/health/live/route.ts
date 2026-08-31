import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/kjemo/v1/health/live
 *
 * Kubernetes / Docker liveness probe.
 * Returns 200 if and only if the Node.js process is alive and able to
 * handle requests.
 *
 * IMPORTANT: this endpoint MUST return 200 even when the application is
 * in maintenance mode. A liveness probe returning non-200 causes the
 * orchestrator to restart the pod — maintenance mode is not a crash.
 * Use /api/kjemo/v1/health/ready to signal traffic readiness instead.
 *
 * No authentication required. No sensitive data exposed.
 */
export const dynamic = "force-dynamic";

export interface HealthLiveResponse {
  status: "ok";
  timestamp: string;
  uptime: number;
}

export function GET(_req: NextRequest): NextResponse<HealthLiveResponse> {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
    { status: 200 },
  );
}
