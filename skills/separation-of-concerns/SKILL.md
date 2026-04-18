---
name: separation-of-concerns
description: "Separation of Concerns (SoC) — Enforces the Separation of Concerns principle by ensuring each module, layer, and component addresses exactly one well-defined concern. Use when writing, reviewing, or refactoring code that mixes UI with business logic, business logic with data access, presentation with formatting, or cross-cutting concerns (auth, logging, validation) with core logic."
---

# Separation of Concerns (SoC)

## When to Use

- Use when writing, reviewing, or refactoring code. Enforces SoC: software should be divided into distinct sections, each addressing a **separate, well-defined concern**.
- Apply when designing layers (presentation, business logic, data access), components, modules, and cross-cutting concerns (auth, logging, validation, error handling).

## The Principle

> "Separation of concerns is a design principle for separating a computer program into distinct sections, so that each section addresses a separate concern." — Edsger W. Dijkstra

A **concern** is any distinct aspect of a program's behavior or functionality. When concerns are mixed, changes to one ripple unexpectedly through others, making code fragile, hard to test, and hard to reason about.

## Layers and What They Own

| Layer                        | Concern                                         | Should NOT contain                                 |
| ---------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| **Presentation / UI**        | Rendering, user interaction, display formatting | Business rules, DB queries, auth logic             |
| **Business Logic / Domain**  | Rules, workflows, decisions, calculations       | HTML/templates, SQL, HTTP requests                 |
| **Data Access / Repository** | Querying, persistence, caching                  | Business rules, response formatting                |
| **Infrastructure**           | HTTP, queues, email, file I/O                   | Domain logic, UI concerns                          |
| **Cross-cutting**            | Auth, logging, validation, error handling       | Business logic — injected as middleware/decorators |

## Common Violations and Fixes

### 1. Business Logic in the UI / Controller

Bad:

```javascript
// React component
function CheckoutPage({ cart }) {
  const tax = cart.total * 0.08;
  const discount = cart.items.length > 5 ? cart.total * 0.1 : 0;
  const finalPrice = cart.total + tax - discount;
  const isEligible = user.accountAge > 30 && user.orders.length > 2;

  return <div>Total: {finalPrice}</div>;
}
```

Good:

```javascript
// Domain layer
function calculateOrderTotal(cart, user) {
  const tax = cart.total * TAX_RATE;
  const discount = isEligibleForDiscount(cart, user)
    ? cart.total * DISCOUNT_RATE
    : 0;
  return { tax, discount, total: cart.total + tax - discount };
}

// UI layer — only renders
function CheckoutPage({ cart, user }) {
  const { total } = calculateOrderTotal(cart, user);
  return <div>Total: {total}</div>;
}
```

### 2. Data Access Mixed with Business Logic

Bad:

```python
def process_refund(order_id):
    # Data access
    order = db.query("SELECT * FROM orders WHERE id = ?", order_id)

    # Business logic
    if order.status != 'completed':
        raise ValueError("Only completed orders can be refunded")
    if (datetime.now() - order.created_at).days > 30:
        raise ValueError("Refund window expired")

    # More data access
    db.execute("UPDATE orders SET status='refunded'...")
    db.execute("INSERT INTO refunds ...")

    # Side effect / infrastructure
    stripe.refund(order.payment_id)
    email.send(order.customer_email, "Your refund is being processed")
```

Good:

```python
# Repository — only data access
class OrderRepository:
    def find(self, order_id): ...
    def update_status(self, order_id, status): ...

# Domain service — only business logic
class RefundService:
    def __init__(self, order_repo, payment_gateway, notifier):
        ...
    def process_refund(self, order_id):
        order = self.order_repo.find(order_id)
        self._validate_refund_eligibility(order)  # business rules
        self.payment_gateway.refund(order.payment_id)
        self.order_repo.update_status(order_id, 'refunded')
        self.notifier.send_refund_confirmation(order)
```

### 3. Cross-Cutting Concerns Inline

Bad:

```typescript
async function createUser(data: UserInput) {
  // Auth check
  if (!currentUser.hasPermission("create_user")) throw new ForbiddenError();

  // Validation
  if (!data.email.includes("@")) throw new ValidationError("Invalid email");

  // Logging
  logger.info(`Creating user: ${data.email}`);

  // Business logic (the actual concern of this function)
  const user = new User(data);
  await userRepo.save(user);

  // More logging
  logger.info(`User created: ${user.id}`);
  return user;
}
```

Good:

```typescript
// Cross-cutting handled by middleware/decorators
@RequirePermission('create_user')
@ValidateInput(CreateUserSchema)
@LogOperation('createUser')
async function createUser(data: UserInput) {
  // Pure business logic only
  const user = new User(data);
  await userRepo.save(user);
  return user;
}
```

### 4. Formatting Mixed with Data Retrieval

Bad:

```python
def get_report(start_date, end_date):
    rows = db.query("SELECT ...")

    # Mixes data retrieval with presentation
    output = "Sales Report\n"
    output += "=" * 40 + "\n"
    for row in rows:
        output += f"{row.date}: ${row.amount:,.2f}\n"
    return output
```

Good:

```python
def get_sales_data(start_date, end_date) -> list[SaleRecord]:
    return db.query("SELECT ...")  # pure data

def format_sales_report(records: list[SaleRecord]) -> str:
    # pure formatting
    lines = ["Sales Report", "=" * 40]
    lines += [f"{r.date}: ${r.amount:,.2f}" for r in records]
    return "\n".join(lines)
```

## Identifying Concern Boundaries

Ask these questions when designing a module or reviewing code:

1. **"What is the one job of this function/class/module?"** If the answer requires "and", it may be mixing concerns.
2. **"What would cause this to change?"** If the answer lists multiple unrelated reasons (UI redesign AND business rule change AND DB schema change), concerns are mixed.
3. **"Can I test the business logic without touching the DB/UI/HTTP?"** If not, business logic is tangled with infrastructure.
4. **"Where does auth/logging/validation live?"** If the answer is "everywhere, inline," those are cross-cutting concerns that need centralization.

## Enforcement Rules

1. **Business logic must be testable in isolation** — without spinning up a DB, HTTP server, or UI framework.
2. **Controllers/handlers should be thin** — validate input, call domain logic, return output. No business rules.
3. **Repositories/DAOs should be dumb** — only translate between domain objects and storage. No business rules.
4. **Cross-cutting concerns** (auth, logging, validation, error handling) belong in middleware, decorators, or aspects — not inline in business functions.
5. **A module that imports both UI libraries and DB drivers** is a signal of mixed concerns.
6. **During code review**, flag mixed concerns with: "SoC violation: this function handles both `[concern A]` and `[concern B]` — split them."
