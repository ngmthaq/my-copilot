---
applyTo: "**/agent-plan-fix-*.md"
---

# Bug-Fix Plan Template

## When to Use

- When a debugger agent creates a plan for a bug fix (no feature doc needed).
- No feature doc is required — the diagnosis serves as the source of truth.

## Location & Naming Convention

Follows the same location as plan documents, with a `agent-plan-fix-` prefix:

```
{plans_directory}/agent-plan-fix-<bug-summary>-<YYYY-MM-DD-HHmm>.md
```

Examples:

- `{plans_directory}/agent-plan-fix-cors-in-user-creation-form-2026-04-05-1715.md`
- `{plans_directory}/agent-plan-fix-null-pointer-in-auth-service-2026-04-06-0930.md`

## Template

```markdown
# Fix: <Bug Summary>

## Diagnosis

- **Error**: The error message or symptom
- **Root Cause**: What is actually going wrong and why
- **Affected Code**: File paths and line numbers
- **Reproduction**: Steps to reproduce (if applicable)

## Purpose

<Why this fix is needed and what impact the bug has.>

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
