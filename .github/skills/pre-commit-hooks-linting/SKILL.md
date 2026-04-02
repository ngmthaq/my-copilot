---
name: pre-commit-hooks-linting
description: "Setting up pre-commit hooks for linting and formatting in JavaScript and TypeScript projects. Use when: running ESLint or Prettier automatically before commits; setting up Husky with lint-staged; configuring commitlint for commit message conventions; preventing bad code from reaching the repository; adding pre-push hooks for type checking. DO NOT USE FOR: full ESLint configuration (use eslint-rule-configuration skill); Prettier setup (use prettier-configuration skill); CI pipeline setup."
---

# Pre-Commit Hooks Linting Skill

## Overview

Pre-commit hooks run automated checks before a commit is accepted. This prevents malformed, unformatted, or lint-failing code from entering the repository. This skill covers **Husky** (hook runner), **lint-staged** (lint only changed files), and **commitlint** (commit message enforcement).

---

## 1. Tool Overview

| Tool            | Role                                                   |
| --------------- | ------------------------------------------------------ |
| **Husky**       | Installs and manages Git hooks as npm scripts          |
| **lint-staged** | Runs linters/formatters on only staged (changed) files |
| **commitlint**  | Validates commit messages against a convention         |

---

## 2. Installing Husky

```bash
# npm
npm install --save-dev husky
npx husky init

# pnpm
pnpm add -D husky
pnpm exec husky init

# Yarn
yarn add -D husky
yarn husky init
```

`husky init` creates a `.husky/` directory, adds a sample `pre-commit` hook, and adds a `prepare` script to `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

> The `prepare` script runs automatically after `npm install`, so new contributors get hooks automatically.

---

## 3. Installing and Configuring lint-staged

```bash
# npm
npm install --save-dev lint-staged

# pnpm
pnpm add -D lint-staged

# Yarn
yarn add -D lint-staged
```

### Configure in `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["prettier --write", "eslint --fix --max-warnings 0"],
    "*.{js,mjs,cjs}": ["prettier --write", "eslint --fix --max-warnings 0"],
    "*.vue": ["prettier --write", "eslint --fix --max-warnings 0"],
    "*.{json,md,yaml,yml,css,html}": ["prettier --write"]
  }
}
```

Or as a standalone `lint-staged.config.js`:

```js
/** @type {import("lint-staged").Config} */
export default {
  "*.{ts,tsx}": ["prettier --write", "eslint --fix --max-warnings 0"],
  "*.{js,mjs,cjs}": ["prettier --write", "eslint --fix --max-warnings 0"],
  "*.vue": ["prettier --write", "eslint --fix --max-warnings 0"],
  "*.{json,md,yaml,yml,css,html}": ["prettier --write"],
};
```

**Order matters**: always run Prettier before ESLint to avoid ESLint reformatting what Prettier just wrote.

---

## 4. Connecting lint-staged to Husky

Edit `.husky/pre-commit`:

```sh
npx lint-staged
```

Or for pnpm:

```sh
pnpm exec lint-staged
```

The full `.husky/pre-commit` file:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

> Git will abort the commit if lint-staged exits with a non-zero code (i.e., any lint error or Prettier diff that couldn't be auto-fixed).

---

## 5. Pre-push Hook — Type Check

Run TypeScript type checking on push (slower, not suitable for pre-commit):

`.husky/pre-push`:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx tsc --noEmit
```

Or for a monorepo:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm -r exec tsc --noEmit
```

---

## 6. commitlint — Enforce Commit Message Convention

Commitlint validates that commit messages follow a defined format. The most common is [Conventional Commits](https://www.conventionalcommits.org/).

### Install

```bash
# npm
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# pnpm
pnpm add -D @commitlint/cli @commitlint/config-conventional

# Yarn
yarn add -D @commitlint/cli @commitlint/config-conventional
```

### Configure — `commitlint.config.js`

```js
/** @type {import("@commitlint/types").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type must be one of the listed values
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "revert",
        "ci",
      ],
    ],
    // Subject must not end with a period
    "subject-full-stop": [2, "never", "."],
    // Max header length
    "header-max-length": [2, "always", 100],
    // Body must have a blank line before it
    "body-leading-blank": [2, "always"],
    // Footer must have a blank line before it
    "footer-leading-blank": [1, "always"],
  },
};
```

### Hook — `.husky/commit-msg`

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

### Valid commit message examples

```
feat: add user authentication
fix(auth): resolve token refresh race condition
docs: update README with setup steps
refactor(api): extract pagination into shared helper
chore: upgrade eslint to v9
```

### Invalid (rejected by commitlint)

```
added new feature          # no type
feat: Added new feature.   # capital first letter + trailing period
WIP                        # no type, no subject
```

---

## 7. Complete Setup Summary

After following all steps, your hooks directory should look like:

```
.husky/
├── _/
│   └── husky.sh          # managed by Husky, do not edit
├── pre-commit             # runs lint-staged
├── pre-push               # runs tsc --noEmit
└── commit-msg             # runs commitlint
```

And `package.json`:

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint --cache --cache-strategy content .",
    "lint:fix": "eslint --cache --cache-strategy content --fix .",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["prettier --write", "eslint --fix --max-warnings 0"],
    "*.{js,mjs,cjs}": ["prettier --write", "eslint --fix --max-warnings 0"],
    "*.vue": ["prettier --write", "eslint --fix --max-warnings 0"],
    "*.{json,md,yaml,yml,css,html}": ["prettier --write"]
  }
}
```

---

## 8. Monorepo Setup

In a monorepo (pnpm workspaces), run lint-staged from the root — it will match files across all packages using relative paths.

**Root `.husky/pre-commit`**:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
```

**Root `lint-staged.config.js`**:

```js
/** @type {import("lint-staged").Config} */
export default {
  "**/*.{ts,tsx}": ["prettier --write", "eslint --fix --max-warnings 0"],
  "**/*.vue": ["prettier --write", "eslint --fix --max-warnings 0"],
  "**/*.{js,mjs,cjs}": ["prettier --write", "eslint --fix --max-warnings 0"],
  "**/*.{json,md,yaml,yml,css,html}": ["prettier --write"],
};
```

ESLint will load the nearest `eslint.config.js` for each matched file, so per-package configs are respected automatically.

---

## 9. Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit hook (use sparingly — commits unverified code)
git commit --no-verify -m "chore: emergency fix"

# Skip pre-push hook
git push --no-verify
```

> **Policy**: only bypass hooks for emergency hotfixes. Always re-run lint and format checks manually after bypassing and fix before the next commit.

---

## 10. Common Pitfalls

- **`prepare` script not running** — On CI, `npm ci` skips optional scripts. If CI doesn't need hooks, this is fine. Add `HUSKY=0 npm ci` to skip Husky on CI explicitly.
- **lint-staged not finding config** — Keep `lint-staged` config in `package.json` or a root `lint-staged.config.js`; do not put it in a subdirectory package.
- **ESLint cache stale after hooks** — lint-staged runs ESLint on staged files only; the cache is still valid for unstaged files. No action needed.
- **Commitlint not running** — Ensure the hook file is named exactly `commit-msg` (not `commit_msg`) and is executable (`chmod +x .husky/commit-msg`).
- **Windows line endings in hook files** — Hook files must use LF. Configure: `git config core.autocrlf input`. Add `/.husky` to `.gitattributes`: `/.husky/* text eol=lf`.
