# GitHub Copilot Workspace Instructions

## 1. Framework-Specific Instructions

This workspace includes framework-specific instruction files that define patterns, conventions, and best practices. Load the relevant file(s) before writing any code:

| Framework / Technology   | Instruction File                                 |
| ------------------------ | ------------------------------------------------ |
| Express.js               | `.github/instructions/expressjs.instructions.md` |
| NestJS                   | `.github/instructions/nestjs.instructions.md`    |
| React.js                 | `.github/instructions/reactjs.instructions.md`   |
| Vue.js (Composition API) | `.github/instructions/vuejs.instructions.md`     |

**Rule:** Before writing any code or making architectural decisions, identify which framework(s) are involved and load the corresponding instruction file(s) using `read_file`. Follow every pattern and convention defined in those files.

---

## 2. Requirement Clarification — Never Assume

Before starting any task, AI **must** ask the user clarifying questions to fully understand the requirement. Do **not** assume any detail that has not been explicitly stated.

Guiding principles:

- Ask about scope, constraints, and expected behavior upfront.
- If the task is ambiguous, surface the ambiguity and ask the user to resolve it.
- Ask about technology choices (framework, library, database) if they are not already clear from the context.
- Ask about edge cases and error handling expectations when relevant.
- Only proceed with implementation after the user has answered all critical questions.

Use the `vscode_askQuestions` tool to collect answers in a structured way.

---

## 3. Planning — Always Create a Plan First

Before implementing any non-trivial feature or change, AI **must** ask the user's permission to create a plan document.

### Plan Location & Naming Convention

```
.docs/plans/plan-<do-something>-<YYYY-MM-DD-HHmm>.md
```

Examples:

- `.docs/plans/plan-add-user-authentication-2026-04-05-1430.md`
- `.docs/plans/plan-refactor-product-module-2026-04-05-0900.md`
- `.docs/plans/plan-setup-docker-compose-2026-04-05-1615.md`

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

## 4. Feature Documentation — Always Create Docs After Implementation

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

## 5. General Workflow Summary

For every task, follow this order:

1. **Load** the relevant framework instruction file(s).
2. **Ask** clarifying questions — never assume requirements.
3. **Propose** a plan document and wait for user approval before creating it.
4. **Implement** following the loaded skill/instruction patterns.
5. **Update** the plan checkboxes as steps complete.
6. **Ask** the user to approve creating a feature doc once the feature is done.
