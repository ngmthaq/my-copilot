---
name: git-hooks-automation
description: "Git hooks for automating workflows. Use when: setting up pre-commit/pre-push hooks, using Husky, lint-staged, commit message validation, automating checks before commit/push. DO NOT USE FOR: CI/CD pipelines, commit message format rules (use git-commit-conventions)."
---

# Git Hooks Automation Skill

## Overview

Covers Git hooks for automating code quality checks, linting, testing, and commit validation.

---

## 1. Git Hooks Overview

Hooks are scripts in `.git/hooks/` that run automatically at specific Git events.

### Common hooks

| Hook                 | When it runs                         | Use case                       |
| -------------------- | ------------------------------------ | ------------------------------ |
| `pre-commit`         | Before commit is created             | Lint, format, type-check       |
| `prepare-commit-msg` | After default message, before editor | Auto-populate message          |
| `commit-msg`         | After message is entered             | Validate commit message format |
| `pre-push`           | Before push to remote                | Run tests                      |
| `post-merge`         | After merge completes                | Install dependencies           |
| `post-checkout`      | After checkout/switch                | Rebuild, install deps          |

---

## 2. Manual Hook Setup

```bash
# Create a pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
npm run lint
EOF
chmod +x .git/hooks/pre-commit
```

> Hooks in `.git/hooks/` are not tracked by Git. Use Husky or a shared hooks directory for team use.

---

## 3. Husky (Recommended for Node.js Projects)

### Setup

```bash
npm install --save-dev husky
npx husky init
```

This creates a `.husky/` directory and adds a `prepare` script to `package.json`.

### Add hooks

```bash
# Pre-commit hook
echo "npm run lint" > .husky/pre-commit

# Pre-push hook
echo "npm test" > .husky/pre-push

# Commit message validation
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

---

## 4. lint-staged (Run Linters on Staged Files Only)

```bash
npm install --save-dev lint-staged
```

### Configuration in `package.json`

```json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"],
    "*.css": ["stylelint --fix"]
  }
}
```

### Wire with Husky

```bash
echo "npx lint-staged" > .husky/pre-commit
```

---

## 5. commitlint (Validate Commit Messages)

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### Configuration (`commitlint.config.js`)

```js
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
```

### Wire with Husky

```bash
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

---

## 6. Shared Hooks Directory (Without Husky)

```bash
# Set a custom hooks directory
git config core.hooksPath .githooks

# Create hooks in the tracked directory
mkdir .githooks
cat > .githooks/pre-commit << 'EOF'
#!/bin/sh
npm run lint
EOF
chmod +x .githooks/pre-commit
```

---

## 7. Common Hook Recipes

### Pre-commit: prevent debug statements

```bash
#!/bin/sh
if grep -rn 'console\.log\|debugger' --include="*.ts" --include="*.js" src/; then
  echo "Error: Remove debug statements before committing"
  exit 1
fi
```

### Pre-push: run tests

```bash
#!/bin/sh
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Push aborted."
  exit 1
fi
```

### Post-merge: auto-install dependencies

```bash
#!/bin/sh
changed_files="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"
if echo "$changed_files" | grep -q "package-lock.json"; then
  echo "Dependencies changed. Running npm install..."
  npm install
fi
```

---

## 8. Bypassing Hooks (Use Sparingly)

```bash
git commit --no-verify -m "emergency fix"
git push --no-verify
```

> Only bypass in genuine emergencies. Fix the underlying issue instead.

---

## 9. Quick Reference

| Tool         | Purpose                  | Setup command                         |
| ------------ | ------------------------ | ------------------------------------- |
| Husky        | Manage Git hooks         | `npx husky init`                      |
| lint-staged  | Lint only staged files   | `npm i -D lint-staged`                |
| commitlint   | Validate commit messages | `npm i -D @commitlint/cli`            |
| Custom hooks | Manual hook scripts      | `git config core.hooksPath .githooks` |
