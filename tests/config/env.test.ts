import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fullEnvSchema, publicEnvSchema } from "@/lib/config/env.schema";

// ─── helpers ────────────────────────────────────────────────────────────────

function validBase() {
  return {
    NODE_ENV: "test" as const,
    NEXT_PUBLIC_APP_ENV: "test" as const,
    NEXT_PUBLIC_TENANT_ID: "test-tenant",
    NEXT_PUBLIC_FEATURE_MAINTENANCE: "false" as const,
  };
}

// ─── publicEnvSchema ────────────────────────────────────────────────────────

describe("publicEnvSchema", () => {
  it("accepts valid development config", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "development",
      NEXT_PUBLIC_TENANT_ID: "veraluz-001",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "false",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid test config", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "test",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "false",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid staging config", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "staging",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "false",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid production config", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "production",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "false",
    });
    expect(result.success).toBe(true);
  });

  it('accepts FEATURE_MAINTENANCE "true" and transforms to boolean true', () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "production",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_FEATURE_MAINTENANCE).toBe(true);
    }
  });

  it('accepts FEATURE_MAINTENANCE "false" and transforms to boolean false', () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "development",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "false",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_FEATURE_MAINTENANCE).toBe(false);
    }
  });

  it('rejects FEATURE_MAINTENANCE "True" (capital T)', () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "development",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "True",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? "";
      expect(msg).toContain('must be exactly "true" or "false"');
    }
  });

  it('rejects FEATURE_MAINTENANCE "yes"', () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "development",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "yes",
    });
    expect(result.success).toBe(false);
  });

  it('rejects FEATURE_MAINTENANCE "1"', () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "development",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown FEATURE_MAINTENANCE value", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "development",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "enabled",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid APP_ENV value", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_ENV: "local",
      NEXT_PUBLIC_FEATURE_MAINTENANCE: "false",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? "";
      expect(msg).toContain("development");
    }
  });

  it("uses defaults when all optional fields are missing", () => {
    const result = publicEnvSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_APP_ENV).toBe("development");
      expect(result.data.NEXT_PUBLIC_FEATURE_MAINTENANCE).toBe(false);
    }
  });
});

// ─── fullEnvSchema ───────────────────────────────────────────────────────────

describe("fullEnvSchema", () => {
  it("parses complete valid config", () => {
    const result = fullEnvSchema.safeParse(validBase());
    expect(result.success).toBe(true);
  });

  it("rejects invalid NODE_ENV", () => {
    const result = fullEnvSchema.safeParse({
      ...validBase(),
      NODE_ENV: "local",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? "";
      expect(msg).toContain("NODE_ENV");
    }
  });

  it("produces a readable error message for an invalid required variable", () => {
    const result = fullEnvSchema.safeParse({
      ...validBase(),
      NEXT_PUBLIC_APP_ENV: "invalid-env",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      // Error must name the invalid field clearly
      const formatted = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("\n");
      expect(formatted).toContain("NEXT_PUBLIC_APP_ENV");
    }
  });
});

// ─── validateEnv integration ─────────────────────────────────────────────────

describe("validateEnv (integration)", () => {
  const original = { ...process.env };

  beforeEach(() => {
    // Reset env to baseline before each test
    Object.keys(process.env).forEach((k) => {
      delete process.env[k];
    });
    Object.assign(process.env, original);
  });

  afterEach(() => {
    Object.keys(process.env).forEach((k) => {
      delete process.env[k];
    });
    Object.assign(process.env, original);
  });

  it("validateEnv() is actually called and returns the config object", async () => {
    // Re-import to run validateEnv in the current test env context
    const { validateEnv } = await import("@/lib/config/env");
    const result = validateEnv();
    expect(result).toBeDefined();
    expect(result.NEXT_PUBLIC_APP_ENV).toBe("test");
  });

  it("validateEnv() throws a descriptive error for invalid FEATURE_MAINTENANCE", async () => {
    process.env["NEXT_PUBLIC_FEATURE_MAINTENANCE"] = "yes";
    const { validateEnv } = await import("@/lib/config/env");
    expect(() => validateEnv()).toThrowError(/VERALUZ.*Invalid environment/);
  });
});
