---
name: code-reviewer-standard
description: "Code Reviewer — Performs thorough, structured code reviews covering security (secret scanning), code quality (SOLID, DRY, KISS), architecture (Separation of Concerns, Atomic Design), and testing (AAA pattern). Use when reviewing pull requests, merge requests, or any code changes across any language or framework. Automatically applies all referenced skill standards as review lenses."
---

# Code Review Standard

## Skill Dependencies

Read each referenced skill before reviewing code that touches its domain:

| Skill                    | Read when...                                           |
| ------------------------ | ------------------------------------------------------ |
| `solid-principle`        | Reviewing classes, modules, or inheritance hierarchies |
| `dry-principle`          | Any repeated logic, constants, or type definitions     |
| `kiss-principle`         | Nested logic, abstractions, or complex control flow    |
| `separation-of-concerns` | Layers, controllers, services, repositories            |
| `aaa-testing`            | Any test file                                          |
| `secret-scanner`         | Every review — secrets appear anywhere                 |
| `atomic-design-pattern`  | Any component-based UI (React, Vue, Angular, Flutter)  |

---

## Review Priorities

### 🔴 CRITICAL (Block merge)

- Hardcoded secrets, credentials, or connection strings → see Secret Scanner section
- Security vulnerabilities: injection, broken auth/authz, unvalidated input, insecure crypto
- Logic errors, data corruption risks, race conditions
- API contract changes without versioning
- Irreversible destructive operations without safeguards

### 🟡 IMPORTANT (Requires discussion)

- SOLID violations that create systemic design debt
- Business logic in UI/controllers; data access mixed with domain logic
- Atomic hierarchy inversions (template fetching data, page-level logic in molecules, etc.)
- Missing tests for critical paths or new functionality
- Tests with no assertions, multiple Acts, or Act buried in Arrange
- N+1 queries, memory leaks, unindexed lookups on large datasets

### 🟢 SUGGESTION (Non-blocking)

- Duplicated logic (flag on 3rd repetition — Rule of Three)
- Unnecessary complexity, over-abstraction, deep nesting
- Weak test names, over-asserting, AAA phase blurring
- Names that require a comment to understand
- Missing API docs or unexplained complex logic

---

## Secret Scanner

**Run on every review.** Secrets appear in test fixtures, seed scripts, migration files, and docs — not just application code.

**🔴 CRITICAL:** AWS keys (`AKIA...`), private keys (`-----BEGIN ... PRIVATE KEY-----`), GCP service account JSON, Azure client secrets, Stripe live keys (`sk_live_`), GitHub tokens (`ghp_`, `gho_`, `ghs_`, `github_pat_`)

**🟡 HIGH:** GCP API keys (`AIza...`), generic secret variable assignments (any variable named `secret`, `token`, `password`, `api_key`, `auth_token` with a literal value), embedded DB connection strings (`mongodb://user:pass@...`), Slack/Discord/Twilio/SendGrid tokens, npm tokens (`npm_...`)

**🟡 MEDIUM:** Hardcoded bearer tokens, JWTs (`eyJ...`), internal IP:port combinations

Every finding must state: secret type, file path + line number, severity, and remediation step (env var, secrets manager, or `.env` excluded from VCS). **Do not approve** while any critical or high finding is open. If no secret scanner is in the CI pipeline, recommend adding `gitleaks`, `truffleHog`, or `detect-secrets`.

---

## Code Quality

**SOLID** — flag with the principle name and a split suggestion:

- SRP: _"SRP violation: this [class/function] handles both [X] and [Y] — split them."_
- OCP: _"OCP violation: extend with a new strategy/subclass rather than editing this branch."_
- LSP: _"LSP violation: [Subclass] cannot substitute [Base] — redesign the hierarchy."_
- ISP: _"ISP violation: not all implementors use [method] — split the interface."_
- DIP: _"DIP violation: depend on the abstraction, inject the concrete."_

**DRY** — flag the duplication location(s) and suggest an extraction. Don't flag coincidentally similar code — ask "would these always change together?" Skip if it's only appeared twice (Rule of Three).

