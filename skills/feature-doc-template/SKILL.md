---
name: feature-doc-template
description: "Feature Document Template — Structured template for documenting feature requirements and design upfront, serving as the source of truth for planning and implementation."
---

# Feature Document Template

- The feature doc is the **source of truth** that defines requirements and design upfront. All agents — developer, QA, DevOps, and code reviewer — must reference it throughout implementation.

## When to Use

- Before implementing any feature or change

## Location & Naming Convention

```
{doc_directory}/<date-time>-agent-feature-<feature-name>.md
```

Examples:

- `{doc_directory}/20260602-1520-agent-feature-login-api.md`
- `{doc_directory}/20260602-1520-agent-feature-login-ui.md`
- `{doc_directory}/20260602-1520-agent-feature-register-ui.md`
- `{doc_directory}/20260602-1520-agent-feature-refresh-token-api.md`
- `{doc_directory}/20260602-1520-agent-feature-create-product-ui.md`
- `{doc_directory}/20260602-1520-agent-feature-list-products-api.md`
- `{doc_directory}/20260602-1520-agent-feature-docker-setup.md`

## Rules

- Always create the doc file.

## Template

```markdown
# <Feature Name>

---

## 1. Overview

<What the feature does and the problem it solves.>

---

## 2. Requirements

### 2.1 Functional Requirements (FR)

- FR-1: ...
- FR-2: ...

### 2.2 Non-Functional Requirements (NFR)

- Performance: ...
- Scalability: ...
- Reliability: ...
- Security: ...
- Accessibility: ...

### 2.3 Constraints

- Technical:
- Business:
- Platform:

### 2.4 Assumptions

- ...

### 2.5 Edge Cases

- ...

---

## 3. Architecture

### 3.1 System Context

<Where this feature fits in the system>

### 3.2 Components

| Component / File | Responsibility |
| ---------------- | -------------- |
| ...              | ...            |

### 3.3 Data Flow

<Describe flow between components>

### 3.4 External Integrations

- APIs
- Services
- Third-party systems

### 3.5 Architecture Decisions

| Decision | Options Considered | Chosen | Reason |
| -------- | ------------------ | ------ | ------ |

---

## 4. Data Model

| Entity | Fields    | Description |
| ------ | --------- | ----------- |
| User   | id, email | ...         |

---

## 5. API / Interface

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET    | /... | ...         |

---

## 6. State Management (if applicable)

- Client state:
- Server state:
- Caching strategy:

---

## 7. Configuration

| Variable | Type | Default | Description |
| -------- | ---- | ------- | ----------- |

---

## 8. Security Considerations

- Authentication:
- Authorization:
- Data protection:
- Threats & mitigations:

---

## 9. Performance Considerations

- Expected load:
- Bottlenecks:
- Optimization strategy:

---

## 10. Testing Strategy

### Unit Tests

- Scope:

### Integration Tests

- Scope:

### E2E Tests

- Scope:

---

## 11. DevOps & Deployment

- Environments:
- CI/CD:
- Migration strategy:
- Rollback plan:

---

## 12. Observability

- Logging:
- Metrics:
- Alerts:

---

## 13. Known Limitations

- ...

---

## 14. Risks

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |

---

## 15. Task Graph (DAG)

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
