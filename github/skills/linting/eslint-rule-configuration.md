---
name: eslint-rule-configuration
description: "ESLint rule configuration and flat config setup for JavaScript and TypeScript projects. Use when: setting up ESLint from scratch; configuring rule severity (error/warn/off); extending shared configs; ignoring files or directories; configuring language options and globals; setting up eslint.config.js with flat config format; migrating from .eslintrc to flat config; enabling ECMAScript version or module settings; running ESLint in CLI or scripts. DO NOT USE FOR: writing custom rules (use eslint-custom-rules skill); integrating specific plugins (use eslint-plugin-integration skill); Prettier configuration (use prettier-configuration skill)."
---

# ESLint Rule Configuration Skill

## Overview

This skill covers ESLint flat config (`eslint.config.js`) setup, rule severity syntax, extending shared configs, scoping rules to files, ignoring paths, language options, and running ESLint in scripts and CI. It targets ESLint v8.21+ (flat config opt-in) and ESLint v9+ (flat config default).

---

## 1. Installation

```bash
# ESLint v9 (flat config default):
npm install --save-dev eslint

# Initialize a config interactively:
npx eslint --init

# Or create eslint.config.js manually (see sections below)
```

---

## 2. Flat Config File (`eslint.config.js`)

The flat config is an array of **config objects**. Each object can target specific files and configure rules, plugins, language options, and settings.

```js
// eslint.config.js
import js from "@eslint/js";

export default [
  // Element 1: extend a shared config
  js.configs.recommended,

  // Element 2: global rules for all files
  {
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error",
    },
  },

  // Element 3: rules scoped to specific files
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-explicit-any": "error",
    },
  },

  // Element 4: ignore files/directories
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
];
```

---

## 3. Rule Severity

Every rule can be set to one of three values:

| Severity  | Numeric | Behavior                                          |
| --------- | ------- | ------------------------------------------------- |
| `'off'`   | `0`     | Rule disabled                                     |
| `'warn'`  | `1`     | Violation shown as warning; does **not** fail CI  |
| `'error'` | `2`     | Violation shown as error; **fails** CI (`exit 1`) |

### Syntax forms

```js
rules: {
  // String form (preferred for readability):
  "no-console": "warn",
  "no-unused-vars": "error",
  "eqeqeq": "off",

  // Number form (equivalent):
  "no-console": 1,
  "no-unused-vars": 2,
  "eqeqeq": 0,

  // Array form — [severity, ...options]:
  "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "max-len": ["error", { code: 120 }],
}
```

---

## 4. Extending Shared Configs

```js
import js from "@eslint/js";

export default [
  // ESLint built-in recommended rules:
  js.configs.recommended,

  // All built-in rules (stricter):
  js.configs.all,
];
```