**KISS** — flag nesting > 2–3 levels (suggest guard clauses), one-liners that take study to parse, and abstractions that serve only one current use case. Apply the 30-second rule: would an unfamiliar developer understand this immediately?

---

## Architecture

**Separation of Concerns** — flag when a function/class has more than one reason to change. Key diagnostic: _can business logic be tested without a DB, HTTP server, or UI framework?_ If not, it's entangled with infrastructure. Use this ownership table:

| Layer                    | Owns                           | Must NOT contain                           |
| ------------------------ | ------------------------------ | ------------------------------------------ |
| Presentation / UI        | Rendering, display formatting  | Business rules, DB queries, auth           |
| Business Logic / Domain  | Rules, workflows, calculations | HTML, SQL, HTTP                            |
| Data Access / Repository | Querying, persistence          | Business rules, formatting                 |
| Cross-cutting            | Auth, logging, validation      | Business logic — use middleware/decorators |

**Atomic Design** — apply to any component-based UI. Flag level violations:

| Level    | May do business logic? | May fetch data? |
| -------- | ---------------------- | --------------- |
| Atom     | ❌                     | ❌              |
| Molecule | Internal state only    | ❌              |
| Organism | ✅                     | ❌              |
| Template | ❌                     | ❌              |
| Page     | ✅                     | ✅              |

Common flags: atom importing a design system component; molecule reimplementing atom logic; template fetching data; routing/API calls inside a molecule or organism.

---

## Testing

**AAA** — every test needs three separated phases: Arrange (setup) → Act (single call) → Assert (expectations). Flag:

- Multiple Act→Assert cycles: _"AAA violation: multiple Acts — split into separate tests."_
- Assertions in Arrange: _"AAA violation: Arrange contains assertions — move to a separate test."_
- Act hidden in setup: _"AAA violation: Act is buried in Arrange — make it explicit."_
- Over-asserting unrelated fields: _"AAA violation: Assert tests things unrelated to this behavior."_
- No assertion: _"AAA violation: no Assert — this test can never fail."_

Test names must describe behavior, not implementation: `returns auth token when credentials are valid`, not `test_login`.

---

## Comment Format

```markdown
**[🔴/🟡/🟢] [Skill]: Brief title**

What the issue is and where it occurs (file + line).

**Why this matters:** Impact on security, correctness, or maintainability.

**Suggested fix:** [code example if applicable]
```

---

## Review Checklist

### 🔴 Security

- [ ] No hardcoded secrets anywhere in the diff (code, tests, configs, docs)
- [ ] All user inputs validated and sanitized
- [ ] No injection via string concatenation (SQL, commands, etc.)
- [ ] Auth and authz checks before accessing resources
- [ ] No custom crypto; dependencies free of known CVEs

### 🟡 Architecture & Design

- [ ] No SOLID violations (SRP, OCP, LSP, ISP, DIP)
- [ ] Layer boundaries respected — business logic not in UI or controllers
- [ ] Cross-cutting concerns in middleware/decorators, not inline
- [ ] UI components at the correct Atomic level; no hierarchy inversions

### 🟡 Testing

- [ ] Critical paths and new functionality have tests
- [ ] All tests follow AAA (no mixed phases, no multiple Acts, no missing Assert)
- [ ] Test names describe behavior; mocks used only for external dependencies

### 🟢 Code Quality

- [ ] No duplicated logic (Rule of Three); no magic numbers/strings
- [ ] No unnecessary complexity; nesting ≤ 2–3 levels
- [ ] Names are self-documenting; no commented-out code or unlinked TODOs
- [ ] Public APIs documented; README updated if setup changed

---

## Project-Specific Customizations

**Tech Stack:** [e.g., TypeScript, React 18, Node.js, PostgreSQL]
**Architecture:** [e.g., Clean Architecture, Microservices]
**Testing:** [e.g., Jest, React Testing Library, Cypress]
**Code Style:** [e.g., Prettier + ESLint with Airbnb config]

Add project-specific checks here:

- Language/framework rules (e.g., "React hooks must follow rules of hooks")
- Deployment rules (e.g., "DB migrations must be reversible")
- Business logic rules (e.g., "Pricing must include tax")
- Team conventions (e.g., "Commits follow Conventional Commits format")
