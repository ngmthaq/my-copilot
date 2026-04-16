---
name: plan-template
description: "Plan Document Template — Structured template for creating detailed implementation plans based on approved feature documents, including task breakdown, dependencies, and execution strategy."
---

# Plan Document Template

## When to Use

- After the feature doc is approved and created, AI **must** ask the user's permission to create a plan document.
- The plan must be grounded in the feature doc and reference it.

## Location & Naming Convention

```
{plans_directory}/agent-plan-<do-something>-<YYYY-MM-DD-HHmm>.md
```

Examples:

- `{plans_directory}/agent-plan-add-user-authentication-2026-04-05-1430.md`
- `{plans_directory}/agent-plan-refactor-product-module-2026-04-05-0900.md`
- `{plans_directory}/agent-plan-setup-docker-compose-2026-04-05-1615.md`
- `{plans_directory}/agent-plan-fix-cors-in-user-creation-form-2026-04-05-1715.md`
- `{plans_directory}/agent-plan-fix-add-user-authentication-reviewer-comments-2026-04-05-1715.md`

## What to Ask the User

> "The feature doc is ready. Would you like me to create a plan document at `{plans_directory}/agent-plan-<do-something>-<datetime>.md` so we can track implementation progress?"

## Template

```markdown
# <Plan Title>

---

## 1. Description

<Short description of what is being built or changed.>

---

## 2. Purpose

<Why this change is needed, constraints, background.>

---

## 3. Feature Doc (Source of Truth)

- `{features_directory}/<module>/agent-feature-<feature-name>.md`

---

## 4. Execution Strategy

### 4.1 Approach

- Implementation style:
- Key phases:
- Parallelization strategy:

### 4.2 Dependencies Overview

<High-level explanation of task dependencies>

---

## 5. Task Graph (DAG)

### Task List

Each task MUST be atomic and independently executable.

---

### T1

- **Name**:
- **Assigned Agent**:
- **Description**:
- **Dependencies**: []
- **Inputs**:
- **Outputs**:
- **Acceptance Criteria**:
- **Parallelizable**: true

---

### T2

- **Name**:
- **Assigned Agent**:
- **Description**:
- **Dependencies**: [T1]
- **Inputs**:
- **Outputs**:
- **Acceptance Criteria**:
- **Parallelizable**: false

---

### T3

- **Name**:
- **Assigned Agent**:
- **Description**:
- **Dependencies**: [T1]
- **Inputs**:
- **Outputs**:
- **Acceptance Criteria**:
- **Parallelizable**: true

---

## 6. Parallel Execution Groups

- Group A (run in parallel):
  - T1

- Group B (after T1):
  - T2
  - T3

---

## 7. Task Traceability

| Task | Maps To           |
| ---- | ----------------- |
| T1   | FR-1, Component X |
| T2   | API Y             |
| T3   | UI Screen Z       |

---

## 8. Testing Plan

| Task | Test Type | Description |
| ---- | --------- | ----------- |
| T2   | Unit      | ...         |
| T3   | E2E       | ...         |

---

## 9. Execution Rules

- Tasks with no dependencies → run in parallel
- Tasks MUST wait for dependencies
- Each task MUST meet acceptance criteria before next step

---

## 10. Failure Handling

- Retry policy:
- Blocking tasks:
- Escalation:

---

## 11. Agent Assignments Summary

| Task | Agent | Skills |
| ---- | ----- | ------ |
| T1   | ...   | ...    |
| T2   | ...   | ...    |

---

## 12. Progress Tracking

- [ ] T1
- [ ] T2
- [ ] T3

> Update as tasks complete
```
