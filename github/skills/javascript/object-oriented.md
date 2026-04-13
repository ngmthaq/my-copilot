---
name: javascript-object-oriented
description: "JavaScript OOP — classes, inheritance, encapsulation, polymorphism, mixins, composition vs inheritance, SOLID principles, and design patterns. Use when: designing class hierarchies; implementing design patterns; choosing composition vs inheritance; encapsulating behavior. DO NOT USE FOR: prototypes basics (use javascript-core-fundamentals); functional patterns (use javascript-functional-programming)."
---

# JavaScript Object-Oriented Programming

## 1. Classes (ES6+)

```javascript
class User {
  // Private fields (true privacy)
  #password;
  #loginAttempts = 0;

  // Public fields
  role = "user";

  // Static field
  static MAX_LOGIN_ATTEMPTS = 5;

  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.#password = password;
  }

  // Public method
  getProfile() {
    return { name: this.name, email: this.email, role: this.role };
  }

  // Private method
  #hashPassword(pw) {
    return `hashed_${pw}`;
  }

  // Getter/Setter
  get displayName() {
    return `${this.name} (${this.role})`;
  }

  set password(newPw) {
    this.#password = this.#hashPassword(newPw);
  }

  // Static method
  static fromJSON(json) {
    const { name, email, password } = JSON.parse(json);
    return new User(name, email, password);
  }
}

const user = new User("Alice", "alice@test.com", "secret");
user.displayName; // "Alice (user)"
user.#password; // SyntaxError — truly private
```

---

## 2. Inheritance

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  #breed;

  constructor(name, breed) {
    super(name); // Must call super() first in constructor
    this.#breed = breed;
  }

  speak() {
    return `${this.name} barks`; // Override parent method
  }

  fetch(item) {
    return `${this.name} fetches ${item}`;
  }
}

const dog = new Dog("Rex", "Labrador");
dog.speak(); // "Rex barks"
dog instanceof Dog; // true
dog instanceof Animal; // true
```

---

## 3. Composition Over Inheritance

```javascript
// ❌ Deep inheritance — brittle, tightly coupled
class Animal {}
class Dog extends Animal {}
class SwimmingDog extends Dog {} // What if cats swim too?

// ✅ Composition — mix behaviors freely
const canSwim = (state) => ({
  swim: () => `${state.name} swims`,
});

const canFly = (state) => ({
  fly: () => `${state.name} flies`,
});

const canBark = (state) => ({
  bark: () => `${state.name} barks`,
});

function createDog(name) {
  const state = { name };
  return { ...state, ...canSwim(state), ...canBark(state) };
}

function createDuck(name) {
  const state = { name };
  return { ...state, ...canSwim(state), ...canFly(state) };
}

const dog = createDog("Rex");
dog.swim(); // "Rex swims"
dog.bark(); // "Rex barks"
```

---

## 4. Mixins

```javascript
// Mixin — add shared behavior to classes
const Serializable = (Base) =>
  class extends Base {
    toJSON() {
      return JSON.stringify(this);
    }
    static fromJSON(json) {
      return Object.assign(new this(), JSON.parse(json));
    }
  };

const Validatable = (Base) =>
  class extends Base {
    validate() {
      for (const [key, rules] of Object.entries(this.constructor.rules || {})) {
        for (const rule of rules) {
          if (!rule.check(this[key])) throw new Error(`${key}: ${rule.message}`);
        }
      }
      return true;
    }
  };

// Apply mixins
class User extends Serializable(Validatable(BaseModel)) {
  static rules = {
    email: [{ check: (v) => v?.includes("@"), message: "Invalid email" }],
  };
}

const user = new User();
user.email = "test@example.com";
user.validate(); // true
user.toJSON(); // '{"email":"test@example.com"}'
```

---

## 5. Encapsulation Patterns

```javascript
// Private fields (#) — strongest encapsulation
class BankAccount {
  #balance = 0;

  deposit(amount) {
    if (amount <= 0) throw new Error("Invalid amount");
    this.#balance += amount;
  }

  get balance() {
    return this.#balance;
  }
}

// WeakMap — private data for pre-ES2022
const _private = new WeakMap();

