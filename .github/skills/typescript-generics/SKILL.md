---
name: typescript-generics
description: "TypeScript generics — generic functions, classes, interfaces, constraints, default types, variance, conditional types with generics, and practical patterns like Result, Repository, and Builder. Use when: writing reusable typed code; constraining generic parameters; building typed abstractions. DO NOT USE FOR: basic types (use typescript-basic-types); advanced type-level logic (use typescript-advanced-types)."
---

# TypeScript Generics

## 1. Generic Functions

```typescript
// Basic — infer type from argument
function identity<T>(value: T): T {
  return value;
}

identity("hello"); // T inferred as "hello"
identity<string>("hello"); // T explicitly string

// Multiple type parameters
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}

// Generic arrow function
const toArray = <T>(value: T): T[] => [value];

// In .tsx files, use trailing comma to avoid JSX ambiguity
const toArray = <T>(value: T): T[] => [value];
```

---

## 2. Constraints (`extends`)

```typescript
// Require specific properties
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}
getLength("hello"); // ✓ string has length
getLength([1, 2]); // ✓ array has length
getLength(42); // Error: number has no length

// Constrain to object keys
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
getProperty({ name: "Alice", age: 30 }, "name"); // string
getProperty({ name: "Alice", age: 30 }, "foo"); // Error

// Constrain to specific types
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}

// Constructor constraint
type Constructor<T = {}> = new (...args: any[]) => T;

function createInstance<T>(Ctor: Constructor<T>): T {
  return new Ctor();
}
```

---

## 3. Generic Interfaces & Types

```typescript
// Generic interface
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implement with concrete type
class UserRepository implements Repository<User> {
  async findById(id: string): Promise<User | null> {
    /* ... */
  }
  async findAll(filter?: Partial<User>): Promise<User[]> {
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
}

// Generic type alias
type Nullable<T> = T | null;
type AsyncResult<T, E = Error> = Promise<Result<T, E>>;
type Mapper<In, Out> = (input: In) => Out;
```

---

## 4. Default Type Parameters

```typescript
// Default generic types
type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

// Uses default Error
const r1: Result<string> = { ok: true, data: "hello" };

// Override default
const r2: Result<string, ValidationError> = {
  ok: false,
  error: new ValidationError({}),
};

// Default in functions
function createState<T = string>(initial: T): { get: () => T; set: (v: T) => void } {
  let state = initial;
  return {
    get: () => state,
    set: (v) => {
      state = v;
    },
  };
}

const s = createState("hello"); // T = string (inferred)
const n = createState<number>(0); // T = number (explicit)
```

---

## 5. Generic Classes

```typescript
class TypedEventEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(event: K, fn: (data: Events[K]) => void): () => void {
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
}

const emitter = new TypedEventEmitter<AppEvents>();
emitter.on("user:login", (data) => {
  data.userId; // ✓ autocomplete
  data.timestamp; // ✓ typed
});
emitter.emit("user:login", { userId: "1", timestamp: new Date() });
emitter.emit("user:login", { userId: "1" }); // Error: missing timestamp
```

---

## 6. Utility Patterns

```typescript
// Type-safe pick
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) result[key] = obj[key];
  return result;
}

const slim = pick(user, ["id", "name"]); // { id: string; name: string }

// Type-safe omit
function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) delete result[key];
  return result;
}

// Group by
function groupBy<T, K extends string>(items: T[], getKey: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (groups, item) => {
      const key = getKey(item);
      (groups[key] ??= []).push(item);
      return groups;
    },
    {} as Record<K, T[]>,
  );
}

const byRole = groupBy(users, (u) => u.role);
// Record<"admin" | "user", User[]>
```

---

## 7. Generic Constraints with Conditional Types

```typescript
// Extract array element type
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type N = ElementOf<number[]>; // number

// Make specific keys optional
type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type CreateUser = OptionalKeys<User, "id" | "createdAt">;

// Make specific keys required
type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Recursive generic
type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

// Generic with infer
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
type PromiseValue<T> = T extends Promise<infer V> ? V : T;
```

---

## 8. Builder Pattern (Generic)

```typescript
class QueryBuilder<T> {
  private query: {
    select?: (keyof T)[];
    where?: Partial<T>;
    orderBy?: { field: keyof T; direction: "asc" | "desc" };
    limit?: number;
    offset?: number;
  } = {};

  select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>> {
    this.query.select = fields as any;
    return this as any;
  }

  where(condition: Partial<T>): this {
    this.query.where = { ...this.query.where, ...condition };
    return this;
  }

  orderBy(field: keyof T, direction: "asc" | "desc" = "asc"): this {
    this.query.orderBy = { field, direction };
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

// Fully typed
new QueryBuilder<User>()
  .select("name", "email") // autocomplete for User keys
  .where({ role: "admin" }) // type-checked
  .orderBy("name") // must be keyof User
  .limit(10)
  .build();
```

---

## 9. Generic Middleware / Pipeline

```typescript
// Type-safe middleware chain
type Middleware<TContext> = (ctx: TContext, next: () => Promise<void>) => Promise<void>;

class Pipeline<TContext> {
  private middlewares: Middleware<TContext>[] = [];

  use(middleware: Middleware<TContext>): this {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(ctx: TContext): Promise<void> {
    let index = 0;
    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        await this.middlewares[index++](ctx, next);
      }
    };
    await next();
  }
}

// Usage
interface RequestContext {
  userId?: string;
  startTime: number;
  headers: Record<string, string>;
}

const pipeline = new Pipeline<RequestContext>()
  .use(async (ctx, next) => {
    ctx.startTime = Date.now();
    await next();
    console.log(`Took ${Date.now() - ctx.startTime}ms`);
  })
  .use(async (ctx, next) => {
    ctx.userId = ctx.headers["x-user-id"];
    await next();
  });
```

---

## 10. Best Practices

- **Let TS infer** generic types when possible — don't specify `<string>` if it's obvious
- **Use constraints** (`extends`) to limit what generics accept
- **Name generics descriptively** for complex types — `TData`, `TError` over `T`, `E`
- **Use defaults** for common cases — `Result<T, E = Error>`
- **Avoid over-generifying** — if a function only works with strings, use `string`, not `T`
- **Use `keyof T`** for type-safe property access
- **Prefer generic functions** over generic classes when no state is needed
- **Use `readonly` generics** for immutable data — `readonly T[]`
- **Test with edge cases** — `never`, `unknown`, union types
- **Don't use `any` in constraints** — use `unknown` or specific types
