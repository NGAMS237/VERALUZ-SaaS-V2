/**
 * Next.js Instrumentation Hook
 *
 * This file is loaded by Next.js before the app handles its first request
 * (Node.js runtime only). It triggers environment validation eagerly so
 * any misconfiguration fails at startup rather than at request time.
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register(): Promise<void> {
  // Framework exception: NEXT_RUNTIME is not application configuration.
  // It is the only process.env access allowed outside lib/config/env.ts.
  // Only validate in the Node.js runtime.
  // The Edge runtime does not support all Node.js APIs and has no
  // server-only env vars — skip validation there.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamic import to avoid bundling this into the Edge runtime.
    // The import triggers validateEnv() at module load time (env.ts).
    await import("./lib/config/env");
  }
}
