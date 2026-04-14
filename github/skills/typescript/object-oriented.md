---
name: typescript-object-oriented
description: "TypeScript OOP — classes with access modifiers, abstract classes, interfaces, generics in classes, mixins, composition vs inheritance, SOLID with type safety, and design patterns with full typing. Use when: designing typed class hierarchies; implementing design patterns in TS; using abstract classes or interfaces for contracts; leveraging generics in OOP. DO NOT USE FOR: basic TS types (use typescript-basic-types); generics deep-dive (use typescript-generics); JS OOP without types (use javascript-object-oriented)."
---

# TypeScript Object-Oriented Programming

## 1. Classes with Access Modifiers

```typescript
class User {
  // Public (default)
  readonly id: string;
  name: string;

  // Private — only accessible within this class
  private password: string;
  private loginAttempts = 0;

  // Protected — accessible in this class and subclasses
  protected role: string = "user";

  // Static
  static MAX_LOGIN_ATTEMPTS = 5;

  constructor(id: string, name: string, password: string) {
    this.id = id;
    this.name = name;
    this.password = password;
  }

  // Parameter properties — shorthand for constructor + assignment
  // constructor(readonly id: string, public name: string, private password: string) {}

  getProfile(): { name: string; role: string } {
    return { name: this.name, role: this.role };
  }

  private hashPassword(pw: string): string {
    return `hashed_${pw}`;
  }

  // Getter/Setter
  get displayName(): string {
    return `${this.name} (${this.role})`;
  }

  set newPassword(pw: string) {
    this.password = this.hashPassword(pw);
  }

  static fromJSON(json: string): User {
    const { id, name, password } = JSON.parse(json);
    return new User(id, name, password);
  }
}

const user = new User("1", "Alice", "secret");
user.displayName; // "Alice (user)"
user.password; // Error: Property 'password' is private
```

### `private` vs `#private`

```typescript
class Example {
  private tsPrivate = 1; // TS compile-time only — accessible at runtime via JS
  #jsPrivate = 2; // True runtime privacy (ES2022)
}
// Use # for real encapsulation, private for TS-only checks
```

---

## 2. Interfaces as Contracts

```typescript
// Interface — defines shape, no implementation
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

interface Serializable {
  toJSON(): string;
}

interface Loggable {
  log(message: string): void;
}

// Class implements multiple interfaces
class UserRepository implements Repository<User>, Loggable {
  async findById(id: string): Promise<User | null> {
    /* ... */
  }
  async findAll(): Promise<User[]> {
    /* ... */
  }
  async create(data: Omit<User, "id">): Promise<User> {
    /* ... */
  }
  async update(id: string, data: Partial<User>): Promise<User> {
    /* ... */
  }
  async delete(id: string): Promise<void> {
    /* ... */
  }
  log(message: string): void {
    console.log(`[UserRepo] ${message}`);
  }
}
```

---

## 3. Abstract Classes

