import { describe, it, expect } from "vitest";
import { fullEnvSchema, publicEnvSchema } from "@/lib/config/env.schema";

describe("Environment schema validation", () => {
  describe("publicEnvSchema", () => {
    it("accepts valid development config", () => {
      const result = publicEnvSchema.safeParse({
        NEXT_PUBLIC_APP_ENV: "development",
        NEXT_PUBLIC_APP_VERSION: "0.1.0",
        NEXT_PUBLIC_TENANT_ID: "veraluz-001",
        NEXT_PUBLIC_FEATURE_MAINTENANCE: "false",
      });
      expect(result.success).toBe(true);
    });

    it("accepts all valid APP_ENV values", () => {
      const envs = ["development", "test", "staging", "production"] as const;
      for (const env of envs) {
        const result = publicEnvSchema.safeParse({
          NEXT_PUBLIC_APP_ENV: env,
          NEXT_PUBLIC_APP_VERSION: "1.0.0",
        });
        expect(result.success, `Failed for env: ${env}`).toBe(true);
      }
    });

    it("rejects invalid APP_ENV value", () => {
      const result = publicEnvSchema.safeParse({
        NEXT_PUBLIC_APP_ENV: "local",
        NEXT_PUBLIC_APP_VERSION: "0.1.0",
      });
      expect(result.success).toBe(false);
    });

    it("rejects version not matching semver", () => {
      const result = publicEnvSchema.safeParse({
        NEXT_PUBLIC_APP_ENV: "development",
        NEXT_PUBLIC_APP_VERSION: "not-a-version",
      });
      expect(result.success).toBe(false);
    });

    it("converts FEATURE_MAINTENANCE string to boolean", () => {
      const result = publicEnvSchema.safeParse({
        NEXT_PUBLIC_APP_ENV: "production",
        NEXT_PUBLIC_APP_VERSION: "1.0.0",
        NEXT_PUBLIC_FEATURE_MAINTENANCE: "true",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_FEATURE_MAINTENANCE).toBe(true);
      }
    });

    it("uses defaults when optional fields are missing", () => {
      const result = publicEnvSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_APP_ENV).toBe("development");
        expect(result.data.NEXT_PUBLIC_APP_VERSION).toBe("0.1.0");
      }
    });
  });

  describe("fullEnvSchema", () => {
    it("parses complete valid config", () => {
      const result = fullEnvSchema.safeParse({
        NODE_ENV: "test",
        NEXT_PUBLIC_APP_ENV: "test",
        NEXT_PUBLIC_APP_VERSION: "0.1.0",
        NEXT_PUBLIC_TENANT_ID: "test-tenant",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        KJEMO_API_SECRET: "",
        NEXT_PUBLIC_FEATURE_MAINTENANCE: "false",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid NODE_ENV", () => {
      const result = fullEnvSchema.safeParse({
        NODE_ENV: "local",
      });
      expect(result.success).toBe(false);
    });
  });
});
