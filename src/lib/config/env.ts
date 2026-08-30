import { fullEnvSchema, type FullEnv } from "./env.schema";

/**
 * Validated server-side environment configuration.
 *
 * Import this instead of accessing process.env directly.
 * Throws at startup if required variables are missing or malformed.
 *
 * @example
 * import { env } from "@/lib/config/env";
 * console.log(env.NEXT_PUBLIC_APP_VERSION);
 */
function validateEnv(): FullEnv {
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

// Validate once at module load time — fails fast on misconfiguration
export const env = validateEnv();
