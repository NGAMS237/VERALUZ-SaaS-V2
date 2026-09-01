/**
 * Vitest global test setup — initialise process.env for all test suites.
 *
 * NODE_ENV is set by Vitest automatically to "test" and is read-only in
 * the Node.js type definitions. Only VERALUZ-specific variables are set here.
 */

process.env["APP_ENV"] = "test";
process.env["NEXT_PUBLIC_TENANT_ID"] = "test-tenant";
process.env["FEATURE_MAINTENANCE"] = "false";

// Variables Supabase pour les tests F1
process.env["NEXT_PUBLIC_SUPABASE_URL"] = "http://127.0.0.1:54321";
process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] = "test-anon-key-for-vitest";
