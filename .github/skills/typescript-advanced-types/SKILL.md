---
name: typescript-advanced-types
description: "TypeScript advanced types — conditional types, mapped types, template literal types, type narrowing, type guards, discriminated unions, infer keyword, recursive types, and branded types. Use when: building complex type-level logic; creating type-safe utilities; narrowing types at runtime. DO NOT USE FOR: basic type annotations (use typescript-basic-types); generics basics (use typescript-generics); utility types (use typescript-utility-types)."
---

# TypeScript Advanced Types

## 1. Conditional Types

```typescript
// T extends U ? X : Y
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<42>; // false

// Distributive — unions are distributed automatically
type ToArray<T> = T extends unknown ? T[] : never;
type C = ToArray<string | number>; // string[] | number[]

// Prevent distribution with [T]
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
type D = ToArrayNonDist<string | number>; // (string | number)[]

// Nested conditions
type TypeName<T> = T extends string
  ? "string"
  : T extends number
    ? "number"
    : T extends boolean
      ? "boolean"
      : T extends Function
        ? "function"
        : "object";
```

---

## 2. The `infer` Keyword

```typescript
// Extract types from patterns
type ElementOf<T> = T extends (infer E)[] ? E : never;
type F = ElementOf<string[]>; // string

// Extract promise value
type Awaited<T> = T extends Promise<infer V> ? Awaited<V> : T;
type G = Awaited<Promise<Promise<string>>>; // string

// Extract function parameters
type FirstParam<T> = T extends (first: infer P, ...args: any[]) => any
  ? P
  : never;
type H = FirstParam<(name: string, age: number) => void>; // string

// Extract from template literals
type ExtractRouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = ExtractRouteParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"
```

---

## 3. Mapped Types

```typescript
// Transform all properties
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Optional<T> = { [K in keyof T]?: T[K] };
type Nullable<T> = { [K in keyof T]: T[K] | null };

// Remap keys with `as`
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }

// Filter keys
type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type StringProps = OnlyStrings<{ name: string; age: number; email: string }>;
// { name: string; email: string }

// Transform value types
type Async<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[K];
};
```

---

## 4. Template Literal Types

```typescript
// Combine string unions
type Method = "get" | "post" | "put" | "delete";
type Route = "/users" | "/posts";
type Endpoint = `${Uppercase<Method>} ${Route}`;
// "GET /users" | "GET /posts" | "POST /users" | ... (8 combos)

// Event handler types
type EventHandler<T extends Record<string, unknown>> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (data: T[K]) => void;
};

// Built-in string manipulation
type U = Uppercase<"hello">; // "HELLO"
type L = Lowercase<"HELLO">; // "hello"
type C = Capitalize<"hello">; // "Hello"
type UC = Uncapitalize<"Hello">; // "hello"
```

---

## 5. Type Narrowing

```typescript
// typeof guard
function process(value: string | number) {
  if (typeof value === "string") {
    value.toUpperCase(); // narrowed to string
  } else {
    value.toFixed(2); // narrowed to number
  }
}

// instanceof guard
function handleError(err: Error | string) {
  if (err instanceof Error) {
    console.log(err.stack); // narrowed to Error
  }
}

// in operator
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // narrowed to Fish
  }
}

// Equality narrowing
function compare(a: string | number, b: string | boolean) {
  if (a === b) {
    a.toUpperCase(); // narrowed to string (only common type)
  }
}
```

---

## 6. Custom Type Guards

```typescript
// Type predicate — return type is `x is Type`
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "email" in obj
  );
}

// Assertion function — asserts or throws
function assertDefined<T>(
  value: T | null | undefined,
  msg?: string,
): asserts value is T {
  if (value == null) throw new Error(msg ?? "Value is null/undefined");
}

const user = getUser(id);
assertDefined(user, "User not found");
user.name; // TS knows user is non-null after assertion
```

---

## 7. Discriminated Unions

```typescript
// Tag each variant with a literal field
type Result<T> = { ok: true; data: T } | { ok: false; error: Error };

function handle<T>(result: Result<T>) {
  if (result.ok) {
    console.log(result.data);
  } else {
    console.error(result.error);
  }
}

// State machine
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function render(state: RequestState<User[]>) {
  switch (state.status) {
    case "idle":
      return "Ready";
    case "loading":
      return "Loading...";
    case "success":
      return state.data.map((u) => u.name).join(", ");
    case "error":
      return `Error: ${state.error.message}`;
  }
}

// Exhaustive check
function exhaustive(value: never): never {
  throw new Error(`Unhandled case: ${value}`);
}
```

---

## 8. Recursive Types

```typescript
// JSON type
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// Deep readonly
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Deep partial
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// Nested path type
type Path<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${Prefix}${K}` | Path<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

type UserPaths = Path<{ name: string; address: { city: string; zip: string } }>;
// "name" | "address" | "address.city" | "address.zip"
```

---

## 9. Branded / Opaque Types

```typescript
// Prevent mixing structurally identical types
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;

function UserId(id: string): UserId {
  if (!id.startsWith("usr_")) throw new Error("Invalid UserId");
  return id as UserId;
}

function getUser(id: UserId): User {
  /* ... */
}
function getPost(id: PostId): Post {
  /* ... */
}

const userId = UserId("usr_123");
getUser(userId); // ✓
getUser("usr_123"); // Error: string is not assignable to UserId
```

---

## 10. Variance

```typescript
// Covariant (out) — subtypes preserved
type Producer<out T> = () => T;

// Contravariant (in) — subtypes reversed
type Consumer<in T> = (value: T) => void;

// Invariant — neither
type Processor<in out T> = (value: T) => T;
```

---

## 11. Best Practices

- **Use discriminated unions** over class hierarchies for data variants
- **Use `infer`** to extract types from complex structures
- **Use branded types** to prevent mixing structurally identical IDs
- **Use mapped types with `as`** to filter or rename keys
- **Write custom type guards** for runtime narrowing of `unknown`
- **Use assertion functions** for invariant checks that narrow types
- **Use `never`** for exhaustive switch checks
- **Limit recursive type depth** — TS has a recursion limit (~50 levels)
- **Use `satisfies`** to validate types without losing inference
- **Prefer conditional types** over runtime `typeof` chains for type-level logic