class SecureStore {
  constructor() {
    _private.set(this, { secrets: [] });
  }

  addSecret(s) {
    _private.get(this).secrets.push(s);
  }
}

// Symbol — semi-private (accessible but hidden from casual iteration)
const _internal = Symbol("internal");
class Service {
  [_internal] = { cache: new Map() };
}
```

---

## 6. Polymorphism

```javascript
// Method overriding
class Shape {
  area() {
    throw new Error("Subclass must implement area()");
  }
  toString() {
    return `${this.constructor.name}: area=${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(w, h) {
    super();
    this.width = w;
    this.height = h;
  }
  area() {
    return this.width * this.height;
  }
}

// Polymorphic usage — same interface, different behavior
const shapes = [new Circle(5), new Rectangle(4, 6)];
const totalArea = shapes.reduce((sum, s) => sum + s.area(), 0);

// Duck typing — "if it walks like a duck..."
function processPayment(gateway) {
  // Works with any object that has charge()
  return gateway.charge(amount);
}
```

---

## 7. SOLID Principles

```javascript
// S — Single Responsibility
// ❌ One class doing everything
class User {
  save() {}
  sendEmail() {}
  generateReport() {}
}
// ✅ Separate concerns
class User {
  /* data only */
}
class UserRepository {
  save(user) {}
}
class EmailService {
  send(to, msg) {}
}

// O — Open/Closed (open for extension, closed for modification)
class PaymentProcessor {
  #strategies = new Map();
  register(type, strategy) {
    this.#strategies.set(type, strategy);
  }
  process(type, amount) {
    return this.#strategies.get(type).pay(amount);
  }
}
// Add new payment types without modifying PaymentProcessor

// L — Liskov Substitution
// Subclasses must be usable wherever parent is expected
// ❌ Square extending Rectangle breaks if setWidth/setHeight are independent

// I — Interface Segregation
// ❌ One massive interface
// ✅ Small, focused interfaces (use composition/mixins in JS)

// D — Dependency Inversion
class OrderService {
  constructor(repository, notifier) {
    // Depend on abstractions
    this.repository = repository;
    this.notifier = notifier;
  }
}
```

---

## 8. Common Design Patterns

```javascript
// Singleton
class Database {
  static #instance;
  static getInstance() {
    if (!this.#instance) this.#instance = new Database();
    return this.#instance;
  }
}

// Observer
class EventEmitter {
  #listeners = new Map();
  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(fn);
    return () => this.off(event, fn); // Return unsubscribe
  }
  off(event, fn) {
    const fns = this.#listeners.get(event);
    if (fns)
      this.#listeners.set(
        event,
        fns.filter((f) => f !== fn),
      );
  }
  emit(event, ...args) {
    this.#listeners.get(event)?.forEach((fn) => fn(...args));
  }
}

// Strategy
class Sorter {
  #strategy;
  setStrategy(strategy) {
    this.#strategy = strategy;
  }
  sort(data) {
    return this.#strategy(data);
  }
}
const sorter = new Sorter();
sorter.setStrategy((d) => [...d].sort((a, b) => a - b));

// Builder
class QueryBuilder {
  #query = {};
  select(...fields) {
    this.#query.select = fields;
    return this;
  }
  where(condition) {
    this.#query.where = condition;
    return this;
  }
  limit(n) {
    this.#query.limit = n;
    return this;
  }
  build() {
    return { ...this.#query };
  }
}

new QueryBuilder().select("name", "email").where({ active: true }).limit(10).build();
```

---

## 9. Best Practices

- **Favor composition over inheritance** — deeper than 2 levels is a code smell
- **Use `#private` fields** — real encapsulation, not `_convention`
- **Keep classes small** — single responsibility, focused interfaces
- **Use dependency injection** — pass dependencies in constructor for testability
- **Prefer factory functions** when you don't need `this`, `instanceof`, or inheritance
- **Don't use classes for everything** — plain objects and functions are often simpler
- **Use mixins** for cross-cutting concerns (serialization, validation, logging)
- **Program to interfaces** — depend on behavior, not concrete implementations
- **Override `toString()`** for debuggability
- **Use static methods** for factory patterns (`User.fromJSON()`)
