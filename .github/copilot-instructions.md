# GitHub Copilot Workspace Instructions

## 1. Framework-Specific Skills

This workspace uses skill files as the authoritative source of patterns, conventions, and best practices. Each framework has a `SKILL.md` entry point that maps to focused sub-skill files. Load the relevant `SKILL.md` before writing any code:

| Framework / Technology   | SKILL.md Entry Point                            |
| ------------------------ | ----------------------------------------------- |
| Express.js               | `.github/skills/expressjs/SKILL.md`             |
| NestJS                   | `.github/skills/nestjs/SKILL.md`                |
| React.js                 | `.github/skills/reactjs/SKILL.md`               |
| Vue.js (Composition API) | `.github/skills/vuejs-composition-api/SKILL.md` |
| Flutter                  | `.github/skills/flutter/SKILL.md`               |
| Dart                     | `.github/skills/dart/SKILL.md`                  |
| Docker                   | `.github/skills/docker/SKILL.md`                |
| Nginx                    | `.github/skills/nginx/SKILL.md`                 |
| Prisma                   | `.github/skills/prisma/SKILL.md`                |
| TypeORM                  | `.github/skills/typeorm/SKILL.md`               |
| TypeScript               | `.github/skills/typescript/SKILL.md`            |
| GraphQL                  | `.github/skills/graphql/SKILL.md`               |
| REST API                 | `.github/skills/restapi/SKILL.md`               |

**Rule:** Before writing any code or making architectural decisions, identify which framework(s) are involved and load the corresponding `SKILL.md` using `read_file`. Each `SKILL.md` contains a sub-skills table — load only the specific sub-skill files relevant to the task at hand.

---

## 2. Coding Convention Instructions

These instruction files define formatting rules, naming conventions, and style standards. They apply automatically to matching files via the `applyTo` glob, but **agents must also load them explicitly with `read_file` before writing or reviewing code**.

| Instruction File                                                 | Covers                                                    |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| `.github/instructions/js-coding-convention.instructions.md`      | Formatting, naming, imports, TypeScript, ESLint, Prettier |
| `.github/instructions/flutter-coding-convention.instructions.md` | Formatting, naming, imports, widget conventions, Dart     |

**Rule:** When writing, editing, or reviewing code in any of the above file types, load the corresponding instruction file using `read_file` and follow its conventions strictly.

---

## 3. Requirement Clarification — Never Assume

Before starting any task, AI **must** ask the user clarifying questions to fully understand the requirement. Do **not** assume any detail that has not been explicitly stated.

Guiding principles:

- Ask about scope, constraints, and expected behavior upfront.
- If the task is ambiguous, surface the ambiguity and ask the user to resolve it.
- Ask about technology choices (framework, library, database) if they are not already clear from the context.
- Ask about edge cases and error handling expectations when relevant.
- Only proceed with implementation after the user has answered all critical questions.

Use the `vscode_askQuestions` tool to collect answers in a structured way.

---

## 4. Planning — Always Create a Plan First

Before implementing any non-trivial feature or change, AI **must** ask the user's permission to create a plan document.

### Plan Location & Naming Convention

```
.docs/plans/plan-<do-something>-<YYYY-MM-DD-HHmm>.md
```

Examples:

- `.docs/plans/plan-add-user-authentication-2026-04-05-1430.md`
- `.docs/plans/plan-refactor-product-module-2026-04-05-0900.md`
- `.docs/plans/plan-setup-docker-compose-2026-04-05-1615.md`
- `.docs/plans/plan-fix-cors-in-user-creation-form-2026-04-05-1715.md`
- `.docs/plans/plan-fix-add-user-authentication-reviewer-comments-2026-04-05-1715.md`

### What to ask the user

> "Before I start, would you like me to create a plan document at `.docs/plans/plan-<do-something>-<datetime>.md` so we can track progress together?"

### Plan Document Structure

A plan document must follow this template:

```
# <Title>

## Description

<Short description of what is being built or changed.>

## Purpose

<Why this change is needed, additional context, constraints, or background information.>

## Todo List

- [ ] Step 1 — ...
- [ ] Step 2 — ...
- [ ] Step 3 — ...
```

Only create the plan file after the user explicitly approves. Update the checkboxes (`[ ]` → `[x]`) as each step is completed.

---

## 5. Feature Documentation — Always Create Docs After Implementation

After completing any feature, AI **must** ask the user's permission to create a feature documentation file.

### Doc Location & Naming Convention

```
.docs/features/<module>/<feature-name>.md
```

Examples:

- `.docs/features/auth/login.md`
- `.docs/features/auth/register.md`
- `.docs/features/auth/refresh-token.md`
- `.docs/features/product/create-product.md`
- `.docs/features/product/list-products.md`
- `.docs/features/infra/docker-setup.md`

### What to ask the user

> "The feature is complete. Would you like me to create a feature doc at `.docs/features/<feature-name>.md` to document what was built? This helps provide context for future development."

### Feature Doc Structure

A feature document must follow this template:

```
# <Feature Name>

## Overview

<What the feature does and the problem it solves.>

## Architecture

<Key files, modules, and their responsibilities.>

| File / Module  | Responsibility |
| -------------- | -------------- |
| `path/to/file` | ...            |

## API / Interface

<Endpoints, props, events, or public contracts. Remove this section if not applicable.>

| Method | Path     | Description |
| ------ | -------- | ----------- |
| GET    | /example | ...         |

## Configuration

<Environment variables, config options, or feature flags required.>

| Variable  | Type   | Default | Description |
| --------- | ------ | ------- | ----------- |
| `ENV_VAR` | string | —       | ...         |

## Usage Examples

<Code snippets or curl commands showing normal usage.>

curl -X POST http://localhost:3000/example \
 -H "Content-Type: application/json" \
 -d '{ "key": "value" }'

## Known Limitations

<Any constraints, trade-offs, or known issues.>

## Related Plans

- `plan-<do-something>-<datetime>` — link to the plan document in `.docs/plans/`

```

Only create the doc file after the user explicitly approves.

---

## 6. General Workflow Summary

For every task, follow this order:

1. **Load** the relevant framework `SKILL.md` and any needed sub-skill files.
2. **Load** the relevant coding convention instruction file using `read_file` before writing or reviewing code.
3. **Ask** clarifying questions — never assume requirements.
4. **Propose** a plan document and wait for user approval before creating it.
5. **Implement** following the loaded skill/instruction patterns.
6. **Update** the plan checkboxes as steps complete.
7. **Ask** the user to approve creating a feature doc once the feature is done.
