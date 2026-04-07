---
applyTo: "**/.github/.docs/plans/plan-*.md"
---

# Plan Document Template

## When to Use

- After the feature doc is approved and created, AI **must** ask the user's permission to create a plan document.
- The plan must be grounded in the feature doc and reference it.

## Location & Naming Convention

```
.github/.docs/plans/plan-<do-something>-<YYYY-MM-DD-HHmm>.md
```

Examples:

- `.github/.docs/plans/plan-add-user-authentication-2026-04-05-1430.md`
- `.github/.docs/plans/plan-refactor-product-module-2026-04-05-0900.md`
- `.github/.docs/plans/plan-setup-docker-compose-2026-04-05-1615.md`
- `.github/.docs/plans/plan-fix-cors-in-user-creation-form-2026-04-05-1715.md`
- `.github/.docs/plans/plan-fix-add-user-authentication-reviewer-comments-2026-04-05-1715.md`

## What to Ask the User

> "The feature doc is ready. Would you like me to create a plan document at `.github/.docs/plans/plan-<do-something>-<datetime>.md` so we can track implementation progress?"

## Template

```markdown
# <Title>

## Description

<Short description of what is being built or changed.>

## Purpose

<Why this change is needed, additional context, constraints, or background information.>

## Feature Doc

- `.github/.docs/features/<module>/<feature-name>.md` — the source of truth for requirements and design

## Todo List

- [ ] Step 1 — ...
- [ ] Step 2 — ...
- [ ] Step 3 — ...

## Agent Assignments

| Step      | Agent                   | Skill References       |
| --------- | ----------------------- | ---------------------- |
| Step 1    | `<dev-agent>`           | `<skill-1>, <skill-2>` |
| Step 2    | `<dev-agent>`           | `<skill-1>, <skill-2>` |
| Step 3    | `<qa-agent>`            | `<skill-1>, <skill-2>` |
| All steps | `<code-reviewer-agent>` | `<skill-1>, <skill-2>` |
```

## Rules

- Only create after the user explicitly approves
- Update checkboxes (`[ ]` → `[x]`) as each step is completed
