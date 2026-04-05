---
name: typescript-type-inference
description: "TypeScript type inference — variable inference, return type inference, contextual typing, generic inference, const assertions, control flow analysis, widening/narrowing, and satisfies operator. Use when: understanding what TS infers automatically; debugging unexpected inferred types; optimizing type annotations. DO NOT USE FOR: explicit type annotations (use typescript-basic-types); type narrowing guards (use typescript-advanced-types)."
---

# TypeScript Type Inference

## 1. Variable Inference

```typescript
// TS infers from the initializer
const name = "Alice"; // type: "Alice" (string literal — const is narrow)
let name2 = "Alice"; // type: string (let is widened)

const count = 42; // type: 42
let count2 = 42; // type: number

const active = true; // type: true
let active2 = true; // type: boolean

// Arrays
const nums = [1, 2, 3]; // number[]
const mixed = [1, "two", true]; // (string | number | boolean)[]
const empty: string[] = []; // Must annotate empty arrays

// Objects
const user = { name: "Alice", age: 30 };
// type: { name: string; age: number } — properties are widened

// const narrows literals
const config = { port: 3000, host: "localhost" } as const;
// type: { readonly port: 3000; readonly host: "localhost" }
```

---

## 2. Return Type Inference

```typescript
// TS infers the return type from the function body
function add(a: number, b: number) {
  return a + b; // inferred return: number
}

function getUser(id: string) {
  if (id === "1") return { name: "Alice", role: "admin" as const };
  return null;
  // inferred: { name: string; role: "admin" } | null
}

// Multiple return paths — TS unions them
function parse(input: string) {
  if (input === "true") return true;
  if (input === "false") return false;
  return input;
  // inferred: string | boolean
}

// Async return inference
async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json(); // inferred: Promise<any> — json() returns any!
}

// ✅ Annotate when inference gives any or is too wide
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}
```

### When to Annotate Return Types

```typescript
// ✅ Annotate: public API functions (clarity + prevents accidental changes)
export function createUser(data: CreateInput): User {
  /* ... */
}

// ✅ Annotate: async functions (json() returns any)
async function getConfig(): Promise<Config> {
  /* ... */
}

// ✅ Annotate: complex return types (helps readers)
function buildQuery(): { sql: string; params: unknown[] } {
  /* ... */
}

// ❌ Skip annotation: obvious returns, callbacks, simple helpers
const double = (n: number) => n * 2; // clearly number
array.map((item) => item.name); // clearly string[]
```

---

## 3. Contextual Typing

```typescript
// TS infers parameter types from context

// Array method callbacks
const names = ["Alice", "Bob", "Charlie"];
names.filter((name) => name.startsWith("A"));
//           ^ name is inferred as string

names.map((name, index) => ({ name, index }));
//         ^ string, ^ number — both inferred

// Event handlers
document.addEventListener("click", (event) => {
  event.clientX; // event inferred as MouseEvent
});

document.addEventListener("keydown", (event) => {
  event.key; // event inferred as KeyboardEvent
});

// Function type context
type Comparator<T> = (a: T, b: T) => number;
const byAge: Comparator<User> = (a, b) => a.age - b.age;
//                                ^ a and b inferred as User

// Callback context
function process(items: string[], fn: (item: string, i: number) => void) {
  items.forEach(fn);
}
process(["a", "b"], (item, i) => {
  item.toUpperCase(); // item inferred as string
  i.toFixed(); // i inferred as number
});
```

---

## 4. Generic Inference

```typescript
// TS infers generic types from arguments
function identity<T>(value: T): T {
  return value;
}
identity("hello"); // T inferred as "hello"
identity(42); // T inferred as 42

// Inference from multiple arguments
function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b };
}
merge({ name: "Alice" }, { age: 30 });
// T = { name: string }, U = { age: number }

// Inference from return context
function useState<T>(initial: T): [T, (v: T) => void] {
  let state = initial;
  return [
    state,
    (v) => {
      state = v;
    },
  ];
}
const [count, setCount] = useState(0);
//     ^ number         ^ (v: number) => void

// Inference with constraints
function first<T extends unknown[]>(arr: T): T[0] {
  return arr[0];
}
first([1, "two", true]); // inferred return: number

// When inference fails — provide explicitly
const result = new Map<string, User>();
// Without <string, User>, TS infers Map<any, any> from empty constructor
```

---

## 5. Widening & Narrowing

