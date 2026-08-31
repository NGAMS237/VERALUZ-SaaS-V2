import { fullEnvSchema, type FullEnv } from "./env.schema";

/**
 * Validated server-side environment configuration.
 *
 * This is the ONLY authorised access point for environment variables
 * in application code under src/. Tests may manipulate process.env
 * directly to isolate scenarios.
 *
 * Throws at startup if required variables are missing or malformed.
 *
 * @example
 * import { env } from "@/lib/config/env";
 * if (env.FEATURE_MAINTENANCE) { ... }
 */
export function validateEnv(): FullEnv {
  const result = fullEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `[VERALUZ] Invalid environment configuration:\n${formatted}\n\nSee .env.example for required variables.`,
    );
  }

  return result.data;
}

// Validate once at module load time — fails fast on misconfiguration.
// Imported by src/instrumentation.ts to run before the first request.
export const env = validateEnv();
