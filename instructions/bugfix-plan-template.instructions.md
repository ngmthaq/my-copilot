---
applyTo: "**/agent-plan-fix-*.md"
paths:
  - "**/agent-plan-fix-*.md"
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

---

## 1. Diagnosis

- **Error**:
- **Root Cause**:
- **Affected Code**:
- **Reproduction Steps**:

---

## 2. Impact Analysis

- Affected features:
- User impact:
- Severity: (Low / Medium / High / Critical)

---

## 3. Purpose

<Why this fix is needed and expected outcome>

---

## 4. Fix Strategy

- Approach:
- Alternative approaches considered:
- Why this approach:

---

## 5. Task Breakdown

---

### T1

- **Name**: Identify and isolate faulty logic
- **Agent**: debugger
- **Description**:
- **Dependencies**: []
- **Acceptance Criteria**:
- Root cause confirmed in code

---

### T2

- **Name**: Implement fix
- **Agent**: relevant developer
- **Description**:
- **Dependencies**: [T1]
- **Acceptance Criteria**:
- Bug no longer reproducible

---

### T3

- **Name**: Add/Update tests
- **Agent**: qa-engineer
- **Description**:
- **Dependencies**: [T2]
- **Acceptance Criteria**:
- Test covers bug scenario

---

### T4

- **Name**: Regression testing
- **Agent**: qa-engineer
- **Dependencies**: [T3]
- **Acceptance Criteria**:
- No existing functionality broken

---

### T5

- **Name**: Code review
- **Agent**: code-reviewer
- **Dependencies**: [T2, T3]
- **Acceptance Criteria**:
- Code quality and security validated

---

## 6. Parallel Execution Notes

- T2 and T3 can partially overlap (if safe)
- T4 MUST wait for T2 & T3
- T5 can run after implementation but before full regression completion

---

## 7. Validation Criteria (Definition of Done)

- Bug cannot be reproduced
- Automated test added
- No regression issues
- Code reviewed and approved

---

## 8. Risks

| Risk        | Impact | Mitigation          |
| ----------- | ------ | ------------------- |
| Regression  | High   | Add tests           |
| Partial fix | Medium | Validate edge cases |

---

## 9. Progress Tracking

- [ ] T1
- [ ] T2
- [ ] T3
- [ ] T4
- [ ] T5

> Update as tasks complete
```
