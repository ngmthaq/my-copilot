---
name: prettier-eslint-integration
description: "Integrating Prettier with ESLint to avoid rule conflicts and run both tools correctly. Use when: Prettier and ESLint style rules conflict; setting up eslint-config-prettier; deciding whether to use eslint-plugin-prettier; running Prettier and ESLint as separate scripts; configuring format-on-save alongside ESLint fix; integrating both tools in CI. DO NOT USE FOR: configuring Prettier options from scratch (use prettier-configuration skill); writing custom ESLint rules (use eslint-custom-rules skill); full ESLint flat config setup (use eslint-rule-configuration skill)."
---

# Prettier + ESLint Integration Skill

## Overview

Prettier handles **formatting** (whitespace, quotes, semicolons, line length). ESLint handles **code quality** (unused variables, unreachable code, type errors). They must be configured to run without conflicting. This skill covers the correct integration pattern and common anti-patterns to avoid.

> **Standards alignment:** All config examples follow `code-formatting-standards` — double quotes, `printWidth: 120`, `trailingComma: "all"`, LF line endings.

---

## 1. The Correct Integration Pattern

```
ESLint (code quality only)  +  Prettier (formatting only)
        │                              │
        ▼                              ▼
 eslint --fix (logic)        prettier --write (style)
```

- **ESLint** reports and fixes code quality issues
- **Prettier** formats code
- `eslint-config-prettier` disables ESLint style rules that overlap with Prettier
- They run as **separate tools**, not nested inside each other

---

## 2. Installing `eslint-config-prettier`

`eslint-config-prettier` is a shareable ESLint config that turns off all style rules that Prettier already handles, preventing conflicts.

```bash
# npm
npm install --save-dev eslint-config-prettier prettier

# pnpm
pnpm add -D eslint-config-prettier prettier

# Yarn
yarn add -D eslint-config-prettier prettier
```

---

## 3. Flat Config Setup (`eslint.config.js`)

`eslint-config-prettier` must be the **last element** in the config array so it overrides all preceding style rules.

### TypeScript project

```js
// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // prettier MUST be last — disables all conflicting ESLint style rules
  prettier,
];
```

### React + TypeScript project

```js
// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
  },
  // prettier MUST be last
  prettier,
];
```

### Vue + TypeScript project

```js
// eslint.config.js
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  // prettier MUST be last
  prettier,
];
```

---

## 4. `package.json` Scripts — Run Both Separately

```json
{
  "scripts": {
    "lint": "eslint --cache --cache-strategy content .",
    "lint:fix": "eslint --cache --cache-strategy content --fix .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "npm run format:check && npm run lint"
  }
}
```

**Recommended order when fixing**: run Prettier first, then ESLint fix:

```bash
# 1. Format code with Prettier
npm run format

# 2. Fix remaining ESLint issues
npm run lint:fix
```

This order avoids ESLint writing code that Prettier immediately reformats.

---

## 5. `.prettierrc` — Required Config (aligned with `code-formatting-standards`)

```json
{
  "semi": true,
  "singleQuote": false,
  "jsxSingleQuote": false,
  "trailingComma": "all",
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 6. CI — Run Both Tools as Separate Steps

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      # Step 1 — Prettier format check (exit 1 if any file would change)
      - name: Check formatting
        run: npx prettier --check .

      # Step 2 — ESLint quality check (exit 1 on any error)
      - name: Lint
        run: npx eslint --max-warnings 0 .
```

---

## 7. VS Code — Format on Save + ESLint Fix on Save

`.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

This runs Prettier on save (formatting), then ESLint auto-fix (code quality). They do not conflict because `eslint-config-prettier` is in the ESLint config.

---

## 8. Anti-Patterns to Avoid

### ❌ `eslint-plugin-prettier` — Do NOT use

`eslint-plugin-prettier` makes ESLint run Prettier as a rule, then report Prettier violations as ESLint errors. This causes:

- **Double runtime**: every file is processed by both ESLint and Prettier sequentially
- **Confusing errors**: style errors appear as ESLint errors with cryptic rule names (`prettier/prettier`)
- **Slower CI**: lint times increase significantly on large codebases
- **Double fix conflicts**: `eslint --fix` and `prettier --write` may produce different outputs on the same file

**Instead**: use `eslint-config-prettier` (disables conflicts) and run Prettier separately.

### ❌ Extending both `plugin:prettier/recommended` and other style configs

`plugin:prettier/recommended` re-enables `eslint-plugin-prettier`. Avoid it.

### ❌ Running ESLint fix before Prettier

```bash
# Wrong order — ESLint may write code Prettier will reformat
npm run lint:fix && npm run format
```

```bash
# Correct order — Prettier first, then ESLint quality fixes
npm run format && npm run lint:fix
```

### ❌ Missing `eslint-config-prettier` when using style plugins

If you use `eslint-plugin-react`, `eslint-plugin-vue`, or similar plugins that have style rules, `eslint-config-prettier` must still be last — it also disables conflicting rules from those plugins.

---

## 9. Verifying No Conflicts

Check which ESLint rules conflict with Prettier:

```bash
npx eslint-config-prettier eslint.config.js
```

Or use the CLI helper:

```bash
npx prettier-eslint-config-check
```

This reports any active ESLint rules that Prettier controls, so you can confirm `eslint-config-prettier` is disabling them all.

---

## 10. Shared Config in Monorepo

In a monorepo, include `eslint-config-prettier` in the shared base config so every package inherits it automatically:

```js
// packages/eslint-config/base.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier, // last — disables all style rule conflicts
];
```

Each app then just imports and extends without worrying about Prettier conflicts:

```js
// apps/api/eslint.config.js
import baseConfig from "@my-monorepo/eslint-config/base";

export default [
  ...baseConfig,
  {
    rules: {
      "no-console": "off",
    },
  },
];
```
