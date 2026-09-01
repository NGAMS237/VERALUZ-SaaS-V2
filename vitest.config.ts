import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json"],
      // HTML report excluded from CI artifacts (too large); generate locally only.
      // To generate: pnpm test:coverage -- --reporter=html
      include: ["src/lib/**/*.ts", "src/app/api/**/*.ts"],
      exclude: [
        "node_modules",
        ".next",
        "tests",
        // Exclude type-only files and barrel re-exports
        "**/*.d.ts",
        // database.types.ts is a pure type file — no executable runtime code
        "src/lib/database.types.ts",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
