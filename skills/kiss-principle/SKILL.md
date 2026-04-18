---
name: kiss-principle
description: "KISS (Keep It Simple, Stupid) — Enforces the KISS principle by favoring simple, readable, and obvious solutions over clever or over-engineered ones. Use when writing, reviewing, or refactoring code that is unnecessarily complex, over-abstracted, or hard to understand at a glance."
---

# KISS — Keep It Simple, Stupid

## When to Use

- Use when writing, reviewing, or refactoring code. Enforces the KISS principle: solutions should be **as simple as possible** to fulfill their requirements — no simpler, no more complex.
- Apply when evaluating algorithm choices, abstractions, architecture, naming, and control flow.

## The Principle

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

> "The most powerful tool we have as developers is abstraction. The most dangerous tool we have as developers is abstraction." — Kent Beck

Complexity is the enemy of reliability. Simple code is easier to read, test, debug, change, and hand off to the next developer. **If a simpler solution exists that meets the requirements, use it.**

## Common Violations and Fixes

### 1. Over-Engineering for Hypothetical Future Needs

Bad:

```javascript
class DataFetcherFactory {
  static create(type, config, middleware = [], plugins = []) {
    const instance = new DataFetcher(type, config);
    middleware.forEach((m) => instance.use(m));
    plugins.forEach((p) => instance.register(p));
    return instance;
  }
}
// Usage: const fetcher = DataFetcherFactory.create('http', config);
```

Good (if you just need to fetch data right now):

```javascript
async function fetchData(url) {
  const res = await fetch(url);
  return res.json();
}
```

### 2. Clever Code Over Readable Code

Bad:

```python
result = [x for x in data if x % 2 == 0 and x > 0 and x < 100 and x not in seen and not seen.add(x)]
```

Good:

```python
result = []
for x in data:
    if x % 2 == 0 and 0 < x < 100 and x not in seen:
        seen.add(x)
        result.append(x)
```

### 3. Unnecessary Abstraction Layers

Bad:

```typescript
class StringWrapper {
  constructor(private value: string) {}
  getValue() {
    return this.value;
  }
  toUpperCase() {
    return new StringWrapper(this.value.toUpperCase());
  }
}
```

Good:

```typescript
const name = "alice";
const upper = name.toUpperCase();
```

### 4. Deep Nesting

Bad:

```javascript
function processOrder(order) {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        if (order.status !== "cancelled") {
          // actual logic
        }
      }
    }
  }
}
```

Good (use early returns / guard clauses):

```javascript
function processOrder(order) {
  if (!order?.items?.length) return;
  if (order.status === "cancelled") return;
  // actual logic
}
```

### 5. Verbose Conditionals

Bad:

```python
def is_eligible(user):
    if user.age >= 18:
        return True
    else:
        return False
```

Good:

```python
def is_eligible(user):
    return user.age >= 18
```

### 6. Unnecessary State and Variables

Bad:

```javascript
let isValid = false;
const result = validate(input);
if (result === true) {
  isValid = true;
}
if (isValid) {
  process(input);
}
```

Good:

```javascript
if (validate(input)) {
  process(input);
}
```

## KISS vs. Oversimplification

KISS does **not** mean write less code at the expense of correctness, error handling, or clarity. A solution that skips necessary error handling to appear shorter is not simpler — it's broken.

Ask: _"Would a competent developer unfamiliar with this codebase understand this in under 30 seconds?"_

- **Yes** → Acceptable complexity.
- **No** → Simplify, or add a brief explaining comment.

## Enforcement Rules

1. **Before adding an abstraction**, ask: "What problem does this solve _today_?" If the answer is "none yet," skip it.
2. **Before using a complex algorithm**, check whether a simpler O(n²) solution is fast enough for the actual data sizes involved.
3. **When nesting more than 2 levels deep**, consider guard clauses, early returns, or extraction.
4. **Prefer language builtins** over custom implementations — they're tested, optimized, and familiar.
5. **Prefer explicit over implicit** — clever one-liners should be split if they require study to understand.
6. **During code review**, flag complexity with: "KISS violation: can this be simplified to `[simpler form]`?"
7. **Name things clearly** — if you need a comment to explain what a variable or function does, rename it first.
