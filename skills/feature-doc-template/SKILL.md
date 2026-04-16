---
name: feature-doc-template
description: "Feature Document Template — Structured template for documenting feature requirements and design upfront, serving as the source of truth for planning and implementation."
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

| Component | Responsibility |
| --------- | -------------- |
| ...       | ...            |

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

## 15. Related Plans

- `agent-plan-<name>-<datetime>`
```
