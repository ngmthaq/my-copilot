---
name: aaa-testing
description: "AAA (Arrange-Act-Assert) — Enforces the Arrange-Act-Assert pattern for writing clear, structured, and maintainable tests. Use when writing, reviewing, or refactoring any unit or integration tests that are hard to read, mix setup with assertions, have unclear intent, or lack a consistent structure. Applies to any language and any testing framework (Jest, PyTest, JUnit, RSpec, Go testing, etc.)."
---

# AAA — Arrange, Act, Assert

## When to Use

- Use when writing, reviewing, or refactoring tests. Enforces the AAA pattern: every test should have three clearly distinct phases — **Arrange** (set up), **Act** (execute), **Assert** (verify).
- Apply to unit tests, integration tests, and any test that exercises a single behavior.

## The Pattern

> "A test that doesn't have a clear structure is a test that's hard to fix when it fails." — Gerard Meszaros, _xUnit Test Patterns_

Every test has exactly three responsibilities:

| Phase       | Question it answers                     | What belongs here                                                        |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------ |
| **Arrange** | _What is the world before this action?_ | Object creation, mocks/stubs, test data, configuration                   |
| **Act**     | _What is being tested?_                 | The single method call, function invocation, or event trigger under test |
| **Assert**  | _Did it do the right thing?_            | Expectations on return values, state changes, side effects               |

The three phases make a test's **intent immediately readable** and failures **immediately diagnosable**: when a test breaks, you know exactly which phase failed and why.

## Basic Structure

```javascript
it("applies 10% discount when order total exceeds $100", () => {
  // Arrange
  const cart = new Cart();
  cart.add({ name: "Widget", price: 60 });
  cart.add({ name: "Gadget", price: 50 });

  // Act
  const total = cart.calculateTotal();

  // Assert
  expect(total).toBe(99); // 110 - 10% discount
});
```

```python
def test_user_is_deactivated_after_too_many_failed_logins():
    # Arrange
    user = User(email="alice@example.com", failed_logins=4)
    auth_service = AuthService()

    # Act
    auth_service.record_failed_login(user)

    # Assert
    assert user.is_active is False
    assert user.failed_logins == 5
```

## Common Violations and Fixes

### 1. No Clear Phase Separation (Most Common)

Bad:

```javascript
it("processes refund", () => {
  const order = new Order({ total: 50 });
  expect(order.status).toBe("pending");
  order.pay();
  expect(order.status).toBe("paid");
  order.refund();
  expect(order.status).toBe("refunded");
  expect(order.total).toBe(0);
});
```

This is actually **three tests collapsed into one**. When it fails, you don't know which transition broke.

Good:

```javascript
it("becomes paid after payment", () => {
  const order = new Order({ total: 50 }); // Arrange
  order.pay(); // Act
  expect(order.status).toBe("paid"); // Assert
});

it("becomes refunded after refund", () => {
  const order = new Order({ total: 50, status: "paid" }); // Arrange
  order.refund(); // Act
  expect(order.status).toBe("refunded"); // Assert
  expect(order.total).toBe(0);
});
```

### 2. Assertions in the Arrange Phase

Bad:

```python
def test_discount_applied():
    # Arrange
    user = create_premium_user()
    assert user.tier == 'premium'  # ← assertion in Arrange — this is verifying a fixture, not behavior
    cart = Cart(user)
    cart.add_item(WIDGET)

    # Act
    total = cart.checkout_total()

    # Assert
    assert total == 45.00
```

Good:

```python
def test_discount_applied():
    # Arrange — trust your fixtures, or write a separate test for them
    user = create_premium_user()
    cart = Cart(user)
    cart.add_item(WIDGET)

    # Act
    total = cart.checkout_total()

    # Assert
    assert total == 45.00
```

### 3. Multiple Acts (Tests Too Many Things)

Bad:

```typescript
it("handles the full user registration flow", () => {
  // Arrange
  const data = { email: "alice@example.com", password: "Secret123" };

  // Act + Assert + Act + Assert...
  const user = userService.register(data);
  expect(user.id).toBeDefined();

  const token = authService.login(data.email, data.password);
  expect(token).toBeTruthy();

  const profile = profileService.get(user.id);
  expect(profile.email).toBe(data.email);
});
```

Good — one behavior per test:

```typescript
it("returns a user with an id after registration", () => {
  const data = { email: "alice@example.com", password: "Secret123" }; // Arrange
  const user = userService.register(data); // Act
  expect(user.id).toBeDefined(); // Assert
});

it("issues a valid token after login", () => {
  const user = createUser({
    email: "alice@example.com",
    password: "Secret123",
  }); // Arrange
  const token = authService.login("alice@example.com", "Secret123"); // Act
  expect(token).toBeTruthy(); // Assert
});
```

