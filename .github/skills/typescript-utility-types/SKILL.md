---
name: typescript-utility-types
description: "TypeScript utility types — Partial, Required, Pick, Omit, Record, Readonly, ReturnType, Parameters, Extract, Exclude, NonNullable, Awaited, and custom utility types. Use when: transforming existing types; building DTOs from models; creating type-safe helpers. DO NOT USE FOR: basic type syntax (use typescript-basic-types); conditional/mapped type internals (use typescript-advanced-types)."
---

# TypeScript Utility Types

## 1. Property Modifiers

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
}

// Partial<T> — all properties optional
type UpdateUser = Partial<User>;
// { id?: string; name?: string; email?: string; ... }

// Required<T> — all properties required
type StrictConfig = Required<Config>;
// Removes all ? modifiers

// Readonly<T> — all properties readonly
type FrozenUser = Readonly<User>;
// { readonly id: string; readonly name: string; ... }
```

---

## 2. Property Selection

```typescript
// Pick<T, K> — select specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: string; name: string }

// Omit<T, K> — exclude specific properties
type CreateUserInput = Omit<User, "id" | "createdAt">;
// { name: string; email: string; role: "admin" | "user" }

// Common patterns
type UpdateUserDto = Partial<Omit<User, "id" | "createdAt">>;
type PublicUser = Omit<User, "email">;
type UserCredentials = Pick<User, "email"> & { password: string };
```

---

## 3. Record

```typescript
// Record<K, V> — object with keys K and values V
type UserMap = Record<string, User>;
// { [key: string]: User }

type RolePermissions = Record<"admin" | "user" | "guest", string[]>;
// { admin: string[]; user: string[]; guest: string[] }

// Typed dictionaries
type StatusColors = Record<Status, string>;
const colors: StatusColors = {
  active: "#00ff00",
  inactive: "#ff0000",
  pending: "#ffff00",
}; // All statuses must be present

// Record with computed keys
type HttpMethods = Record<"GET" | "POST" | "PUT" | "DELETE", Handler>;
```

---

## 4. Union Manipulation

```typescript
// Exclude<T, U> — remove types from union
type T = "a" | "b" | "c" | "d";
type WithoutAB = Exclude<T, "a" | "b">; // "c" | "d"

// Extract<T, U> — keep only matching types
type OnlyAB = Extract<T, "a" | "b">; // "a" | "b"

// Extract from mixed unions
type Primitives = Extract<string | number | boolean | object, string | number>;
// string | number

// NonNullable<T> — remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

// Practical use
type EditableFields = Exclude<keyof User, "id" | "createdAt">;
// "name" | "email" | "role"

type EditableUser = Pick<User, EditableFields>;
// { name: string; email: string; role: ... }
```

---

## 5. Function Utilities

```typescript
// ReturnType<T> — extract return type
function createUser() {
  return { id: "1", name: "Alice", email: "alice@test.com" };
}
type User = ReturnType<typeof createUser>;
// { id: string; name: string; email: string }

// Parameters<T> — extract parameter types as tuple
function greet(name: string, age: number): string {
  /* ... */
}
type GreetParams = Parameters<typeof greet>; // [string, number]

// ConstructorParameters<T>
class UserService {
  constructor(
    private repo: UserRepository,
    private logger: Logger,
  ) {}
}
type ServiceDeps = ConstructorParameters<typeof UserService>;
// [UserRepository, Logger]

// InstanceType<T>
type ServiceInstance = InstanceType<typeof UserService>; // UserService

// ThisParameterType / OmitThisParameter
function handler(this: HTMLElement, event: Event) {}
type Ctx = ThisParameterType<typeof handler>; // HTMLElement
type CleanHandler = OmitThisParameter<typeof handler>; // (event: Event) => void
```

---

## 6. Awaited & Promise Utilities

```typescript
// Awaited<T> — unwrap Promise (recursive)
type A = Awaited<Promise<string>>; // string
type B = Awaited<Promise<Promise<number>>>; // number
type C = Awaited<string | Promise<boolean>>; // string | boolean

// Practical: extract resolved type from async functions
async function fetchUsers(): Promise<User[]> {
  /* ... */
}
type Users = Awaited<ReturnType<typeof fetchUsers>>; // User[]
```

---

## 7. String Utilities

```typescript
// Uppercase<T> / Lowercase<T>
type Upper = Uppercase<"hello">; // "HELLO"
type Lower = Lowercase<"HELLO">; // "hello"

