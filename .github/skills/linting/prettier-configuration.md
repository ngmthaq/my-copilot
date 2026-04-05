---
name: prettier-configuration
description: "Prettier configuration and setup for JavaScript, TypeScript, React, Vue, NestJS, and Express projects. Use when: configuring Prettier options (semi, quotes, trailing comma, print width); choosing a config file format (.prettierrc, prettier.config.js); setting per-language overrides; ignoring files with .prettierignore; integrating Prettier with ESLint via eslint-config-prettier; setting up format-on-save in VS Code; running Prettier checks in CI; sharing a single Prettier config across a monorepo. DO NOT USE FOR: writing custom ESLint rules (use eslint-custom-rules skill); full ESLint setup (use eslint-rule-configuration skill); monorepo workspace structure (use monorepo-linting-setup skill)."
---

# Prettier Configuration Skill

## Overview

Prettier is an opinionated code formatter that enforces a consistent style by reprinting code from scratch. It supports JavaScript, TypeScript, JSX, TSX, JSON, CSS, HTML, Vue, Markdown, and more. This skill covers all aspects of configuring and integrating Prettier in a project.

> **Standards alignment:** All config examples in this skill follow the project's `code-formatting-standards` skill — double quotes, `printWidth: 120`, semicolons required, `trailingComma: "all"`, LF line endings. Load that skill when you also need naming conventions, import order, or EditorConfig rules.

---

## 1. Installation

```bash
# npm
npm install --save-dev prettier

# pnpm
pnpm add -D prettier

# Yarn
yarn add -D prettier
```

Add a format script to `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

## 2. Config File Formats

Prettier supports multiple config file formats. Use **one** per project — do not mix them.

### `.prettierrc` (JSON — simplest, recommended for most projects)

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

### `.prettierrc.yaml` (YAML)

```yaml
semi: true
singleQuote: false
jsxSingleQuote: false
trailingComma: all
printWidth: 120
tabWidth: 2
useTabs: false
bracketSpacing: true
arrowParens: always
endOfLine: lf
```

### `prettier.config.js` / `.prettierrc.js` (JavaScript — supports comments and dynamic values)

```js
/** @type {import("prettier").Config} */
export default {
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "all",
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
};
```

> Use `prettier.config.js` (ESM) when the project has `"type": "module"` in `package.json`. Use `prettier.config.cjs` or `.prettierrc.js` for CJS projects.

### Reference via `package.json` `prettier` key (zero extra file)

```json
{
  "prettier": {
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
}
```

---

## 3. Core Config Options

| Option                       | Type                                     | Default    | Description                                             |
| ---------------------------- | ---------------------------------------- | ---------- | ------------------------------------------------------- |
| `semi`                       | `boolean`                                | `true`     | Add semicolons at end of statements                     |
| `singleQuote`                | `boolean`                                | `false`    | Use single quotes instead of double quotes              |
| `jsxSingleQuote`             | `boolean`                                | `false`    | Use single quotes in JSX attributes                     |
| `trailingComma`              | `"all"` \| `"es5"` \| `"none"`           | `"all"`    | Add trailing commas where valid in ES5 / all positions  |
| `printWidth`                 | `number`                                 | `80`       | Wrap lines longer than this                             |
| `tabWidth`                   | `number`                                 | `2`        | Number of spaces per indent level                       |
| `useTabs`                    | `boolean`                                | `false`    | Indent with tabs instead of spaces                      |
| `bracketSpacing`             | `boolean`                                | `true`     | Spaces inside object braces: `{ foo: bar }`             |
| `bracketSameLine`            | `boolean`                                | `false`    | Put JSX closing `>` on last line instead of new line    |
| `arrowParens`                | `"always"` \| `"avoid"`                  | `"always"` | Parens around single arrow function params              |
| `endOfLine`                  | `"lf"` \| `"crlf"` \| `"cr"` \| `"auto"` | `"lf"`     | Line ending style (`lf` recommended for cross-platform) |
| `singleAttributePerLine`     | `boolean`                                | `false`    | One HTML/JSX attribute per line                         |
| `htmlWhitespace`             | `"css"` \| `"strict"` \| `"ignore"`      | `"css"`    | How to handle whitespace in HTML                        |
| `embeddedLanguageFormatting` | `"auto"` \| `"off"`                      | `"auto"`   | Format embedded code (e.g. CSS in JS template literals) |

### Recommended baseline (aligned with `code-formatting-standards`)

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

## 4. Per-Language / Per-File Overrides

Use the `overrides` array to apply different options to specific file patterns:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 120,
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "printWidth": 80,
        "trailingComma": "none"
      }
    },
    {
      "files": "*.md",
      "options": {
        "printWidth": 80,
        "proseWrap": "always"
      }
    },
    {
      "files": ["*.html", "*.vue"],
      "options": {
        "printWidth": 120,
        "singleAttributePerLine": true
      }
    },
    {
      "files": "*.css",
      "options": {
        "singleQuote": false
      }
    }
  ]
}
```

**Glob patterns follow micromatch syntax** — use `*`, `**`, `{}` for alternation.

---

## 5. Ignoring Files with `.prettierignore`

`.prettierignore` uses the same syntax as `.gitignore`.

```
# Build outputs
dist/
build/
out/
.next/
.nuxt/

# Dependencies
node_modules/

# Generated files
*.min.js
*.min.css
coverage/
*.lock
pnpm-lock.yaml
yarn.lock
package-lock.json

# Config generated by tools
.env*

# Logs
*.log
```

**Inline ignore** (disable for a single expression):

```js
// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
];
```

**Ignore a whole file** (add at the top):

```js
// prettier-ignore-file
```

---

## 6. Integrating with ESLint (`eslint-config-prettier`)

Prettier and ESLint can conflict on style rules. `eslint-config-prettier` disables all ESLint rules that Prettier already handles.

**Install:**

```bash
npm install --save-dev eslint-config-prettier
# pnpm
pnpm add -D eslint-config-prettier
```

**ESLint flat config (`eslint.config.js`):**

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Must be LAST — disables conflicting ESLint style rules
  prettier,
];
```

> **Do NOT use `eslint-plugin-prettier`** (runs Prettier as an ESLint rule — slow and produces confusing double-reported errors). Use `eslint-config-prettier` only to disable conflicts, then run Prettier separately.

---

## 7. Editor Integration (VS Code)

### Install the extension

Install the **Prettier - Code formatter** extension (`esbenp.prettier-vscode`).

### `.vscode/settings.json` (workspace settings — commit this file)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### `.vscode/extensions.json` (recommend extension to teammates)

```json
{
  "recommendations": ["esbenp.prettier-vscode"]
}
```

---

## 8. Running Prettier in CI

Prettier's `--check` flag exits with code `1` if any file would be reformatted, making it suitable for CI gates.

**GitHub Actions example:**

```yaml
name: Format Check

