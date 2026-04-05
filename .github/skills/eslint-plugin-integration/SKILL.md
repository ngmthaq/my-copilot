---
name: eslint-plugin-integration
description: "Integrating third-party ESLint plugins into JavaScript and TypeScript projects. Use when: installing and configuring ESLint plugins; setting up eslint-plugin-react, eslint-plugin-vue, @typescript-eslint, eslint-plugin-import, eslint-plugin-unicorn, eslint-plugin-sonarjs, eslint-plugin-security, eslint-plugin-prettier, eslint-plugin-n (Node.js), eslint-plugin-jsx-a11y; enabling plugin rule sets; troubleshooting plugin conflicts or peer dependency errors. DO NOT USE FOR: writing custom rules from scratch (use eslint-custom-rules skill); general ESLint flat config setup (use eslint-rule-configuration skill); Prettier configuration (use prettier-configuration skill)."
---

# ESLint Plugin Integration Skill

## Overview

This skill covers installing, configuring, and enabling third-party ESLint plugins using the **flat config** format (`eslint.config.js`, ESLint v8.21+ / v9). Each section covers a specific plugin commonly used in Node.js, TypeScript, React, and Vue projects.

---

## 1. Flat Config Basics

All examples use the flat config format. The legacy `.eslintrc` format is not covered.

```js
// eslint.config.js
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    plugins: { "plugin-name": pluginObject },
    rules: {
      "plugin-name/rule-name": "error",
    },
  },
];
```

---

## 2. `@typescript-eslint` (TypeScript)

```bash
npm install --save-dev typescript-eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Recommended setup (flat config)

```js
// eslint.config.js
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  // Or for type-checked rules (slower, requires tsconfig):
  // ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
    },
  },
);
```

### Key rules

| Rule                                               | Purpose                                           |
| -------------------------------------------------- | ------------------------------------------------- |
| `@typescript-eslint/no-explicit-any`               | Warn/error on `any` type                          |
| `@typescript-eslint/no-unused-vars`                | Unused variables (replaces base `no-unused-vars`) |
| `@typescript-eslint/consistent-type-imports`       | Enforce `import type` for type-only imports       |
| `@typescript-eslint/no-floating-promises`          | Require awaiting Promises (needs type info)       |
| `@typescript-eslint/explicit-function-return-type` | Require return type annotations                   |
| `@typescript-eslint/no-non-null-assertion`         | Disallow `!` non-null assertions                  |

---

## 3. `eslint-plugin-import` (Import Order & Resolution)

```bash
npm install --save-dev eslint-plugin-import
# For TypeScript resolution:
npm install --save-dev eslint-import-resolver-typescript
```

```js
// eslint.config.js
import importPlugin from "eslint-plugin-import";

export default [
  {
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true }, // for TS path aliases
        node: true,
      },
    },
    rules: {
      "import/no-unresolved": "error",
      "import/no-duplicates": "error",
      "import/no-cycle": "warn",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-default-export": "warn", // enforce named exports
    },
  },
];
```

---

## 4. `eslint-plugin-react` (React)

```bash
npm install --save-dev eslint-plugin-react eslint-plugin-react-hooks
```

```js
// eslint.config.js
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // React 17+ JSX transform (no need to import React)
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // Best practices
      "react/prop-types": "off", // use TypeScript instead
      "react/display-name": "warn",
      "react/no-array-index-key": "warn",
      "react/no-unstable-nested-components": "error",
      "react/self-closing-comp": "error",

      // Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
```

---

## 5. `eslint-plugin-jsx-a11y` (Accessibility)

```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

```js
// eslint.config.js
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    plugins: { "jsx-a11y": jsxA11y },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
    },
  },
];
```

---

## 6. `eslint-plugin-vue` (Vue 3)

```bash
npm install --save-dev eslint-plugin-vue vue-eslint-parser
```

