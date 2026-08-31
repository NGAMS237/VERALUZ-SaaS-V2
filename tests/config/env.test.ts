import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fullEnvSchema, publicEnvSchema, serverEnvSchema } from "@/lib/config/env.schema";

function validBase() {
  return {
    APP_ENV: "test" as const,
    NODE_ENV: "test" as const,
    NEXT_PUBLIC_TENANT_ID: "test-tenant",
    FEATURE_MAINTENANCE: "false" as const,
  };
}

describe("publicEnvSchema", () => {
  it("accepts an optional tenant routing hint", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_TENANT_ID: "veraluz-001",
    });

    expect(result.success).toBe(true);
  });

  it("uses an empty tenant hint by default", () => {
    const result = publicEnvSchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_TENANT_ID).toBe("");
    }
  });
});

describe("serverEnvSchema", () => {
  it.each(["development", "test", "staging", "production"] as const)(
    "accepts APP_ENV=%s",
    (appEnv) => {
      const result = serverEnvSchema.safeParse({
        APP_ENV: appEnv,
        NODE_ENV: "test",
        FEATURE_MAINTENANCE: "false",
      });

      expect(result.success).toBe(true);
    },
  );

  it("rejects a missing required APP_ENV", () => {
    const result = serverEnvSchema.safeParse({
      NODE_ENV: "test",
      FEATURE_MAINTENANCE: "false",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["APP_ENV"]);
    }
  });

  it("rejects an invalid APP_ENV", () => {
    const result = serverEnvSchema.safeParse({
      APP_ENV: "local",
      NODE_ENV: "test",
      FEATURE_MAINTENANCE: "false",
    });

    expect(result.success).toBe(false);
  });

  it.each(["True", "yes", "1", "enabled"])(
    "rejects ambiguous FEATURE_MAINTENANCE=%s",
    (maintenance) => {
      const result = serverEnvSchema.safeParse({
        APP_ENV: "test",
        NODE_ENV: "test",
        FEATURE_MAINTENANCE: maintenance,
      });

      expect(result.success).toBe(false);
    },
  );

  it.each([
    ["true", true],
    ["false", false],
  ] as const)("transforms FEATURE_MAINTENANCE=%s to %s", (maintenance, expected) => {
    const result = serverEnvSchema.safeParse({
      APP_ENV: "test",
      NODE_ENV: "test",
      FEATURE_MAINTENANCE: maintenance,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.FEATURE_MAINTENANCE).toBe(expected);
    }
  });

  it("rejects an invalid NODE_ENV", () => {
    const result = serverEnvSchema.safeParse({
      APP_ENV: "test",
      NODE_ENV: "local",
      FEATURE_MAINTENANCE: "false",
    });

    expect(result.success).toBe(false);
  });
});

describe("fullEnvSchema", () => {
  it("parses complete valid configuration", () => {
    expect(fullEnvSchema.safeParse(validBase()).success).toBe(true);
  });
});

describe("validateEnv (integration)", () => {
  const original = { ...process.env };

  beforeEach(() => {
    Object.keys(process.env).forEach((key) => delete process.env[key]);
    Object.assign(process.env, original, validBase());
  });

  afterEach(() => {
    Object.keys(process.env).forEach((key) => delete process.env[key]);
    Object.assign(process.env, original);
  });

  it("returns the validated configuration", async () => {
    const { validateEnv } = await import("@/lib/config/env");

    expect(validateEnv().APP_ENV).toBe("test");
  });

  it("throws a descriptive error when APP_ENV is missing", async () => {
    delete process.env["APP_ENV"];
    const { validateEnv } = await import("@/lib/config/env");

    expect(() => validateEnv()).toThrowError(/APP_ENV/);
  });

  it("throws a descriptive error for invalid FEATURE_MAINTENANCE", async () => {
    process.env["FEATURE_MAINTENANCE"] = "yes";
    const { validateEnv } = await import("@/lib/config/env");

    expect(() => validateEnv()).toThrowError(/FEATURE_MAINTENANCE/);
  });
});
