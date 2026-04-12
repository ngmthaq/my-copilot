---
applyTo: "**/agent-feature-*.md"
---

# Feature Document Template

## When to Use

- Before planning any non-trivial feature or change, AI **must** ask the user's permission to create a feature documentation file.
- The feature doc is the **source of truth** that defines requirements and design upfront. All agents — developer, QA, DevOps, and code reviewer — must reference it throughout implementation.

## Location & Naming Convention

```
{features_directory}/<module>/agent-feature-<feature-name>.md
```

Examples:

- `{features_directory}/auth/agent-feature-login-api.md`
- `{features_directory}/auth/agent-feature-login-ui.md`
- `{features_directory}/auth/agent-feature-register-ui.md`
- `{features_directory}/auth/agent-feature-refresh-token-api.md`
- `{features_directory}/product/agent-feature-create-product-ui.md`
- `{features_directory}/product/agent-feature-list-products-api.md`
- `{features_directory}/infra/agent-feature-docker-setup.md`

## What to Ask the User

> "Before I plan, would you like me to create a feature doc at `{features_directory}/<module>/agent-feature-<feature-name>.md`? This captures the design and requirements upfront and becomes the source of truth for the developer, QA, and DevOps agents."

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

- `agent-plan-<do-something>-<datetime>` — link to the plan document created after this feature doc
```