// Capitalize<T> / Uncapitalize<T>
type Cap = Capitalize<"hello">; // "Hello"
type Uncap = Uncapitalize<"Hello">; // "hello"

// Combined with template literals
type EventName = "click" | "scroll" | "resize";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onScroll" | "onResize"

type GetterName<T extends string> = `get${Capitalize<T>}`;
type SetterName<T extends string> = `set${Capitalize<T>}`;
```

---

## 8. Custom Utility Types

```typescript
// Make specific keys optional
type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type CreateUser = OptionalKeys<User, "id" | "createdAt">;
// id and createdAt are optional, rest required

// Make specific keys required
type RequireKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
type UserWithEmail = RequireKeys<Partial<User>, "email">;
// email is required, rest optional

// Deep partial
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// Deep readonly
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Nullable all properties
type Nullable<T> = { [K in keyof T]: T[K] | null };

// Mutable (remove readonly)
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// Value types of an object
type ValueOf<T> = T[keyof T];
type UserValues = ValueOf<User>; // string | "admin" | "user" | Date

// Keys of type
type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
type StringKeys = KeysOfType<User, string>; // "id" | "name" | "email"
```

---

## 9. Combining Utilities (Real Patterns)

```typescript
// API response wrapper
type ApiResponse<T> = {
  data: T;
  meta: { total: number; page: number };
};

type PaginatedUsers = ApiResponse<Pick<User, "id" | "name">[]>;

// DTO patterns
type CreateDto<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
type UpdateDto<T> = Partial<CreateDto<T>>;

type CreateUserDto = CreateDto<User>;
type UpdateUserDto = UpdateDto<User>;

// Form state from model
type FormFields<T> = {
  [K in keyof T]: {
    value: T[K];
    error?: string;
    touched: boolean;
  };
};
type UserForm = FormFields<Pick<User, "name" | "email">>;

// Typed fetch wrapper
async function typedFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

const users = await typedFetch<User[]>("/api/users");

// Event handler map
type HandlerMap<Events extends Record<string, unknown>> = {
  [K in keyof Events as `on${Capitalize<string & K>}`]?: (
    data: Events[K],
  ) => void;
};

type AppHandlers = HandlerMap<{
  click: MouseEvent;
  submit: FormData;
  error: Error;
}>;
// { onClick?: (data: MouseEvent) => void; onSubmit?: ...; onError?: ... }
```

---

## 10. Quick Reference

| Utility          | Effect                | Example                       |
| ---------------- | --------------------- | ----------------------------- |
| `Partial<T>`     | All optional          | `Partial<User>`               |
| `Required<T>`    | All required          | `Required<Config>`            |
| `Readonly<T>`    | All readonly          | `Readonly<User>`              |
| `Pick<T, K>`     | Select keys           | `Pick<User, "id" \| "name">`  |
| `Omit<T, K>`     | Remove keys           | `Omit<User, "password">`      |
| `Record<K, V>`   | Object type           | `Record<string, User>`        |
| `Exclude<T, U>`  | Remove from union     | `Exclude<Status, "deleted">`  |
| `Extract<T, U>`  | Keep from union       | `Extract<T, string>`          |
| `NonNullable<T>` | Remove null/undefined | `NonNullable<string \| null>` |
| `ReturnType<T>`  | Function return type  | `ReturnType<typeof fn>`       |
| `Parameters<T>`  | Function param tuple  | `Parameters<typeof fn>`       |
| `Awaited<T>`     | Unwrap Promise        | `Awaited<Promise<string>>`    |
| `Uppercase<T>`   | String to upper       | `Uppercase<"hello">`          |
| `Capitalize<T>`  | First char upper      | `Capitalize<"hello">`         |

---

## 11. Best Practices

- **Use `Omit` + `Partial`** for update DTOs — `Partial<Omit<T, "id">>`
- **Use `Pick`** for API responses — only expose needed fields
- **Use `Record`** for typed dictionaries — `Record<Status, Color>`
- **Use `Extract`/`Exclude`** to manipulate union types
- **Use `ReturnType`** with `typeof` to derive types from functions
- **Use `Awaited`** to unwrap async return types
- **Build custom utilities** for repeated patterns (DeepPartial, OptionalKeys)
- **Combine utilities** — they're designed to compose
- **Use `satisfies`** with `Record` to validate while keeping literal types
- **Prefer utility types** over manual type definitions — they stay in sync