### 4. Act Buried in Arrange

Bad:

```python
def test_email_sent_on_signup():
    # Arrange (but Act is hidden inside here)
    mailer = MockMailer()
    user = UserService(mailer=mailer).register({
        "email": "bob@example.com",  # ← register() IS the act
        "name": "Bob"
    })

    # Assert
    assert mailer.sent_count == 1
```

Good:

```python
def test_email_sent_on_signup():
    # Arrange
    mailer = MockMailer()
    service = UserService(mailer=mailer)
    payload = {"email": "bob@example.com", "name": "Bob"}

    # Act
    service.register(payload)

    # Assert
    assert mailer.sent_count == 1
```

### 5. Asserting Too Much (Fragile Tests)

Bad:

```javascript
it("creates an order", () => {
  const order = orderService.create({ item: "Widget", qty: 2 }); // Act
  expect(order.id).toBeDefined();
  expect(order.item).toBe("Widget");
  expect(order.qty).toBe(2);
  expect(order.status).toBe("pending");
  expect(order.createdAt).toBeDefined();
  expect(order.updatedAt).toBeDefined();
  expect(order.total).toBe(19.98);
  expect(order.taxAmount).toBe(1.6);
});
```

This test will break whenever any field changes, even unrelated ones. Assert only what the test is **about**.

Good:

```javascript
it("creates an order in pending status", () => {
  const order = orderService.create({ item: "Widget", qty: 2 }); // Act
  expect(order.id).toBeDefined(); // Assert — it was created
  expect(order.status).toBe("pending"); // Assert — the behavior under test
});

// Separate test for pricing logic
it("calculates correct total for order", () => {
  const order = orderService.create({
    item: "Widget",
    qty: 2,
    unitPrice: 9.99,
  });
  expect(order.total).toBe(19.98);
});
```

## Using Comments and Blank Lines

AAA phases should be visually obvious. Two acceptable styles:

**Explicit comments** (preferred for complex tests):

```python
def test_account_locked_after_five_failed_attempts():
    # Arrange
    account = Account(failed_attempts=4)

    # Act
    account.record_failed_login()

    # Assert
    assert account.is_locked is True
```

**Blank lines only** (acceptable for simple tests):

```javascript
it("returns null for unknown user", () => {
  const repo = new UserRepository(emptyDb);

  const result = repo.find("unknown-id");

  expect(result).toBeNull();
});
```

Never mix setup and assertion in the same block with no separation.

## Shared Arrange: `beforeEach` / Fixtures

When multiple tests share the same Arrange, extract it — but keep the Act and Assert in each test.

Good:

```javascript
describe("Cart", () => {
  let cart;

  beforeEach(() => {
    // Shared Arrange
    cart = new Cart();
    cart.add({ name: "Widget", price: 10 });
    cart.add({ name: "Gadget", price: 20 });
  });

  it("calculates correct total", () => {
    const total = cart.calculateTotal(); // Act
    expect(total).toBe(30); // Assert
  });

  it("applies coupon discount", () => {
    cart.applyCoupon("SAVE10"); // Act
    expect(cart.calculateTotal()).toBe(27); // Assert
  });
});
```

## Naming Tests

A good test name describes the behavior being verified, not the implementation. Follow the pattern:
**`[unit under test]_[scenario]_[expected outcome]`** or plain English prose.

| Bad name      | Good name                                       |
| ------------- | ----------------------------------------------- |
| `test_login`  | `returns auth token when credentials are valid` |
| `test_error`  | `throws ValidationError when email is missing`  |
| `test_cart_2` | `applies free shipping when order exceeds $50`  |

## Enforcement Rules

1. **Every test must have all three phases** — if a phase is missing, something is wrong (no Act = not testing anything; no Assert = test can never fail).
2. **One Act per test** — if you call two methods under test, split into two tests.
3. **No assertions in Arrange** — if you need to verify fixture state, that's a separate test.
4. **Assert only what the test is about** — unrelated assertions make tests fragile and failure messages misleading.
5. **Name tests after behavior**, not implementation — the name should read like a specification.
6. **Shared setup goes in `beforeEach`/fixtures** — don't repeat Arrange across tests, but keep Act+Assert per test.
7. **During code review**, flag violations with: "AAA violation: [Arrange/Act/Assert] phase is [missing/mixed/bloated]."