```js
// eslint.config.js
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default [
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: "@typescript-eslint/parser", // for <script lang="ts">
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/no-unused-vars": "error",
      "vue/no-v-html": "warn",
      "vue/require-v-for-key": "error",
      "vue/multi-word-component-names": "warn",
      "vue/define-macros-order": ["error", { order: ["defineProps", "defineEmits"] }],
    },
  },
];
```

---

## 7. `eslint-plugin-n` (Node.js)

```bash
npm install --save-dev eslint-plugin-n
```

```js
// eslint.config.js
import pluginN from "eslint-plugin-n";

export default [
  pluginN.configs["flat/recommended"],
  {
    rules: {
      "n/no-missing-import": "error",
      "n/no-unpublished-import": "error",
      "n/no-unsupported-features/es-syntax": ["error", { version: ">=20.0.0" }],
      "n/prefer-global/process": ["error", "never"], // use import { process } from 'node:process'
      "n/prefer-node-protocol": "error", // enforce node: prefix
    },
  },
];
```

---

## 8. `eslint-plugin-unicorn` (Modern Best Practices)

```bash
npm install --save-dev eslint-plugin-unicorn
```

```js
// eslint.config.js
import unicorn from "eslint-plugin-unicorn";

export default [
  unicorn.configs["flat/recommended"],
  {
    rules: {
      // Adjust rules that conflict with your style:
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/prefer-module": "error",
      "unicorn/prefer-top-level-await": "warn",
      "unicorn/no-array-for-each": "error",
      "unicorn/no-process-exit": "error",
    },
  },
];
```

---

## 9. `eslint-plugin-sonarjs` (Code Quality / Complexity)

```bash
npm install --save-dev eslint-plugin-sonarjs
```

```js
// eslint.config.js
import sonarjs from "eslint-plugin-sonarjs";

export default [
  sonarjs.configs.recommended,
  {
    rules: {
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-duplicate-string": ["warn", { threshold: 3 }],
      "sonarjs/no-identical-functions": "warn",
      "sonarjs/no-collapsible-if": "error",
      "sonarjs/no-redundant-jump": "error",
    },
  },
];
```

---

## 10. `eslint-plugin-security` (Security)

```bash
npm install --save-dev eslint-plugin-security
```

```js
// eslint.config.js
import security from "eslint-plugin-security";

export default [
  security.configs.recommended,
  {
    rules: {
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-eval-with-expression": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-possible-timing-attacks": "warn",
    },
  },
];
```

---

## 11. `eslint-plugin-prettier` (Prettier as ESLint Rule)

```bash
npm install --save-dev eslint-plugin-prettier eslint-config-prettier prettier
```

```js
// eslint.config.js
import prettier from "eslint-plugin-prettier/recommended";

export default [
  // ...other configs,
  prettier, // must be LAST — disables conflicting rules and enables prettier/prettier
];
```

> **Note**: The recommended pattern is to run Prettier separately (not as an ESLint rule). Use `eslint-config-prettier` alone to disable conflicting rules, and run `prettier --check` separately in CI. See the `prettier-eslint-integration` skill for details.

---

## 12. `eslint-plugin-jest` / `eslint-plugin-vitest` (Testing)

### Jest

```bash
npm install --save-dev eslint-plugin-jest
```

```js
import jest from "eslint-plugin-jest";

export default [
  {
    files: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"],
    plugins: { jest },
    rules: {
      ...jest.configs.recommended.rules,
      "jest/expect-expect": "error",
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/prefer-to-be": "warn",
    },
    languageOptions: {
      globals: jest.environments.globals.globals,
    },
  },
];
```

### Vitest

```bash
npm install --save-dev eslint-plugin-vitest
```

```js
import vitest from "eslint-plugin-vitest";

export default [
  {
    files: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/no-disabled-tests": "warn",
      "vitest/no-focused-tests": "error",
      "vitest/expect-expect": "error",
    },
    languageOptions: {
      globals: vitest.environments.env.globals,
    },
  },
];
```

