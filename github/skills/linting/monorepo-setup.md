---
name: monorepo-linting-setup
description: "Monorepo workspace structure and linting setup using pnpm workspaces, Yarn workspaces, or npm workspaces. Use when: setting up a monorepo from scratch; configuring workspace protocols (pnpm/yarn/npm); sharing ESLint or Prettier configs across packages; running lint across all packages; configuring root-level vs per-package lint config; structuring apps/ and packages/ directories; using shared internal packages for configs; running lint in CI for monorepos. DO NOT USE FOR: single-package projects; writing custom ESLint rules (use eslint-custom-rules skill); integrating specific ESLint plugins (use eslint-plugin-integration skill); Docker or deployment setup."
---

# Monorepo Linting Setup Skill

## Overview

A monorepo hosts multiple packages or apps in a single repository. This skill covers how to structure workspaces using **pnpm**, **Yarn**, or **npm**, and how to set up a shared, consistent linting configuration across all packages.

---

## 1. Monorepo Directory Structure

A well-structured monorepo follows this layout:

```
my-monorepo/
├── apps/                   # Deployable applications
│   ├── web/                # e.g. React or Vue frontend
│   └── api/                # e.g. NestJS or Express backend
├── packages/               # Shared internal packages
│   ├── eslint-config/      # Shared ESLint config
│   ├── tsconfig/           # Shared TypeScript config
│   └── ui/                 # Shared component library
├── package.json            # Root workspace config
├── pnpm-workspace.yaml     # (pnpm only)
├── .eslintrc.js / eslint.config.js  # Root lint config (optional)
└── .prettierrc             # Shared Prettier config
```

**Rules:**

- Keep deployable apps in `apps/`, reusable code in `packages/`
- Never import from `apps/` → `apps/` (cross-app imports are a red flag)
- `packages/` can be imported by any `apps/` or other `packages/`

---

## 2. Workspace Configuration

### pnpm Workspaces

**`pnpm-workspace.yaml`** (required):

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Root `package.json`**:

```json
{
  "name": "my-monorepo",
  "private": true,
  "engines": {
    "node": ">=18",
    "pnpm": ">=8"
  },
  "scripts": {
    "lint": "pnpm -r run lint",
    "lint:fix": "pnpm -r run lint:fix",
    "build": "pnpm -r run build"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

**Install a package into a specific workspace:**

```bash
# Add to a specific app
pnpm --filter @my-monorepo/web add react

# Add a shared internal package
pnpm --filter @my-monorepo/web add @my-monorepo/ui --workspace

# Add a dev dependency to the root
pnpm add -D eslint -w
```

**Run scripts across all packages:**

```bash
pnpm -r run lint           # Run lint in all packages (recursive)
pnpm --filter @my-monorepo/web run lint  # Run in one package
pnpm --filter "./apps/**" run build      # Glob filter
```

---

### Yarn Workspaces (Yarn Berry / v4)

**Root `package.json`**:

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "lint": "yarn workspaces foreach -A run lint",
    "build": "yarn workspaces foreach -A run build"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

**`.yarnrc.yml`** (Yarn Berry):

```yaml
nodeLinker: node-modules # or pnp (Plug'n'Play)
```

**Install commands:**

```bash
# Add to a specific workspace
yarn workspace @my-monorepo/web add react

# Add a shared internal package (workspace protocol)
yarn workspace @my-monorepo/web add @my-monorepo/ui@workspace:*

# Add dev dep to root
yarn add -D eslint
```

**Run scripts:**

```bash
yarn workspaces foreach -A run lint        # All workspaces
yarn workspaces foreach -A --parallel run build  # Parallel
yarn workspace @my-monorepo/web run lint   # One workspace
```

---

### npm Workspaces (npm v7+)

**Root `package.json`**:

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "lint": "npm run lint --workspaces --if-present",
    "build": "npm run build --workspaces --if-present"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

**Install commands:**

```bash
# Add to a specific workspace
npm install react --workspace=apps/web

# Add a shared internal package
npm install @my-monorepo/ui --workspace=apps/web