```typescript
// WIDENING — TS widens literals to base types in mutable contexts
let x = "hello"; // string (widened — let can be reassigned)
const y = "hello"; // "hello" (not widened — const can't change)

let obj = { name: "Alice" }; // { name: string } — properties widened
const obj2 = { name: "Alice" } as const; // { readonly name: "Alice" }

// Widening in function returns
function getStatus() {
  return "active"; // inferred as string, not "active"
}
// Fix: annotate return type or use as const
function getStatus(): "active" | "inactive" {
  return "active";
}

// NARROWING — TS narrows types based on control flow
function process(value: string | number | null) {
  if (value === null) return; // narrowed: string | number
  if (typeof value === "string") {
    value.toUpperCase(); // narrowed: string
  } else {
    value.toFixed(); // narrowed: number
  }
}

// Narrowing with truthiness
function print(value?: string) {
  if (value) {
    value.toUpperCase(); // narrowed: string (not undefined)
  }
}
```

---

## 6. Control Flow Analysis

```typescript
// TS tracks type through assignments
let value: string | number = "hello";
value.toUpperCase(); // OK — TS knows it's string here

value = 42;
value.toFixed(); // OK — TS knows it's number here

// After type guards, narrowing persists
function example(x: string | number) {
  if (typeof x === "string") {
    // x is string in this block
    return x.toUpperCase();
  }
  // x is number here (string case returned)
  return x.toFixed(2);
}

// Narrowing with assignments
let result: string | undefined;
// result.toUpperCase(); // Error — possibly undefined

result = getValue();
if (result !== undefined) {
  result.toUpperCase(); // OK — narrowed
}

// Narrowing in loops
const items: (string | number)[] = [1, "two", 3];
for (const item of items) {
  if (typeof item === "string") {
    console.log(item.toUpperCase()); // narrowed to string
  }
}
```

---

## 7. `satisfies` Operator

```typescript
// satisfies validates a type WITHOUT widening the inferred type

// Without satisfies — type is widened
const palette: Record<string, string | number[]> = {
  red: [255, 0, 0],
  green: "#00ff00",
};
palette.red.map(/* ... */); // Error — red is string | number[]

// With satisfies — validates AND keeps narrow type
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
} satisfies Record<string, string | number[]>;

palette.red.map(/* ... */); // ✓ — TS knows red is number[]
palette.green.toUpperCase(); // ✓ — TS knows green is string

// Validate config while keeping literal types
const config = {
  port: 3000,
  host: "localhost",
  debug: true,
} satisfies Record<string, string | number | boolean>;

config.port; // type: number (not string | number | boolean)

// Validate route map
const routes = {
  home: "/",
  about: "/about",
  user: "/users/:id",
} satisfies Record<string, `/${string}`>;

routes.home; // type: "/" (literal, not string)
```

---

## 8. `as const` Deep Inference

```typescript
// as const makes everything readonly and literal
const colors = ["red", "green", "blue"] as const;
// type: readonly ["red", "green", "blue"]

type Color = (typeof colors)[number]; // "red" | "green" | "blue"

// Object as const
const STATUS = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  Pending: "PENDING",
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];
// "ACTIVE" | "INACTIVE" | "PENDING"

// Function argument inference with as const
function defineRoutes<const T extends Record<string, string>>(routes: T): T {
  return routes;
}

const routes = defineRoutes({
  home: "/",
  about: "/about",
});
// type: { home: "/"; about: "/about" } — literals preserved without as const!
// The `const` generic modifier (TS 5.0+) triggers as-const inference on arguments
```

---

## 9. Type Inference Helpers

```typescript
// typeof — extract type from a value
const defaultConfig = { port: 3000, host: "localhost" };
type Config = typeof defaultConfig; // { port: number; host: string }

// ReturnType — extract function return type
function createUser() {
  return { id: "1", name: "Alice" };
}
type User = ReturnType<typeof createUser>; // { id: string; name: string }

// Parameters — extract function parameter types
function greet(name: string, age: number) {}
type GreetParams = Parameters<typeof greet>; // [string, number]

// InstanceType
class UserService {
  name = "UserService";
}
type Instance = InstanceType<typeof UserService>; // UserService

// Awaited — unwrap Promise
type Data = Awaited<Promise<Promise<string>>>; // string

// Infer from array
const fruits = ["apple", "banana", "cherry"] as const;
type Fruit = (typeof fruits)[number]; // "apple" | "banana" | "cherry"
```

---

## 10. Best Practices

- **Let TS infer** when the type is obvious — don't annotate `const x: number = 5`
- **Annotate function parameters** — TS can never infer them
- **Annotate return types** for public/exported functions — prevents accidental changes
- **Use `as const`** for literal arrays and objects that define types
- **Use `satisfies`** to validate without widening — best of both worlds
- **Annotate empty collections** — `const arr: string[] = []` (TS can't infer from nothing)
- **Don't fight inference** — if TS infers the right type, don't annotate
- **Use `typeof`** to derive types from values — keeps types in sync with runtime
- **Watch for `any` leaks** — `JSON.parse`, `fetch.json()` return `any`
- **Use `const` generics** (TS 5.0+) to infer literal types from function arguments
