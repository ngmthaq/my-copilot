---
name: solid-principles
description: "SOLID Principles — Enforces the SOLID principles of object-oriented design (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) for maintainable and scalable code."
---

# SOLID Principles

## When to Use

- Use when writing, reviewing, or refactoring code. Enforces SOLID principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. Applies to classes, modules, functions, and architectural design in any language.

- All generated, modified, or reviewed code **must** follow the SOLID principles. Apply these at the class, module, and function level regardless of programming language.

## S — Single Responsibility Principle (SRP)

Every class, module, or function should have **one and only one reason to change**.

- Split classes that handle multiple concerns (e.g., data access + business logic + formatting)
- Name things after their single responsibility — if a name requires "and" or "or", split it
- Prefer small, focused functions over large multi-purpose ones

Bad:

```javascript
class UserService {
  createUser(data) {
    /* validates, saves to DB, sends email, logs audit */
  }
}
```

Good:

```javascript
class UserValidator { validate(data) { ... } }
class UserRepository { save(user) { ... } }
class UserNotifier { sendWelcomeEmail(user) { ... } }
class UserService {
  constructor(validator, repository, notifier) { ... }
  createUser(data) { /* orchestrates the above */ }
}
```

## O — Open/Closed Principle (OCP)

Software entities should be **open for extension but closed for modification**.

- Use abstractions (interfaces, abstract classes, strategy pattern) to allow new behavior without changing existing code
- Prefer composition and polymorphism over conditionals (`if/else`, `switch`) that grow with each new case
- When adding a new variant, extend — don't edit the existing switch/if chain

Bad:

```javascript
function calculateDiscount(type) {
  if (type === "student") return 0.2;
  if (type === "senior") return 0.3;
  // Must edit this function for every new type
}
```

Good:

```javascript
interface DiscountStrategy { calculate(): number }
class StudentDiscount implements DiscountStrategy { calculate() { return 0.2; } }
class SeniorDiscount implements DiscountStrategy { calculate() { return 0.3; } }
// New discount = new class, no existing code changes
```

## L — Liskov Substitution Principle (LSP)

Subtypes **must be substitutable** for their base types without altering program correctness.

- Derived classes must honor the contract of the base class
- Do not override methods to throw unexpected exceptions or return incompatible types
- Do not weaken preconditions or strengthen postconditions in subclasses
- If a subclass cannot fully support the base class interface, redesign the hierarchy

Bad:

```javascript
class Bird { fly() { ... } }
class Penguin extends Bird { fly() { throw new Error('Cannot fly'); } }
```

Good:

```javascript
class Bird { move() { ... } }
class FlyingBird extends Bird { fly() { ... } }
class Penguin extends Bird { swim() { ... } }
```

## I — Interface Segregation Principle (ISP)

Clients should **not be forced to depend** on interfaces they do not use.

- Prefer many small, specific interfaces over one large general-purpose interface
- Split fat interfaces into focused ones grouped by client need
- A class can implement multiple small interfaces

Bad:

```javascript
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
}
// A Robot must implement eat() and sleep() even though they don't apply
```

Good:

```javascript
interface Workable { work(): void; }
interface Feedable { eat(): void; }
interface Restable { sleep(): void; }
// Robot implements only Workable
```

## D — Dependency Inversion Principle (DIP)

High-level modules should **not depend on low-level modules**. Both should depend on abstractions.

- Depend on interfaces/abstractions, not concrete implementations
- Inject dependencies through constructors or factory functions
- High-level business logic must not import low-level infrastructure directly

Bad:

```javascript
class OrderService {
  private db = new MySQLDatabase();  // Tightly coupled to MySQL
  private mailer = new SmtpMailer(); // Tightly coupled to SMTP
}
```

Good:

```javascript
class OrderService {
  constructor(
    private db: Database,       // Depends on abstraction
    private mailer: Mailer      // Depends on abstraction
  ) {}
}
```

## Enforcement Rules

1. **Before writing a new class or module**, identify its single responsibility and name it accordingly
2. **Before adding a conditional branch** for a new variant, consider whether an abstraction + extension is more appropriate
3. **When creating inheritance hierarchies**, verify that every subtype passes the "substitutability test"
4. **When defining interfaces**, ask "will every implementor use every method?" — if not, split
5. **When importing dependencies**, ensure high-level modules reference abstractions, not concrete implementations
6. **During code review**, flag violations with the specific SOLID principle name (e.g., "SRP violation: this class handles both X and Y")