### TypeScript + React full example

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
];
```

---

## 5. `files` and `ignores` — Scoping Rules

### Apply rules to specific files only

```js
export default [
  // Rules for all JS/TS files:
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    rules: { "no-console": "warn" },
  },

  // Rules only for TypeScript:
  {
    files: ["**/*.{ts,tsx}"],
    rules: { "@typescript-eslint/no-explicit-any": "error" },
  },

  // Rules only for test files:
  {
    files: ["**/*.{test,spec}.{js,ts}", "**/__tests__/**"],
    rules: { "no-console": "off" },
  },
];
```

### Ignore files and directories

```js
export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      "**/*.min.js",
      ".next/**",
      ".nuxt/**",
      "public/**",
    ],
  },
  // other config objects...
];
```

> In flat config, `ignores` in a config object **without** a `files` key creates **global ignores**.  
> `ignores` inside a config object **with** a `files` key only excludes from that config object.

---

## 6. Language Options

```js
export default [
  {
    languageOptions: {
      // ECMAScript version:
      ecmaVersion: 2022, // or 'latest'

      // Module system:
      sourceType: "module", // 'module' | 'commonjs' | 'script'

      // Global variables:
      globals: {
        // Built-in global sets (from 'globals' package):
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,

        // Custom globals:
        MY_GLOBAL: "readonly",
        __DEV__: "readonly",
      },

      // Parser (for TypeScript or Vue):
      parser: typescriptParser,

      // Parser options:
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

### Install the `globals` package

```bash
npm install --save-dev globals
```

```js
import globals from "globals";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node, // process, __dirname, Buffer, etc.
        ...globals.browser, // window, document, fetch, etc.
      },
    },
  },
];
```

---

## 7. Common Built-in Rules Reference

### Code quality

```js
rules: {
  "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
  "no-undef": "error",
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "no-debugger": "error",
  "no-alert": "error",
  "no-eval": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",
  "eqeqeq": ["error", "always"],
  "curly": ["error", "all"],
  "no-var": "error",
  "prefer-const": "error",
  "prefer-arrow-callback": "error",
  "object-shorthand": "error",
  "no-duplicate-imports": "error",
}
```

### Error prevention

```js
rules: {
  "no-fallthrough": "error",
  "no-unreachable": "error",
  "no-constant-condition": "error",
  "no-dupe-keys": "error",
  "no-dupe-args": "error",
  "no-duplicate-case": "error",
  "no-empty": "warn",
  "no-extra-semi": "error",
  "no-irregular-whitespace": "error",
  "use-isnan": "error",
  "valid-typeof": "error",
}
```

### Best practices

```js
rules: {
  "max-len": ["warn", { code: 120, ignoreUrls: true, ignoreStrings: true }],
  "max-depth": ["warn", 4],
  "max-params": ["warn", 4],
  "complexity": ["warn", 10],
  "no-magic-numbers": ["warn", { ignore: [0, 1, -1] }],
  "consistent-return": "error",
  "default-case": "warn",
  "guard-for-in": "warn",
  "no-shadow": "warn",
  "radix": "error",
}
```

---

## 8. Overriding Rules from Extended Configs

```js
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  {
    // Override specific rules from recommended config:
    rules: {
      // Downgrade from error to warn:
      "@typescript-eslint/no-explicit-any": "warn",

      // Disable entirely:
      "@typescript-eslint/no-inferrable-types": "off",

      // Change options:
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
```

---

## 9. Inline Disable Comments

```js
// Disable for the entire file (must be at the top):
/* eslint-disable */

// Disable a specific rule for the entire file:
/* eslint-disable no-console */

// Disable for the next line only:
// eslint-disable-next-line no-console
console.log("debug");

// Disable for the current line:
console.log("debug"); // eslint-disable-line no-console

// Re-enable after a block disable:
/* eslint-disable no-console */
console.log("a");
console.log("b");
/* eslint-enable no-console */
```

> Use inline disables sparingly. Prefer fixing the underlying issue or adjusting config. Always provide a reason in a comment when disabling.

---

## 10. Full Project Examples

### Node.js + TypeScript API (`eslint.config.js`)

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  { ignores: ["dist/**", "node_modules/**", "coverage/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off", // replaced by TS rule
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
    },
  },

  // Relax rules in test files
  {
    files: ["**/*.{test,spec}.ts", "**/__tests__/**/*.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
```

### React + TypeScript SPA (`eslint.config.js`)

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  { ignores: ["dist/**", "node_modules/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: { react, "react-hooks": reactHooks },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
    },
  },
];
```

---

## 11. CLI Usage

```bash
# Lint all JS/TS files:
npx eslint .

# Lint a specific file or directory:
npx eslint src/

# Lint and auto-fix:
npx eslint --fix .

# Lint with a specific config file:
npx eslint --config eslint.config.js .

# Show which rules apply to a file:
npx eslint --print-config src/index.ts

# Show all errors without warnings:
npx eslint --quiet .

# Output as JSON (for CI parsing):
npx eslint --format json -o eslint-report.json .

# List all available formatters:
npx eslint --help | grep format
```

### `package.json` scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "lint:ci": "eslint . --max-warnings 0"
  }
}
```

---

## 12. Migrating from `.eslintrc` to Flat Config

```bash
# Use the official migration tool:
npx @eslint/migrate-config .eslintrc.json
```

### Key differences

| `.eslintrc`                           | `eslint.config.js` flat config                  |
| ------------------------------------- | ----------------------------------------------- |
| `extends: ['plugin:x/recommended']`   | Spread plugin config array directly             |
| `plugins: ['react']`                  | `plugins: { react: reactPlugin }`               |
| `env: { browser: true }`              | `languageOptions: { globals: globals.browser }` |
| `parser: '@typescript-eslint/parser'` | `languageOptions: { parser: tsParser }`         |
| `overrides: [{ files, rules }]`       | Separate config object with `files`             |
| `ignorePatterns`                      | `ignores` array in a config object              |
| Multiple config files (`extends`)     | Single array merging all configs                |

---

## 13. Quick Reference

| Task                        | Config                                       |
| --------------------------- | -------------------------------------------- |
| Enable a rule as error      | `'rule-name': 'error'`                       |
| Enable a rule as warning    | `'rule-name': 'warn'`                        |
| Disable a rule              | `'rule-name': 'off'`                         |
| Rule with options           | `'rule-name': ['error', { option: value }]`  |
| Extend built-in recommended | `js.configs.recommended`                     |
| Scope to file glob          | `{ files: ['**/*.ts'], rules: {} }`          |
| Global ignores              | `{ ignores: ['dist/**'] }`                   |
| Set ECMAScript version      | `languageOptions: { ecmaVersion: 'latest' }` |
| Set globals                 | `languageOptions: { globals: globals.node }` |
| Disable rule inline         | `// eslint-disable-next-line rule-name`      |
| Lint and fix                | `eslint --fix .`                             |
| Max warnings in CI          | `eslint --max-warnings 0 .`                  |
| Print active config         | `eslint --print-config src/index.ts`         |
