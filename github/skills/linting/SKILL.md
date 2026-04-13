---
name: linting
description: "Unified linting skill index — covers ESLint rule configuration, custom rule authoring, third-party plugin integration, Prettier setup, Prettier/ESLint conflict resolution, pre-commit hooks with Husky and lint-staged, monorepo linting structure, and linting pipeline performance optimization. Use this as the entry point; it delegates to focused sub-skill files for each domain. Note: code formatting standards (naming, indentation, quotes, imports) are defined in `.github/instructions/js-coding-convention.instructions.md` and apply automatically."
---

# Linting Skill

## Sub-Skills Reference

> **Code formatting standards** (naming conventions, indentation, quotes, import order, TypeScript rules) are defined as an instruction file at `.github/instructions/js-coding-convention.instructions.md`. This file applies automatically to all code files via `applyTo` — load it with `read_file` when you need to enforce or review style rules.

| Domain                        | File                                                             | When to use                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint Rule Configuration     | [eslint-rule-configuration.md](eslint-rule-configuration.md)     | ESLint rule configuration and flat config setup for JavaScript and TypeScript projects. Use when: setting up ESLint from scratch; configuring rule severity (error/warn/off); extending shared configs; ignoring files or directories; configuring language options and globals; setting up eslint.config.js with flat config format; migrating from .eslintrc to flat config; enabling ECMAScript version or module settings; running ESLint in CLI or scripts.             |
| ESLint Custom Rules           | [eslint-custom-rules.md](eslint-custom-rules.md)                 | Writing custom ESLint rules and rule selectors for JavaScript and TypeScript projects. Use when: creating a project-specific lint rule; enforcing a coding convention not covered by existing plugins; writing AST-based rules with node visitors; adding fixers to auto-correct violations; testing custom rules with RuleTester; publishing rules as a local or npm plugin.                                                                                                |
| ESLint Plugin Integration     | [eslint-plugin-integration.md](eslint-plugin-integration.md)     | Integrating third-party ESLint plugins into JavaScript and TypeScript projects. Use when: installing and configuring ESLint plugins; setting up eslint-plugin-react, eslint-plugin-vue, @typescript-eslint, eslint-plugin-import, eslint-plugin-unicorn, eslint-plugin-sonarjs, eslint-plugin-security, eslint-plugin-prettier, eslint-plugin-n (Node.js), eslint-plugin-jsx-a11y; enabling plugin rule sets; troubleshooting plugin conflicts or peer dependency errors.    |
| Prettier Configuration        | [prettier-configuration.md](prettier-configuration.md)           | Prettier configuration and setup for JavaScript, TypeScript, React, Vue, NestJS, and Express projects. Use when: configuring Prettier options (semi, quotes, trailing comma, print width); choosing a config file format (.prettierrc, prettier.config.js); setting per-language overrides; ignoring files with .prettierignore; setting up format-on-save in VS Code; running Prettier checks in CI; sharing a single Prettier config across a monorepo.                    |
| Prettier + ESLint Integration | [prettier-eslint-integration.md](prettier-eslint-integration.md) | Integrating Prettier with ESLint to avoid rule conflicts and run both tools correctly. Use when: Prettier and ESLint style rules conflict; setting up eslint-config-prettier; deciding whether to use eslint-plugin-prettier; running Prettier and ESLint as separate scripts; configuring format-on-save alongside ESLint fix; integrating both tools in CI.                                                                                                                |
| Pre-Commit Hooks              | [pre-commit-hooks.md](pre-commit-hooks.md)                       | Setting up pre-commit hooks for linting and formatting in JavaScript and TypeScript projects. Use when: running ESLint or Prettier automatically before commits; setting up Husky with lint-staged; configuring commitlint for commit message conventions; preventing bad code from reaching the repository; adding pre-push hooks for type checking.                                                                                                                        |
| Monorepo Linting Setup        | [monorepo-setup.md](monorepo-setup.md)                           | Monorepo workspace structure and linting setup using pnpm workspaces, Yarn workspaces, or npm workspaces. Use when: setting up a monorepo from scratch; configuring workspace protocols (pnpm/yarn/npm); sharing ESLint or Prettier configs across packages; running lint across all packages; configuring root-level vs per-package lint config; structuring apps/ and packages/ directories; using shared internal packages for configs; running lint in CI for monorepos. |
| Performance Optimization      | [performance-optimization.md](performance-optimization.md)       | ESLint and linting pipeline performance optimization. Use when: ESLint is slow on large codebases; lint times are unacceptable in CI or pre-commit hooks; reducing the number of files ESLint parses; disabling expensive type-checked rules selectively; caching lint results; running lint in parallel; profiling which rules are slowest; optimizing monorepo lint setup.                                                                                                 |

---

## Quick Decision Guide

```
What is your goal?
│
├── Apply consistent code style (indentation, quotes, naming, imports)?
│   └── → .github/instructions/js-coding-convention.instructions.md  (instruction file, not a skill)
│
├── Set up ESLint from scratch or configure rules?
│   └── → eslint-rule-configuration.md
│
├── Integrate a third-party ESLint plugin (React, Vue, TypeScript, etc.)?
│   └── → eslint-plugin-integration.md
│
├── Write a custom project-specific ESLint rule?
│   └── → eslint-custom-rules.md
│
├── Configure Prettier (options, file formats, .prettierignore)?
│   └── → prettier-configuration.md
│
├── Prevent conflicts between Prettier and ESLint?
│   └── → prettier-eslint-integration.md
│
├── Automate linting / formatting before git commits?
│   └── → pre-commit-hooks.md
│
├── Set up linting across a monorepo (pnpm/Yarn/npm workspaces)?
│   └── → monorepo-setup.md
│
└── ESLint is too slow in CI or locally?
    └── → performance-optimization.md
```

---

## How to Use

1. **Identify the goal** — use the Quick Decision Guide or Sub-Skills Reference table above to find the right sub-skill for your task.
2. **Load the sub-skill file** — use `read_file` to load the relevant `.md` file in this folder (e.g., `eslint-rule-configuration.md`).
3. **Follow its patterns** — each sub-skill contains step-by-step instructions, code examples, and checklists specific to its domain.
4. **Load multiple sub-skills when the task spans domains** — for example, setting up full ESLint + Prettier + pre-commit hooks in a monorepo would require loading `eslint-rule-configuration.md`, `prettier-eslint-integration.md`, `pre-commit-hooks.md`, and `monorepo-setup.md` together.

> Sub-skills reference each other where relevant. Check the "DO NOT USE FOR" section in each sub-skill to confirm you're in the right file before proceeding.
