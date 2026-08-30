// Test setup — environment variables for tests
// NODE_ENV is set to "test" automatically by vitest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process.env as any)["NODE_ENV"] = "test";
process.env["NEXT_PUBLIC_APP_ENV"] = "test";
process.env["NEXT_PUBLIC_APP_VERSION"] = "0.1.0";
process.env["NEXT_PUBLIC_TENANT_ID"] = "test-tenant";
process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "false";
process.env["NEXT_PUBLIC_SUPABASE_URL"] = "http://127.0.0.1:54321";
process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = "";
process.env["KJEMO_API_SECRET"] = "";
