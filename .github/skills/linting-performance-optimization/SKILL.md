---
name: linting-performance-optimization
description: "ESLint and linting pipeline performance optimization. Use when: ESLint is slow on large codebases; lint times are unacceptable in CI or pre-commit hooks; reducing the number of files ESLint parses; disabling expensive type-checked rules selectively; caching lint results; running lint in parallel; profiling which rules are slowest; optimizing monorepo lint setup. DO NOT USE FOR: configuring ESLint rules from scratch (use eslint-rule-configuration skill); setting up pre-commit hooks (use pre-commit-hooks-linting skill); general ESLint plugin integration (use eslint-plugin-integration skill)."
---

# Linting Performance Optimization Skill

## Overview

This skill covers techniques to measure and reduce ESLint run times — from caching and file scoping to disabling expensive type-aware rules, parallelizing across CPU cores, and trimming the build context in CI pipelines.

---

## 1. Measure Before Optimizing

### Time a lint run

```bash
# Basic timing:
time npx eslint .

# Verbose output showing per-file timing:
TIMING=1 npx eslint .

# Show top 10 slowest rules:
TIMING=10 npx eslint .
```

`TIMING=1` outputs a table like:

```
Rule                                    | Time (ms) | Relative
----------------------------------------|-----------|---------
@typescript-eslint/no-floating-promises |   3200    |  42.1%
import/no-cycle                         |   1800    |  23.7%
@typescript-eslint/await-thenable       |   900     |  11.8%
```

Use this to identify which rules dominate lint time before making changes.

---

## 2. Enable ESLint Caching

Caching is the single biggest win for repeated lint runs. ESLint skips files whose content (and config) have not changed since the last run.

```bash
# Enable cache (stored in .eslintcache by default):
npx eslint --cache .

# Specify cache location:
npx eslint --cache --cache-location .cache/.eslintcache .

# Use content-based cache strategy (more reliable than default mtime):
npx eslint --cache --cache-strategy content .
```

### Add to `package.json` scripts

```json
{
  "scripts": {
    "lint": "eslint --cache --cache-strategy content .",
    "lint:fix": "eslint --cache --cache-strategy content --fix .",
    "lint:ci": "eslint --max-warnings 0 ." // no cache in CI (fresh run)
  }
}
```

### Commit `.eslintcache` to `.gitignore`

```gitignore
.eslintcache
.cache/
```

### Persist cache in CI (GitHub Actions)

```yaml
- name: Cache ESLint
  uses: actions/cache@v4
  with:
    path: .cache/.eslintcache
    key: eslint-${{ runner.os }}-${{ hashFiles('eslint.config.js', 'package-lock.json') }}
    restore-keys: eslint-${{ runner.os }}-

- name: Lint
  run: npx eslint --cache --cache-location .cache/.eslintcache --cache-strategy content .
```

---

## 3. Scope Files Precisely

Only lint files that ESLint needs to check. Avoid linting generated files, build outputs, and third-party code.

### Comprehensive `.eslintignore` equivalent (flat config)

```js
// eslint.config.js
export default [
  {
    ignores: [
      // Build outputs
      "dist/**",
      "build/**",
      ".next/**",
      ".nuxt/**",
      "out/**",

      // Dependencies
      "node_modules/**",

      // Coverage and test outputs
      "coverage/**",
      ".nyc_output/**",

      // Generated files
      "**/*.generated.ts",
      "**/*.generated.js",
      "src/graphql/__generated__/**",
      "prisma/migrations/**",

      // Config and lock files (usually no value in linting)
      "**/*.min.js",
      "**/*.min.css",
    ],
  },
];
```

### Lint only changed files in CI (pull request)

```bash
# Get changed files vs base branch:
CHANGED=$(git diff --name-only origin/main...HEAD | grep -E '\.(js|ts|tsx|vue)$' | tr '\n' ' ')

if [ -n "$CHANGED" ]; then
  npx eslint $CHANGED
fi
```

### GitHub Actions — lint only changed files

```yaml
- name: Get changed files
  id: changed
  uses: tj-actions/changed-files@v44
  with:
    files: |
      **/*.{js,ts,tsx,vue}

- name: Lint changed files
  if: steps.changed.outputs.any_changed == 'true'
  run: npx eslint ${{ steps.changed.outputs.all_changed_files }}
```

