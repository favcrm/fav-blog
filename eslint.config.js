import prettier from "eslint-config-prettier";
import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

export default ts.config(
  {
    ignores: [
      "build/",
      ".svelte-kit/",
      ".vercel/",
      "dist/",
      "node_modules/",
      "vite.config.ts.timestamp-*.mjs",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
    rules: {
      "svelte/valid-compile": ["error", { ignoreWarnings: true }],
    },
  },
  {
    files: [
      "src/routes/(admin)/**/*.svelte",
      "src/lib/components/admin/**/*.svelte",
      "src/lib/components/ui/**/*.svelte",
      "src/lib/layouts/AdminLayout.svelte",
    ],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "svelte/no-at-html-tags": "off",
    },
  },
);
