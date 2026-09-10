import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPlaywright from "eslint-plugin-playwright";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["package-lock.json", "playwright-report/**", "test-results/**"] },
  { files: ["**/*.ts"] },
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-console": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
  eslintPluginPlaywright.configs["flat/recommended"],
  {
    rules: {
      "playwright/no-nested-step": "off",
    },
    settings: {
      playwright: {
        globalAliases: {
          test: ["setup", "health"],
        },
      },
    },
  },
  {
    files: ["tests/auth/setup.spec.ts"],
    rules: {
      "playwright/expect-expect": "off",
    },
  },
  eslintConfigPrettier,
];