---

## 4. Avoid Expensive Type-Checked Rules in Hot Paths

Type-aware rules (those requiring `project: true` and the TypeScript compiler) are 5–10× slower than syntax-only rules because they compile the full TypeScript project.

### Identify type-checked rules

Type-checked rules are in `@typescript-eslint/configs.recommendedTypeChecked` and include:

- `@typescript-eslint/no-floating-promises`
- `@typescript-eslint/await-thenable`
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/require-await`

### Only enable type-checked rules where needed

```js
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Syntax-only rules (fast) — applied everywhere:
  ...tseslint.configs.recommended,

  // Type-checked rules (slow) — applied only to src/, not tests or scripts:
  {
    files: ["src/**/*.ts"], // limit scope
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Disable type-checked rules for config files and scripts:
  {
    files: ["*.config.{js,ts}", "scripts/**"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
```

### Use a separate tsconfig for linting

```json
// tsconfig.lint.json — faster because it only includes src files
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

```js
languageOptions: {
  parserOptions: {
    project: './tsconfig.lint.json',
  },
},
```

---

## 5. Run ESLint in Parallel

### `eslint-parallel` / `jest --runInBand` equivalent

```bash
npm install --save-dev eslint-parallel
```

```json
{
  "scripts": {
    "lint": "eslint-parallel src/ tests/ scripts/"
  }
}
```

### Split lint across worker threads (ESLint v9 built-in)

ESLint v9 introduced the `--concurrency` flag:

```bash
npx eslint --concurrency 4 .
```

### Manual directory splitting with `&` and `wait`

```bash
# Lint directories in parallel using shell background jobs:
npx eslint src/ &
npx eslint tests/ &
npx eslint scripts/ &
wait
```

### `turbo` (monorepo task runner)

```json
// turbo.json
{
  "tasks": {
    "lint": {
      "inputs": ["src/**", "eslint.config.js"],
      "outputs": []
    }
  }
}
```

```bash
turbo run lint --parallel
```

---

## 6. Disable Slow Rules Selectively

When you cannot avoid running type-checked rules everywhere, disable the slowest individual rules rather than all type-checked rules:

```js
{
  rules: {
    // Disable the slowest rules identified by TIMING=10:
    "import/no-cycle": "off",                    // very slow in large projects
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-return": "off",

    // Keep only the most valuable type-checked rules:
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
  },
}
```

---

## 7. Optimize `import/no-cycle`

`import/no-cycle` is one of the slowest rules because it performs full dependency graph traversal. Options:

### Limit depth to reduce traversal time

```js
{
  rules: {
    "import/no-cycle": ["warn", { maxDepth: 3 }],  // default is Infinity
  },
}
```

### Only run on CI, not locally

```js
// eslint.config.js
const isCi = process.env.CI === "true";

export default [
  {
    rules: {
      "import/no-cycle": isCi ? "warn" : "off",
    },
  },
];
```

---

## 8. Use `eslint-config-prettier` — Not `eslint-plugin-prettier`

`eslint-plugin-prettier` runs Prettier on every file as an ESLint rule, doubling lint time (ESLint + Prettier on each file). Instead:

```bash
npm install --save-dev eslint-config-prettier
```

```js
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // ...other configs,
  eslintConfigPrettier, // only disables conflicting rules; no Prettier execution
];
```

Then run Prettier separately:

```json
{
  "scripts": {
    "lint": "eslint --cache .",
    "format:check": "prettier --check .",
    "format": "prettier --write ."
  }
}
```

---

## 9. Monorepo Lint Optimization

### Shared config package

Extract ESLint config into a shared package to avoid duplicating config parsing:

```
packages/
  eslint-config/
    index.js          ← shared flat config
    package.json
  api/
    eslint.config.js  ← imports from eslint-config
  web/
    eslint.config.js  ← imports from eslint-config
```

```js
// packages/eslint-config/index.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [js.configs.recommended, ...tseslint.configs.recommended];
```

```js
// packages/api/eslint.config.js
import sharedConfig from "@my-org/eslint-config";

export default [
  ...sharedConfig,
  { rules: { "no-console": "off" } }, // package-specific overrides
];
```

### Run lint only for affected packages (Nx / Turborepo)

```bash
# Nx: only lint packages affected by recent changes
nx affected --target=lint

# Turborepo: only lint packages with changed inputs
turbo run lint --filter="[origin/main]"
```

---

## 10. Profiling and Benchmarking

### Profile with `TIMING`

```bash
# Show all rules with timing data:
TIMING=1 npx eslint src/ 2>&1 | sort -t'|' -k2 -rn | head -20
```

### Benchmark configuration changes

```bash
# Before:
time npx eslint --no-cache src/

# After (compare):
time npx eslint --no-cache src/
```

### Use `hyperfine` for accurate benchmarking

```bash
brew install hyperfine

hyperfine --warmup 2 \
  'npx eslint --no-cache src/' \
  'npx eslint --no-cache --rule "@typescript-eslint/no-floating-promises: off" src/'
```

---

## 11. CI Pipeline Optimization

### Full CI lint strategy

```yaml
# .github/workflows/lint.yml
name: Lint

on:
  push:
    branches: [main]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      # Cache ESLint results between runs
      - uses: actions/cache@v4
        with:
          path: .cache/.eslintcache
          key: eslint-${{ runner.os }}-${{ hashFiles('eslint.config.js', 'package-lock.json') }}
          restore-keys: eslint-${{ runner.os }}-

      # On PRs: lint only changed files
      - name: Get changed files
        if: github.event_name == 'pull_request'
        id: changed
        uses: tj-actions/changed-files@v44
        with:
          files: "**/*.{js,ts,tsx,vue}"

      - name: Lint changed files (PR)
        if: github.event_name == 'pull_request' && steps.changed.outputs.any_changed == 'true'
        run: |
          npx eslint \
            --cache \
            --cache-location .cache/.eslintcache \
            --cache-strategy content \
            --max-warnings 0 \
            ${{ steps.changed.outputs.all_changed_files }}

      # On push to main: lint everything
      - name: Lint all files (push)
        if: github.event_name == 'push'
        run: |
          npx eslint \
            --cache \
            --cache-location .cache/.eslintcache \
            --cache-strategy content \
            --max-warnings 0 \
            .
```

---

## 12. Optimization Checklist

- [ ] `TIMING=1 npx eslint .` run to identify slowest rules before changes
- [ ] `--cache --cache-strategy content` enabled in local lint script
- [ ] ESLint cache persisted in CI with `actions/cache`
- [ ] `ignores` covers all build outputs, generated files, and `node_modules`
- [ ] Type-checked rules (`project: true`) scoped to `src/**` only — not tests/scripts
- [ ] Separate `tsconfig.lint.json` used to minimize TypeScript compilation scope
- [ ] `import/no-cycle` either disabled or depth-limited (`maxDepth: 3`)
- [ ] `eslint-config-prettier` used instead of `eslint-plugin-prettier`
- [ ] Prettier runs as a separate script, not as an ESLint rule
- [ ] PRs lint only changed files; `main` branch lints everything
- [ ] Monorepo uses shared config package + affected-only task runner

---

## 13. Quick Reference

| Optimization                    | Technique                                      |
| ------------------------------- | ---------------------------------------------- |
| Identify slow rules             | `TIMING=1 npx eslint .`                        |
| Enable cache                    | `eslint --cache --cache-strategy content .`    |
| Persist cache in CI             | `actions/cache` on `.cache/.eslintcache`       |
| Skip generated files            | `ignores` in flat config                       |
| Lint only changed files         | `git diff` + changed-files action              |
| Avoid TS compilation everywhere | Scope `project: true` to `src/**` only         |
| Faster TS compilation           | `tsconfig.lint.json` with minimal `include`    |
| Disable slowest rule            | `'import/no-cycle': 'off'`                     |
| Limit cycle depth               | `'import/no-cycle': ['warn', { maxDepth: 3 }]` |
| Avoid Prettier ESLint rule      | Use `eslint-config-prettier` instead           |
| Parallel lint                   | `eslint --concurrency 4 .` (ESLint v9)         |
| Monorepo affected only          | `nx affected --target=lint`                    |