---

## 13. Scoping Plugins to Specific Files

```js
export default [
  // TypeScript rules only for .ts/.tsx files
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tsPlugin },
    rules: { "@typescript-eslint/no-explicit-any": "warn" },
  },

  // Test-specific rules only for test files
  {
    files: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"],
    plugins: { jest },
    rules: { "jest/no-focused-tests": "error" },
  },

  // Vue rules only for .vue files
  {
    files: ["**/*.vue"],
    plugins: { vue: pluginVue },
    rules: { "vue/no-v-html": "warn" },
  },
];
```

---

## 14. Troubleshooting Plugin Issues

### Plugin peer dependency errors

```bash
# Check what peer deps a plugin requires:
npm info eslint-plugin-import peerDependencies

# Install correct ESLint version alongside plugin:
npm install --save-dev eslint@^9 eslint-plugin-import
```

### Rule not found / plugin not loaded

```js
// Verify the plugin is registered under the correct namespace:
plugins: {
  'react-hooks': reactHooks,   // ← namespace used in rule names
}
rules: {
  'react-hooks/rules-of-hooks': 'error',  // ← must match namespace
}
```

### Flat config: legacy plugin compatibility

Some older plugins haven't been updated for flat config. Use the compatibility utility:

```bash
npm install --save-dev @eslint/compat
```

```js
import { fixupPluginRules } from "@eslint/compat";
import legacyPlugin from "eslint-plugin-legacy-plugin";

export default [
  {
    plugins: {
      legacy: fixupPluginRules(legacyPlugin),
    },
    rules: {
      "legacy/some-rule": "error",
    },
  },
];
```

### Debug which rules are active

```bash
npx eslint --print-config src/index.ts | jq '.rules'
```

---

## 15. Recommended Plugin Stack by Project Type

### Node.js + TypeScript API

```
typescript-eslint       — TypeScript type checking
eslint-plugin-import    — Import order and resolution
eslint-plugin-n         — Node.js APIs and node: protocol
eslint-plugin-security  — Security best practices
eslint-plugin-sonarjs   — Code quality and complexity
```

### React + TypeScript

```
typescript-eslint              — TypeScript
eslint-plugin-react            — React rules
eslint-plugin-react-hooks      — Hooks rules
eslint-plugin-jsx-a11y         — Accessibility
eslint-plugin-import           — Import order
eslint-plugin-unicorn          — Modern JS best practices
```

### Vue 3 + TypeScript

```
typescript-eslint       — TypeScript
eslint-plugin-vue       — Vue SFC rules
eslint-plugin-import    — Import order
eslint-plugin-unicorn   — Modern JS best practices
```

### Full-stack (any)

```
+ eslint-plugin-jest or eslint-plugin-vitest    — Test files
+ eslint-plugin-prettier (or run separately)    — Formatting
```

---

## 16. Quick Reference

| Plugin       | Package                     | Namespace            |
| ------------ | --------------------------- | -------------------- |
| TypeScript   | `typescript-eslint`         | `@typescript-eslint` |
| Import order | `eslint-plugin-import`      | `import`             |
| React        | `eslint-plugin-react`       | `react`              |
| React Hooks  | `eslint-plugin-react-hooks` | `react-hooks`        |
| JSX a11y     | `eslint-plugin-jsx-a11y`    | `jsx-a11y`           |
| Vue 3        | `eslint-plugin-vue`         | `vue`                |
| Node.js      | `eslint-plugin-n`           | `n`                  |
| Unicorn      | `eslint-plugin-unicorn`     | `unicorn`            |
| SonarJS      | `eslint-plugin-sonarjs`     | `sonarjs`            |
| Security     | `eslint-plugin-security`    | `security`           |
| Prettier     | `eslint-plugin-prettier`    | `prettier`           |
| Jest         | `eslint-plugin-jest`        | `jest`               |
| Vitest       | `eslint-plugin-vitest`      | `vitest`             |
