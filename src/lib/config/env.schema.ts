import { z } from "zod";

/**
 * Schema for public (NEXT_PUBLIC_*) environment variables.
 * These values are available on both server and client and must never be secret.
 *
 * NOTE: NEXT_PUBLIC_TENANT_ID is a routing/UX hint only.
 *       It never constitutes authorisation. Access control
 *       will be enforced via auth.uid() + memberships (F1+).
 *
 * NOTE: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *       are non-secret by construction (bundled client-side by Next.js).
 *       They are optional with local defaults to allow builds without a live
 *       Supabase instance (e.g., CI build step, storybook).
 */
export const publicEnvSchema = z.object({
  /**
   * UX/routing hint for the active tenant.
   * Never use this value as an authorisation token.
   */
  NEXT_PUBLIC_TENANT_ID: z.string().optional().default(""),

  /**
   * Supabase project URL.
   * Defaults to local Supabase stack (http://127.0.0.1:54321).
   * Must be a valid URL when provided.
   */
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url({ message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL when provided" })
    .optional()
    .default("http://127.0.0.1:54321"),

  /**
   * Supabase publishable (anon) key — safe to expose to the browser.
   * Never use the service_role key here.
   * Empty string is accepted in non-production environments (local dev, CI build).
   */
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional().default(""),
});

/**
 * Schema for server-only environment variables.
 * Never exposed to the client bundle.
 */
export const serverEnvSchema = z.object({
  /** Deployment stage. Required deliberately so startup validation can fail fast. */
  APP_ENV: z.enum(["development", "test", "staging", "production"], {
    errorMap: () => ({
      message: 'APP_ENV must be one of: "development", "test", "staging", "production"',
    }),
  }),

  NODE_ENV: z
    .enum(["development", "test", "production"], {
      errorMap: () => ({
        message: 'NODE_ENV must be one of: "development", "test", "production"',
      }),
    })
    .default("development"),

  /** Strict server-only flag; ambiguous truthy strings are rejected. */
  FEATURE_MAINTENANCE: z
    .enum(["true", "false"], {
      errorMap: () => ({
        message: 'FEATURE_MAINTENANCE must be exactly "true" or "false"',
      }),
    })
    .default("false")
    .transform((value) => value === "true"),
});

export const fullEnvSchema = publicEnvSchema.merge(serverEnvSchema);

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type FullEnv = z.infer<typeof fullEnvSchema>;
