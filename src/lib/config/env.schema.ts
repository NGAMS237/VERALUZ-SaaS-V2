import { z } from "zod";

/**
 * Schema for public (NEXT_PUBLIC_*) environment variables.
 * These are available on both server and client.
 */
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "test", "staging", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_VERSION: z
    .string()
    .regex(/^\d+\.\d+\.\d+/, "Must follow semver (e.g. 0.1.0)")
    .default("0.1.0"),
  NEXT_PUBLIC_TENANT_ID: z.string().optional().default(""),
  // default first, then transform — so the string default is transformed to boolean
  NEXT_PUBLIC_FEATURE_MAINTENANCE: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true"),
});

/**
 * Schema for server-only environment variables.
 * Never exposed to the client bundle.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  KJEMO_API_SECRET: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .default("http://127.0.0.1:54321"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
});

export const fullEnvSchema = publicEnvSchema.merge(serverEnvSchema);

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type FullEnv = z.infer<typeof fullEnvSchema>;
