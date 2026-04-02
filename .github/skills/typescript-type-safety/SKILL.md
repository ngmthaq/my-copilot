---
name: typescript-type-safety
description: "TypeScript type safety — strict mode, avoiding any, runtime validation, branded types, exhaustive checks, readonly patterns, and defensive typing strategies. Use when: hardening code against type errors; eliminating any; adding runtime validation; making impossible states unrepresentable. DO NOT USE FOR: basic types (use typescript-basic-types); tsconfig strict options (use typescript-config-tsconfig)."
---

# TypeScript Type Safety

## 1. Eliminating `any`

```typescript
// ❌ any — disables all type checking
function process(data: any) {
  data.whatever.you.want; // No errors, no safety
}

// ✅ unknown — requires narrowing before use
function process(data: unknown) {
  if (typeof data === "string") {
    data.toUpperCase(); // OK — narrowed
  }
}

// ✅ Generics — preserve type info
function identity<T>(value: T): T {
  return value;
}

// Common any sources and fixes:
// JSON.parse → validate with Zod
const raw: unknown = JSON.parse(input);
const user = UserSchema.parse(raw); // Zod validates + types

// fetch response → annotate or validate
const res = await fetch("/api/users");
const data: User[] = await res.json(); // At minimum, annotate
const data = UserArraySchema.parse(await res.json()); // Better: validate

// Event targets → use type assertion with check
const target = event.target;
if (target instanceof HTMLInputElement) {
  target.value; // safely narrowed
}

// Third-party libs → write .d.ts or use @types
declare module "untyped-lib" {
  export function doThing(input: string): number;
}
```

---

## 2. Strict Mode Essentials

```typescript
// tsconfig: "strict": true enables ALL of these:

// strictNullChecks — null/undefined are distinct types
function getUser(id: string): User | null {
  /* ... */
}
const user = getUser("1");
user.name; // Error: Object is possibly null
user?.name; // ✅ Safe access

// noImplicitAny — must annotate when TS can't infer
function process(data) {} // Error: implicit any
function process(data: unknown) {} // ✅

// strictFunctionTypes — contravariant parameter checking
type Handler = (event: MouseEvent) => void;
const fn: Handler = (event: Event) => {}; // Error — Event is too broad

// strictPropertyInitialization — class fields must be initialized
class User {
  name: string; // Error: not initialized
  name: string = ""; // ✅
  name!: string; // ✅ Definite assignment (I'll set it later)
}

// useUnknownInCatchVariables — catch gives unknown, not any
try {
  /* ... */
} catch (err) {
  // err is unknown — must narrow
  if (err instanceof Error) console.log(err.message);
}
```

---

## 3. Runtime Validation (Zod)

```typescript
import { z } from "zod";

// Define schema = runtime validator + static type
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user", "guest"]),
  age: z.number().int().min(0).optional(),
});

// Extract static type from schema
type User = z.infer<typeof UserSchema>;

// Validate at boundaries
function createUser(input: unknown): User {
  return UserSchema.parse(input); // Throws ZodError if invalid
}

// Safe parse — returns Result-like object
function validateUser(input: unknown) {
  const result = UserSchema.safeParse(input);
  if (!result.success) {
    console.error(result.error.flatten());
    return null;
  }
  return result.data; // Typed as User
}

// Validate API responses
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const data = await res.json();
  return UserSchema.parse(data); // Runtime type check
}

// Transform during validation
const CreateUserSchema = UserSchema.omit({ id: true }).extend({
  password: z.string().min(8),
});
type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

---

## 4. Making Impossible States Impossible

```typescript
// ❌ Booleans create ambiguous states
type Request = {
  isLoading: boolean;
  isError: boolean;
  data?: User;
  error?: Error;
};
// Can isLoading AND isError both be true? What does that mean?

// ✅ Discriminated union — each state is explicit
type Request =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: Error };

// Impossible to have data AND error simultaneously

// ❌ Optional fields create ambiguity
type FormState = {
  submitted?: boolean;
  validationErrors?: string[];
  savedId?: string;
};

// ✅ Discriminated union — clear states
type FormState =
  | { state: "editing"; errors: string[] }
  | { state: "submitting" }
  | { state: "saved"; id: string }
  | { state: "failed"; error: Error };
```

---

## 5. Exhaustive Checks

```typescript
// Ensure all cases are handled with never
type Shape = "circle" | "square" | "triangle";

function area(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI;
    case "square":
      return 1;
    case "triangle":
      return 0.5;
    default: {
      const _never: never = shape;
      throw new Error(`Unhandled shape: ${_never}`);
    }
  }
}
// If you add "hexagon" to Shape, TS errors at _never assignment

// Exhaustive helper
function assertNever(value: never, msg?: string): never {
  throw new Error(msg ?? `Unexpected value: ${JSON.stringify(value)}`);
}

// Exhaustive in if/else
function handle(result: Result<User>) {
  if (result.ok) {
    return result.data;
  } else if (!result.ok) {
    throw result.error;
  } else {
    assertNever(result); // Compile error if cases missed
  }
}
```

---

## 6. Readonly & Immutability

```typescript
// Readonly properties
interface User {
  readonly id: string;
  readonly email: string;
  name: string; // Mutable — can be changed
}