on:
  pull_request:
  push:
    branches: [main]

jobs:
  prettier:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npx prettier --check .
```

**pnpm:**

```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 9
- run: pnpm install --frozen-lockfile
- run: pnpm format:check
```

**Yarn:**

```yaml
- run: yarn install --immutable
- run: yarn format:check
```

---

## 9. Monorepo / Shared Prettier Config Package

For monorepos, maintain a single Prettier config in a shared internal package and reference it from every app/package.

**`packages/eslint-config/prettier.config.js`** (or a dedicated `packages/prettier-config/`):

```js
/** @type {import("prettier").Config} */
export default {
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "all",
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
};
```

**`packages/prettier-config/package.json`** (if standalone):

```json
{
  "name": "@my-monorepo/prettier-config",
  "version": "1.0.0",
  "private": true,
  "main": "prettier.config.js",
  "exports": {
    ".": "./prettier.config.js"
  }
}
```

**Reference from each app's `package.json`:**

```json
{
  "prettier": "@my-monorepo/prettier-config"
}
```

Or extend and override in a local `prettier.config.js`:

```js
import baseConfig from "@my-monorepo/prettier-config";

/** @type {import("prettier").Config} */
export default {
  ...baseConfig,
  // app-specific overrides only — base already follows code-formatting-standards
};
```

> Prettier walks up the directory tree to find the nearest config. A root `.prettierrc` or `prettier.config.js` applies to all packages automatically — no per-package config needed unless overrides are required.

---

## 10. Common Pitfalls

- **Multiple config files** — Prettier loads only the nearest config file; having both `.prettierrc` and `prettier.config.js` in the same directory causes unpredictable behavior. Use one format only.
- **Conflict with ESLint style rules** — Always add `eslint-config-prettier` as the last item in the ESLint config array to disable conflicting rules.
- **`endOfLine: "auto"`** — Avoid on cross-platform teams; use `"lf"` and configure Git with `core.autocrlf=input` on Windows.
- **Not running `--check` in CI** — Formatting differences are valid CI failures; without `--check`, drift accumulates silently.
- **`eslint-plugin-prettier` anti-pattern** — Avoid it; it runs Prettier inside ESLint, doubling the work and reporting style errors in the wrong tool.
- **Forgetting `.prettierignore`** — Prettier will attempt to format `node_modules` if not ignored, making runs very slow.
- **`printWidth` is a guide, not a hard limit** — Prettier will exceed `printWidth` when it can't break a line (e.g., long string literals). This is by design.