```typescript
// Abstract — can't be instantiated, provides partial implementation
abstract class Shape {
  constructor(public readonly color: string) {}

  // Abstract method — subclasses MUST implement
  abstract area(): number;
  abstract perimeter(): number;

  // Concrete method — shared implementation
  toString(): string {
    return `${this.constructor.name}(${this.color}): area=${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(
    color: string,
    public readonly radius: number,
  ) {
    super(color);
  }
  area(): number {
    return Math.PI * this.radius ** 2;
  }
  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(
    color: string,
    public readonly width: number,
    public readonly height: number,
  ) {
    super(color);
  }
  area(): number {
    return this.width * this.height;
  }
  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

// new Shape("red");           // Error: Cannot create an instance of an abstract class
const shapes: Shape[] = [new Circle("red", 5), new Rectangle("blue", 4, 6)];
const totalArea = shapes.reduce((sum, s) => sum + s.area(), 0);
```

### Abstract vs Interface

| Feature            | `abstract class`          | `interface`            |
| ------------------ | ------------------------- | ---------------------- |
| Implementation     | Can have concrete methods | Declaration only       |
| Constructor        | Yes                       | No                     |
| Access modifiers   | Yes                       | No (all public)        |
| Single inheritance | Yes (extends one)         | No (implements many)   |
| Runtime existence  | Yes (compiled to JS)      | No (erased at compile) |
| State (fields)     | Yes                       | No                     |

---

## 4. Generics in Classes

```typescript
// Generic class
class Result<T, E extends Error = Error> {
  private constructor(
    private readonly value: T | null,
    private readonly error: E | null,
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result(value, null);
  }

  static fail<E extends Error>(error: E): Result<never, E> {
    return new Result(null, error);
  }

  isOk(): this is Result<T, never> {
    return this.error === null;
  }
  isErr(): this is Result<never, E> {
    return this.error !== null;
  }

  unwrap(): T {
    if (this.error) throw this.error;
    return this.value!;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isOk() ? Result.ok(fn(this.value!)) : Result.fail(this.error!);
  }
}

const result = Result.ok(42);
if (result.isOk()) {
  console.log(result.unwrap()); // 42, type-safe
}

// Generic repository
class BaseRepository<T extends { id: string }> {
  protected items = new Map<string, T>();

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  save(item: T): void {
    this.items.set(item.id, item);
  }
}

class UserRepo extends BaseRepository<User> {
  findByEmail(email: string): User | undefined {
    return [...this.items.values()].find((u) => u.email === email);
  }
}
```

---

## 5. Composition Over Inheritance

```typescript
// Define behavior interfaces
interface Swimmer {
  swim(): string;
}

interface Flyer {
  fly(): string;
}

interface Barker {
  bark(): string;
}

// Composable behavior factories
function withSwimming<T extends { name: string }>(base: T): T & Swimmer {
  return { ...base, swim: () => `${base.name} swims` };
}

function withFlying<T extends { name: string }>(base: T): T & Flyer {
  return { ...base, fly: () => `${base.name} flies` };
}

function withBarking<T extends { name: string }>(base: T): T & Barker {
  return { ...base, bark: () => `${base.name} barks` };
}

// Compose — fully typed
const dog = withBarking(withSwimming({ name: "Rex" }));
dog.swim(); // "Rex swims" ✓
dog.bark(); // "Rex barks" ✓
dog.fly(); // Error: Property 'fly' does not exist

const duck = withFlying(withSwimming({ name: "Donald" }));
duck.fly(); // "Donald flies" ✓
duck.swim(); // "Donald swims" ✓
```

---

## 6. Mixins

```typescript
// Mixin constructor type
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin — returns a class extending Base
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date();
    updatedAt = new Date();

    touch() {
      this.updatedAt = new Date();
    }
  };
}

function Activatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    isActive = true;

    activate() {
      this.isActive = true;
    }
    deactivate() {
      this.isActive = false;
    }
  };
}

function Serializable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    toJSON(): string {
      return JSON.stringify(this);
    }
  };
}

// Apply mixins
class BaseEntity {
  constructor(public id: string) {}
}

class User extends Serializable(Activatable(Timestamped(BaseEntity))) {
  constructor(
    id: string,
    public name: string,
  ) {
    super(id);
  }
}

const user = new User("1", "Alice");
user.touch(); // from Timestamped
user.deactivate(); // from Activatable
user.toJSON(); // from Serializable
```

---

## 7. SOLID with TypeScript

```typescript
// S — Single Responsibility
class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
  ) {}
}

class UserRepository {
  async save(user: User): Promise<void> {
    /* ... */
  }
  async findById(id: string): Promise<User | null> {
    /* ... */
  }
}

class EmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    /* ... */
  }
}

// O — Open/Closed
interface PaymentStrategy {
  pay(amount: number): Promise<PaymentResult>;
}

class PaymentProcessor {
  private strategies = new Map<string, PaymentStrategy>();

  register(type: string, strategy: PaymentStrategy): void {
    this.strategies.set(type, strategy);
  }

  async process(type: string, amount: number): Promise<PaymentResult> {
    const strategy = this.strategies.get(type);
    if (!strategy) throw new Error(`Unknown payment type: ${type}`);
    return strategy.pay(amount);
  }
}
// Add new payment types without modifying PaymentProcessor

// L — Liskov Substitution
abstract class Bird {
  abstract move(): string; // Not fly() — penguins can't fly
}
class Sparrow extends Bird {
  move() {
    return "flies";
  }
}
class Penguin extends Bird {
  move() {
    return "walks";
  }
}

