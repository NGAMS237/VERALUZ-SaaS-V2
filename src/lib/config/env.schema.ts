import { z } from "zod";

/**
 * Schema for public (NEXT_PUBLIC_*) environment variables.
 * These are available on both server and client.
 *
 * NOTE: NEXT_PUBLIC_TENANT_ID is a routing/UX hint only.
 *       It never constitutes authorisation. Access control
 *       will be enforced via auth.uid() + memberships (F1+).
 *
 * NOTE: Supabase variables are F1+ placeholders that trigger no
 *       connection in F0. They are optional with empty defaults.
 */
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "test", "staging", "production"], {
      errorMap: () => ({
        message:
          'NEXT_PUBLIC_APP_ENV must be one of: "development", "test", "staging", "production"',
      }),
    })
    .default("development"),

  /**
   * UX/routing hint for the active tenant.
   * Never use this value as an authorisation token.
   */
  NEXT_PUBLIC_TENANT_ID: z.string().optional().default(""),

  /**
   * Strict boolean flag: only the literal strings "true" or "false".
   * Values like "True", "yes", "1" are rejected — no silent coercion.
   */
  NEXT_PUBLIC_FEATURE_MAINTENANCE: z
    .enum(["true", "false"], {
      errorMap: () => ({
        message: 'NEXT_PUBLIC_FEATURE_MAINTENANCE must be exactly "true" or "false"',
      }),
    })
    .default("false")
    .transform((v) => v === "true"),

  // ── F1+ placeholders — unused in F0, no connection triggered ─────────────
  /** @future F1 — local Supabase URL. NOT a secret (NEXT_PUBLIC_ prefix). */
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(""),
  /** @future F1 — Supabase anon key. NOT a secret (NEXT_PUBLIC_ prefix). */
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
});

/**
 * Schema for server-only environment variables.
 * Never exposed to the client bundle.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"], {
      errorMap: () => ({
        message: 'NODE_ENV must be one of: "development", "test", "production"',
      }),
    })
    .default("development"),
});

export const fullEnvSchema = publicEnvSchema.merge(serverEnvSchema);

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type FullEnv = z.infer<typeof fullEnvSchema>;
