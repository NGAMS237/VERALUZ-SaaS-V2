/**
 * Vitest global test setup — initialise process.env for all test suites.
 *
 * NODE_ENV is set by Vitest automatically to "test".
 * We set it explicitly here to satisfy the validated env schema
 * without relying on the implicit Vitest behaviour.
 */

// NODE_ENV: TypeScript types allow string assignment on process.env.
// The cast is not needed — process.env values are always strings.
process.env["NODE_ENV"] = "test";
process.env["NEXT_PUBLIC_APP_ENV"] = "test";
process.env["NEXT_PUBLIC_TENANT_ID"] = "test-tenant";
process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "false";
// F1+ placeholders — kept here to avoid schema validation errors for
// optional variables that may still be referenced by legacy test code.
process.env["NEXT_PUBLIC_SUPABASE_URL"] = "";
process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = "";
