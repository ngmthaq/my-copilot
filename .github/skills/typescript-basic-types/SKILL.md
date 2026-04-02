---
name: typescript-basic-types
description: "TypeScript basic types — primitives, arrays, tuples, enums, any/unknown/never/void, type annotations, type assertions, literal types, and union/intersection types. Use when: annotating variables and functions; choosing between type options; understanding TS type basics. DO NOT USE FOR: advanced types like mapped/conditional (use typescript-advanced-types); generics (use typescript-generics)."
---

# TypeScript Basic Types

## 1. Primitive Types

```typescript
const name: string = "Alice";
const age: number = 30;
const active: boolean = true;
const id: bigint = 100n;
const key: symbol = Symbol("key");

// null and undefined
let value: null = null;
let undef: undefined = undefined;

// Type inference — TS infers from assignment (prefer this)
const inferred = "hello"; // type: "hello" (literal with const)
let flexible = "hello"; // type: string (widened with let)
```

---

## 2. Arrays & Tuples

```typescript
// Arrays
const nums: number[] = [1, 2, 3];
const strs: Array<string> = ["a", "b"];

// Readonly arrays
const ids: readonly number[] = [1, 2, 3];
ids.push(4); // Error: Property 'push' does not exist on readonly

// Tuples — fixed-length, typed per position
const pair: [string, number] = ["age", 30];
const [label, val] = pair; // label: string, val: number

// Named tuples
type Point = [x: number, y: number, z?: number];

// Rest in tuples
type StringAndNums = [string, ...number[]];
const data: StringAndNums = ["scores", 90, 85, 95];
```

---

## 3. Enums

```typescript
// Numeric enum (auto-increments)
enum Direction {
  Up, // 0
  Down, // 1
  Left, // 2
  Right, // 3
}

// String enum (preferred)
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING",
}

// const enum — inlined at compile time
const enum Color {
  Red = "#ff0000",
  Green = "#00ff00",
}

// ✅ Prefer union literals over enums
type StatusType = "active" | "inactive" | "pending";
```

---

## 4. Special Types

```typescript
// any — disables type checking (avoid)
let risky: any = "hello";
risky.nonExistent(); // No error — defeats TS purpose

// unknown — type-safe any (prefer over any)
let safe: unknown = "hello";
safe.toUpperCase(); // Error
if (typeof safe === "string") {
  safe.toUpperCase(); // OK — narrowed
}

// void — function returns nothing
function log(msg: string): void {
  console.log(msg);
}

// never — function never returns
function fail(msg: string): never {
  throw new Error(msg);
}

// never for exhaustive checks
type Shape = "circle" | "square";
function area(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI;
    case "square":
      return 1;
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

---

## 5. Union & Intersection Types

```typescript
// Union — ONE of the types
type StringOrNumber = string | number;
function format(value: StringOrNumber): string {
  if (typeof value === "string") return value.toUpperCase();
  return value.toFixed(2);
}

// Discriminated union
type Result =
  | { status: "success"; data: string }
  | { status: "error"; message: string };

function handle(r: Result) {
  if (r.status === "success") {
    console.log(r.data); // TS knows data exists
  } else {
    console.log(r.message); // TS knows message exists
  }
}

// Intersection — ALL properties combined
type Timestamped = { createdAt: Date; updatedAt: Date };
type Identifiable = { id: string };
type Entity = Timestamped & Identifiable;
```

---

## 6. Literal Types

```typescript
type Theme = "light" | "dark" | "system";
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

// Template literal types
type EventName = `${"user" | "order"}:${"created" | "deleted"}`;
// "user:created" | "user:deleted" | "order:created" | "order:deleted"

// as const — narrowest type
const config = { port: 3000, host: "localhost" } as const;
// type: { readonly port: 3000; readonly host: "localhost" }
```

---

## 7. Type Assertions

```typescript
// as syntax (preferred)
const el = document.getElementById("app") as HTMLDivElement;

// Non-null assertion (!)
const el2 = document.getElementById("app")!;
// ⚠️ Use sparingly — you're overriding TS

// const assertion
const routes = ["home", "about", "contact"] as const;
// type: readonly ["home", "about", "contact"]

// satisfies — validate without widening
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
} satisfies Record<string, string | number[]>;
// palette.red is still number[] (not string | number[])
```

---

## 8. Function Types

```typescript
// Annotations
function add(a: number, b: number): number {
  return a + b;
}

// Optional and default
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}`;
}

// Rest parameters
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// Function type expression
type Predicate<T> = (item: T) => boolean;
const isActive: Predicate<User> = (user) => user.active;

// Overloads
function parse(input: string): number;
function parse(input: number): string;
function parse(input: string | number): string | number {
  return typeof input === "string" ? Number(input) : String(input);
}
```

---

## 9. Object Types

```typescript
// Inline
function printUser(user: { name: string; age: number }): void {
  console.log(`${user.name}, ${user.age}`);
}

// Optional properties
type Config = {
  host: string;
  port: number;
  ssl?: boolean;
};

// Readonly
type Immutable = {
  readonly id: string;
  readonly name: string;
};

// Index signatures
type Dictionary = { [key: string]: number };

// Record shorthand
type UserRoles = Record<string, "admin" | "user" | "guest">;
```

---

## 10. Best Practices

- **Let TS infer** when the type is obvious — don't annotate `const x: number = 5`
- **Always annotate function parameters** — TS can't infer them
- **Use `unknown` over `any`** — forces narrowing before use
- **Use `as const`** for literal objects/arrays that shouldn't widen
- **Use `satisfies`** to validate types without losing specific inference
- **Prefer union literals** over enums — `"a" | "b"` over `enum { A, B }`
- **Use discriminated unions** for state machines and result types
- **Use `never`** for exhaustive switch checks
- **Avoid non-null assertions** — use proper narrowing or optional chaining
- **Use `readonly`** for arrays/objects that shouldn't be mutated
