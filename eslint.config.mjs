// @ts-check
import nextConfig from "eslint-config-next";
import nextTsConfig from "eslint-config-next/typescript";
import nextWebVitals from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextConfig,
  ...nextTsConfig,
  ...nextWebVitals,
  {
    rules: {
      // No explicit any
      "@typescript-eslint/no-explicit-any": "error",
      // No unused vars (allow _ prefix)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "coverage/**"],
  },
];

export default config;