// Readonly arrays
function process(items: readonly string[]) {
  items.push("x"); // Error: push does not exist on readonly
  items[0]; // OK — reading is fine
}

// Readonly utility
type FrozenUser = Readonly<User>;
// All properties become readonly

// Deep readonly
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// ReadonlyArray, ReadonlyMap, ReadonlySet
function analyze(data: ReadonlyMap<string, number>) {
  data.get("key"); // OK
  data.set("key", 1); // Error
}

// as const — deepest readonly
const config = {
  db: { host: "localhost", port: 5432 },
  cache: { ttl: 3600 },
} as const;
// Everything is readonly + literal types
```

---

## 7. Branded Types

```typescript
// Prevent mixing structurally identical types
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;
type Email = Brand<string, "Email">;

// Constructor with validation
function UserId(id: string): UserId {
  if (!id.match(/^usr_/)) throw new Error("Invalid UserId format");
  return id as UserId;
}

function Email(email: string): Email {
  if (!email.includes("@")) throw new Error("Invalid email");
  return email as Email;
}

// TS prevents mix-ups
function getUser(id: UserId): User {
  /* ... */
}
function getOrder(id: OrderId): Order {
  /* ... */
}

const userId = UserId("usr_123");
const orderId = OrderId("ord_456");

getUser(userId); // ✓
getUser(orderId); // Error: OrderId not assignable to UserId
getUser("usr_123"); // Error: string not assignable to UserId
```

---

## 8. Type-Safe APIs

```typescript
// Type-safe event emitter
type EventMap = {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  error: { message: string; code: number };
};

class Emitter<T extends Record<string, unknown>> {
  on<K extends keyof T>(event: K, fn: (data: T[K]) => void): void {
    /* ... */
  }
  emit<K extends keyof T>(event: K, data: T[K]): void {
    /* ... */
  }
}

const bus = new Emitter<EventMap>();
bus.emit("user:login", { userId: "1", timestamp: new Date() }); // ✓
bus.emit("user:login", { userId: "1" }); // Error: missing timestamp

// Type-safe builder
class RequestBuilder {
  private config: RequestInit = {};

  method(m: "GET" | "POST" | "PUT" | "DELETE"): this {
    this.config.method = m;
    return this;
  }

  json<T>(body: T): this {
    this.config.body = JSON.stringify(body);
    this.config.headers = { "Content-Type": "application/json" };
    return this;
  }

  async send<R>(url: string): Promise<R> {
    const res = await fetch(url, this.config);
    return res.json();
  }
}
```

---

## 9. Assertion Functions & Guards

```typescript
// Type guard — returns boolean, narrows in if blocks
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}

// Assertion function — throws or narrows
function assertUser(value: unknown): asserts value is User {
  if (!isUser(value)) throw new TypeError("Expected User");
}

// Assert non-null
function assertDefined<T>(
  value: T | null | undefined,
  name: string = "value",
): asserts value is T {
  if (value == null) throw new Error(`${name} is null/undefined`);
}

// Usage — TS narrows after call
const data: unknown = await fetchData();
assertUser(data);
data.name; // TS knows it's User

const user = await getUser(id);
assertDefined(user, "User");
user.email; // TS knows it's non-null
```

---

## 10. Common Unsafe Patterns to Avoid

```typescript
// ❌ Type assertion to bypass checks
const user = {} as User; // Empty object treated as User — will crash at runtime

// ❌ Non-null assertion on uncertain values
const el = document.querySelector(".btn")!; // Might be null

// ❌ any in generics
function wrap<T = any>(value: T) {} // Defeats generics purpose

// ❌ Ignoring null checks
const name = users.find((u) => u.id === id).name; // find returns T | undefined

// ❌ Index access without noUncheckedIndexedAccess
const first = arr[0]; // Could be undefined if arr is empty

// ✅ Fixes for all of the above:
const user: User = { id: "1", name: "Alice", email: "a@b.com" }; // Real data
const el = document.querySelector(".btn");
if (!el) throw new Error("Button not found");

function wrap<T>(value: T) {} // No default any
const found = users.find((u) => u.id === id);
if (!found) throw new NotFoundError("User", id);

// Enable noUncheckedIndexedAccess in tsconfig
const first = arr[0]; // type: T | undefined — forces null check
```

---

## 11. Best Practices

- **Enable `strict: true`** — non-negotiable for type safety
- **Enable `noUncheckedIndexedAccess`** — array/object access returns `T | undefined`
- **Use `unknown` over `any`** everywhere — force callers to narrow
- **Validate at boundaries** — use Zod for API input, env vars, JSON parsing
- **Use discriminated unions** — make impossible states unrepresentable
- **Use branded types** — prevent ID and value mix-ups
- **Use `readonly`** by default — mutate only when explicitly needed
- **Use exhaustive checks** — `never` in default cases catches missing handlers
- **Avoid type assertions** (`as`) — use type guards or validation instead
- **Use assertion functions** for preconditions that narrow types