# Add dev dep to root
npm install -D eslint
```

**Run scripts:**

```bash
npm run lint --workspaces --if-present     # All workspaces
npm run lint --workspace=apps/web          # One workspace
```

---

## 3. Shared ESLint Config Package

Create a shared ESLint config in `packages/eslint-config/`.

**`packages/eslint-config/package.json`**:

```json
{
  "name": "@my-monorepo/eslint-config",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "exports": {
    "./base": "./base.js",
    "./react": "./react.js",
    "./node": "./node.js"
  },
  "peerDependencies": {
    "eslint": ">=9.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "typescript-eslint": "^8.0.0"
  }
}
```

**`packages/eslint-config/base.js`** (TypeScript base):

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
];
```

**`packages/eslint-config/react.js`** (React apps):

```js
import baseConfig from "./base.js";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  reactPlugin.configs.flat.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
```

**`packages/eslint-config/node.js`** (NestJS / Express):

```js
import baseConfig from "./base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    rules: {
      "no-console": "off",
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
];
```

---

## 4. Consuming Shared Config in Each Package

**`apps/web/package.json`**:

```json
{
  "name": "@my-monorepo/web",
  "devDependencies": {
    "@my-monorepo/eslint-config": "workspace:*"
  },
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

**`apps/web/eslint.config.js`**:

```js
import reactConfig from "@my-monorepo/eslint-config/react";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactConfig,
  {
    // App-specific overrides
    rules: {
      "no-console": "off",
    },
  },
];
```

**`apps/api/eslint.config.js`**:

```js
import nodeConfig from "@my-monorepo/eslint-config/node";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nodeConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
];
```

---

## 5. Shared Prettier Config

**`packages/eslint-config/.prettierrc.js`** (or root `.prettierrc`):

```js
/** @type {import("prettier").Config} */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
};
```

Reference it from each package's `package.json`:

```json
{
  "prettier": "@my-monorepo/eslint-config/.prettierrc.js"
}
```

Or simply use the root `.prettierrc` — Prettier walks up the directory tree automatically.

---

## 6. Root-Level Lint Orchestration

### Option A — Run lint recursively (pnpm)

```bash
# Lint all packages, fail-fast on first error
pnpm -r run lint

# Continue even if one package fails
pnpm -r run lint --no-bail
```

### Option B — Run lint from root with glob (single ESLint process)

Add a root `eslint.config.js` that targets all source:

```js
import reactConfig from "@my-monorepo/eslint-config/react";
import nodeConfig from "@my-monorepo/eslint-config/node";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    ...reactConfig[0],
  },
  {
    files: ["apps/api/**/*.ts"],
    ...nodeConfig[0],
  },
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
];
```

Root `package.json` script:

```json
{
  "scripts": {
    "lint": "eslint . --cache",
    "lint:fix": "eslint . --fix --cache"
  }
}
```

---

## 7. CI Integration

**.github/workflows/lint.yml** (GitHub Actions):

```yaml
name: Lint

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm -r run lint
```

For **Yarn**:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: yarn

- run: yarn install --immutable

- run: yarn workspaces foreach -A run lint
```

For **npm**:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm

- run: npm ci

- run: npm run lint --workspaces --if-present
```

---

## 8. Workspace Protocol Summary

| Manager | Internal package ref | Install dep to workspace    | Run in all workspaces            |
| ------- | -------------------- | --------------------------- | -------------------------------- |
| pnpm    | `workspace:*`        | `pnpm --filter <name> add`  | `pnpm -r run <script>`           |
| Yarn    | `workspace:*`        | `yarn workspace <name> add` | `yarn workspaces foreach -A run` |
| npm     | `*` (auto-resolved)  | `npm i --workspace=<path>`  | `npm run <script> --workspaces`  |

---

## 9. Common Pitfalls

- **Missing `private: true`** on root `package.json` — required for all workspace managers to prevent accidental publish of the root
- **Circular dependencies** between packages — use `madge` or Nx to detect them
- **Forgetting `--frozen-lockfile`/`--immutable`** in CI — always use locked installs in CI to ensure reproducibility
- **pnpm hoisting issues** — if a package can't resolve a peer dep, add `shamefully-hoist=true` to `.npmrc` as a last resort, or declare the dep explicitly
- **Shared config not exported** — ensure `exports` field in `package.json` covers all entry points; Node.js ESM requires explicit exports when `"type": "module"` is set
- **ESLint cache stale across packages** — use per-package `.eslintcache` files or disable cache in CI (`--no-cache`)
