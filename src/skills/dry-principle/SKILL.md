---
name: dry-principle
description: "DRY (Don't Repeat Yourself) — Enforces the DRY principle by eliminating code duplication through abstraction, shared utilities, and single sources of truth. Use when writing, reviewing, or refactoring code that contains repeated logic, duplicated constants, copy-pasted blocks, or redundant data definitions in any language."
---

# DRY — Don't Repeat Yourself

## When to Use

- Use when writing, reviewing, or refactoring code. Enforces the DRY principle: every piece of knowledge or logic must have a **single, unambiguous, authoritative representation** in the system.
- Apply at all levels: constants, logic, data schemas, configuration, documentation, and tests.

## The Principle

> "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system." — Andy Hunt & Dave Thomas, _The Pragmatic Programmer_

Duplication is the root of many bugs: when logic lives in two places, they inevitably drift apart. DRY is not just about avoiding copy-paste — it's about **single sources of truth**.

## Common Violations and Fixes

### 1. Duplicated Logic

Bad:

```javascript
// In checkout flow
const tax = price * 0.08;

// In order summary
const tax = subtotal * 0.08;

// In invoice generator
const tax = amount * 0.08;
```

Good:

```javascript
const TAX_RATE = 0.08;
function calculateTax(amount) {
  return amount * TAX_RATE;
}
```

### 2. Copy-Pasted Conditionals

Bad:

```python
# In create_user()
if len(password) < 8 or not re.search(r'[A-Z]', password):
    raise ValueError("Invalid password")

# In reset_password()
if len(password) < 8 or not re.search(r'[A-Z]', password):
    raise ValueError("Invalid password")
```

Good:

```python
def validate_password(password: str) -> None:
    if len(password) < 8 or not re.search(r'[A-Z]', password):
        raise ValueError("Invalid password")

# Both callers use validate_password()
```

### 3. Duplicated Data Shapes / Schema

Bad:

```typescript
// In API handler
type User = { id: string; email: string; role: string };

// In database layer
type UserRecord = { id: string; email: string; role: string };

// In tests
const mockUser = { id: "1", email: "a@b.com", role: "admin" };
```

Good:

```typescript
// types/user.ts — single source of truth
export type User = { id: string; email: string; role: string };
// All layers import from here
```

### 4. Magic Numbers / Strings

Bad:

```python
if user.trial_days > 14:
    expire_account(user)

if signup_date + timedelta(days=14) < today:
    send_expiry_warning(user)
```

Good:

```python
TRIAL_PERIOD_DAYS = 14

if user.trial_days > TRIAL_PERIOD_DAYS:
    expire_account(user)

if signup_date + timedelta(days=TRIAL_PERIOD_DAYS) < today:
    send_expiry_warning(user)
```

### 5. Duplicated Test Setup

Bad:

```javascript
it("creates order", () => {
  const user = { id: 1, name: "Alice", role: "customer" };
  // ...
});
it("cancels order", () => {
  const user = { id: 1, name: "Alice", role: "customer" };
  // ...
});
```

Good:

```javascript
const makeUser = (overrides = {}) => ({
  id: 1, name: 'Alice', role: 'customer', ...overrides
});

it('creates order', () => { const user = makeUser(); ... });
it('cancels order', () => { const user = makeUser(); ... });
```

## DRY vs. Wrong Abstraction

DRY does **not** mean "merge anything that looks similar." Two pieces of code that look the same but represent **different concepts** should stay separate. Premature abstraction is its own problem (see YAGNI).

Ask: _"Would these two pieces of code always need to change together?"_

- **Yes** → Extract to a shared abstraction.
- **No** → They may be coincidentally similar. Leave them separate.

## Enforcement Rules

1. **Before copy-pasting code**, stop — extract a function, constant, or module first.
2. **Before hardcoding a value**, ask if it appears (or could appear) elsewhere — if so, name it as a constant.
3. **When adding a new field to a data shape**, verify there's only one definition of that shape in the codebase.
4. **During code review**, flag duplications with: "DRY violation: this logic already exists in `[location]`."
5. **Configuration and environment values** belong in one place (e.g., a config file or env layer), not scattered across the codebase.
6. **Do not DRY prematurely** — wait until you see duplication at least twice before abstracting. "Rule of Three": abstract on the third repetition.
