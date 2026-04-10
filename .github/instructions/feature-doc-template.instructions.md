---
applyTo: "**/.github/docs/features/**/*.md"
---

# Feature Document Template

## When to Use

- Before planning any non-trivial feature or change, AI **must** ask the user's permission to create a feature documentation file.
- The feature doc is the **source of truth** that defines requirements and design upfront. All agents — developer, QA, DevOps, and code reviewer — must reference it throughout implementation.

## Location & Naming Convention

```
.github/docs/features/<module>/<feature-name>.md
```

Examples:

- `.github/docs/features/auth/login-api.md`
- `.github/docs/features/auth/login-ui.md`
- `.github/docs/features/auth/register-ui.md`
- `.github/docs/features/auth/refresh-token-api.md`
- `.github/docs/features/product/create-product-ui.md`
- `.github/docs/features/product/list-products-api.md`
- `.github/docs/features/infra/docker-setup.md`

## What to Ask the User

> "Before I plan, would you like me to create a feature doc at `.github/docs/features/<module>/<feature-name>.md`? This captures the design and requirements upfront and becomes the source of truth for the developer, QA, and DevOps agents."

## Rules

- Only create the doc file after the user explicitly approves.

## Template

```markdown
# <Feature Name>

## Overview

<What the feature does and the problem it solves.>

## Architecture

<Key files, modules, and their planned responsibilities. Update as implementation progresses.>

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

<Code snippets or curl commands showing expected usage.>

## Known Limitations

<Any constraints, trade-offs, or known issues.>

## Related Plans

- `plan-<do-something>-<datetime>` — link to the plan document created after this feature doc
```
