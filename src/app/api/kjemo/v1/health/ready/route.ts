import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";

/**
 * GET /api/kjemo/v1/health/ready
 *
 * Kubernetes / Docker readiness probe.
 * Returns 200 when the application is ready to accept traffic.
 * Returns 503 when the application is in maintenance mode.
 *
 * This probe is safe to use as an ingress/load-balancer health check:
 * a 503 response causes traffic to be held at the edge without
 * restarting the container (that is the liveness probe's role).
 *
 * No authentication required. No sensitive data exposed.
 * No dependency on any remote service in F0.
 */
export const dynamic = "force-dynamic";

export interface HealthReadyResponse {
  status: "ready" | "unavailable";
  timestamp: string;
  uptime: number;
}

export function GET(_req: NextRequest): NextResponse<HealthReadyResponse> {
  const inMaintenance = env.FEATURE_MAINTENANCE;

  if (inMaintenance) {
    return NextResponse.json(
      {
        status: "unavailable",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      status: "ready",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
    { status: 200 },
  );
}