// I — Interface Segregation
// ❌ One fat interface
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}
// ✅ Small focused interfaces
interface Workable {
  work(): void;
}
interface Feedable {
  eat(): void;
}

// D — Dependency Inversion
interface Logger {
  info(msg: string): void;
  error(msg: string): void;
}
interface NotificationSender {
  send(to: string, msg: string): Promise<void>;
}

class OrderService {
  constructor(
    private readonly repository: Repository<Order>,
    private readonly notifier: NotificationSender,
    private readonly logger: Logger,
  ) {}

  async create(data: CreateOrderDto): Promise<Order> {
    const order = await this.repository.create(data);
    this.logger.info(`Order ${order.id} created`);
    await this.notifier.send(order.userId, `Order ${order.id} confirmed`);
    return order;
  }
}
```

---

## 8. Design Patterns (Typed)

```typescript
// Singleton
class Database {
  private static instance: Database;
  private constructor(private readonly connectionString: string) {}

  static getInstance(): Database {
    if (!this.instance) this.instance = new Database(process.env.DB_URL!);
    return this.instance;
  }
}

// Observer
type Listener<T> = (data: T) => void;

class EventEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Listener<any>>>();

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }
}

// Fully typed events
interface AppEvents {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "order:created": { orderId: string; total: number };
}

const bus = new EventEmitter<AppEvents>();
bus.on("user:login", (data) => {
  console.log(data.userId); // ✓ typed
  console.log(data.timestamp); // ✓ typed
});
bus.emit("user:login", { userId: "1", timestamp: new Date() });

// Strategy
interface SortStrategy<T> {
  sort(data: T[]): T[];
}

class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}
  setStrategy(s: SortStrategy<T>) {
    this.strategy = s;
  }
  sort(data: T[]): T[] {
    return this.strategy.sort(data);
  }
}

// Builder
class QueryBuilder<T> {
  private query: Partial<{
    select: (keyof T)[];
    where: Partial<T>;
    orderBy: keyof T;
    limit: number;
  }> = {};

  select(...fields: (keyof T)[]): this {
    this.query.select = fields;
    return this;
  }
  where(condition: Partial<T>): this {
    this.query.where = condition;
    return this;
  }
  orderBy(field: keyof T): this {
    this.query.orderBy = field;
    return this;
  }
  limit(n: number): this {
    this.query.limit = n;
    return this;
  }
  build() {
    return { ...this.query };
  }
}

new QueryBuilder<User>()
  .select("name", "email") // ✓ autocomplete
  .where({ role: "admin" })
  .orderBy("name") // ✓ must be keyof User
  .limit(10)
  .build();
```

---

## 9. Implementing Interfaces vs Extending Classes

```typescript
// Prefer interfaces for contracts
interface Cacheable {
  cacheKey(): string;
  ttl(): number;
}

interface Auditable {
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// A class can implement many interfaces + extend one class
class Product extends BaseEntity implements Cacheable, Auditable {
  createdBy!: string;
  updatedBy!: string;
  createdAt = new Date();
  updatedAt = new Date();

  constructor(
    id: string,
    public name: string,
    public price: number,
  ) {
    super(id);
  }

  cacheKey(): string {
    return `product:${this.id}`;
  }
  ttl(): number {
    return 3600;
  }
}

// Type guard with interfaces
function isCacheable(obj: unknown): obj is Cacheable {
  return (
    typeof obj === "object" && obj !== null && "cacheKey" in obj && "ttl" in obj
  );
}
```

---

## 10. Best Practices

- **Use `interface` for contracts** — `abstract class` only when you need shared implementation
- **Use `readonly` liberally** — immutable by default, mutable by exception
- **Prefer parameter properties** — `constructor(private readonly name: string)` is cleaner
- **Use `private` for TS checks, `#` for runtime** — pick one convention per project
- **Favor composition over inheritance** — max 2 levels deep
- **Use generics** to write reusable, type-safe classes and patterns
- **Depend on interfaces, not implementations** — enables testing and swapping
- **Use discriminated unions** over class hierarchies for data types
- **Avoid `any` in class signatures** — use `unknown` + type guards instead
- **Type your events** — generic `EventEmitter<Events>` prevents typos and wrong payloads
