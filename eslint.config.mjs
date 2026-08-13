import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // references/templates/ is a standalone browser prototype (React 18 +
    // Babel from a CDN, globals instead of imports/modules) — it is not
    // part of the built app and was never meant to satisfy this project's
    // ESLint rules. See CLAUDE.md.
    "references/**",
  ]),
]);

export default eslintConfig;
