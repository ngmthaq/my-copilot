---
name: typescript-interfaces-vs-types
description: "TypeScript interfaces vs type aliases — declaration merging, extending vs intersection, performance differences, when to use each, and migration patterns. Use when: choosing between interface and type; understanding declaration merging; designing public APIs. DO NOT USE FOR: basic types (use typescript-basic-types); advanced type manipulation (use typescript-advanced-types)."
---

# TypeScript Interfaces vs Type Aliases

## 1. Syntax Comparison

```typescript
// Interface — describes object shape
interface User {
  id: string;
  name: string;
  email: string;
}

// Type alias — names any type
type User = {
  id: string;
  name: string;
  email: string;
};

// For object shapes, both work identically
const user: User = { id: "1", name: "Alice", email: "alice@test.com" };
```

---

## 2. What Only Types Can Do

```typescript
// Primitives
type ID = string;
type Port = number;

// Union types
type Status = "active" | "inactive" | "pending";
type StringOrNumber = string | number;

// Intersection types
type Admin = User & { permissions: string[] };

// Tuple types
type Pair = [string, number];
type RGB = [number, number, number];

// Mapped types
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// Conditional types
type IsString<T> = T extends string ? true : false;

// Template literal types
type EventName = `on${Capitalize<string>}`;

// Extract from typeof
const config = { port: 3000, host: "localhost" } as const;
type Config = typeof config;

// Utility compositions
type CreateUserInput = Omit<User, "id" | "createdAt">;
type UserUpdate = Partial<Pick<User, "name" | "email">>;
```

---

## 3. What Only Interfaces Can Do

```typescript
// Declaration merging — interfaces with same name merge
interface Window {
  myCustomProp: string;
}
// Merges with the built-in Window interface

interface User {
  id: string;
  name: string;
}

interface User {
  email: string; // Merged into User
}

// Result: User = { id: string; name: string; email: string }

// This is useful for:
// - Augmenting third-party types
// - Module augmentation
// - Extending global types

// Module augmentation example
declare module "express" {
  interface Request {
    user?: { id: string; role: string };
  }
}
```

---

## 4. Extending / Combining

```typescript
// Interface extends interface
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// Interface extends multiple interfaces
interface Pet extends Animal, Identifiable {
  owner: string;
}

// Interface extends type
type Timestamped = { createdAt: Date; updatedAt: Date };
interface Post extends Timestamped {
  title: string;
  content: string;
}

// Type intersection (equivalent of extends)
type Dog = Animal & { breed: string };
type Pet = Animal & Identifiable & { owner: string };

// Type extends type (conditional)
type IsAnimal<T> = T extends Animal ? true : false;
```

### Key Difference: Error Messages

```typescript
// Interface extends — TS checks compatibility eagerly, clearer errors
interface Dog extends Animal {
  name: number; // Error: Type 'number' is not assignable to type 'string'
}

// Type intersection — silently creates `never` for conflicts
type Dog = Animal & { name: number };
// Dog["name"] is string & number = never (no error, just unusable)
```

---

## 5. implements

```typescript
// Classes can implement both interfaces and types
interface Serializable {
  toJSON(): string;
}

type Loggable = {
  log(message: string): void;
};

// Both work with implements
class User implements Serializable, Loggable {
  toJSON(): string {
    return JSON.stringify(this);
  }
  log(message: string): void {
    console.log(message);
  }
}

// Cannot implement union or intersection types
type Mixed = Serializable | Loggable;
class Foo implements Mixed {} // Error
```

---

## 6. Performance

```typescript
// Interface — cached by name, faster for large codebases
interface LargeInterface {
  // Properties...
}

// Type intersection — re-evaluated each time, can be slower
type LargeType = TypeA & TypeB & TypeC & TypeD;

// For simple object shapes: negligible difference
// For complex intersections of many types: interfaces may be faster
// TypeScript team recommends interfaces for public API surfaces
```

---

## 7. When to Use Each

### Use `interface` when:

```typescript
// 1. Defining object shapes (especially public APIs)
interface UserService {
  findById(id: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
}

// 2. You need declaration merging
interface Request {
  user?: AuthUser;
}

// 3. Classes will implement it
interface Repository<T> {
  findById(id: string): Promise<T | null>;
}

// 4. Library/package public types
export interface PluginOptions {
  name: string;
  version: string;
}
```

### Use `type` when:

```typescript
// 1. Unions
type Status = "active" | "inactive" | "pending";
type Result<T> = { ok: true; data: T } | { ok: false; error: Error };

// 2. Primitives, tuples, mapped types
type ID = string;
type Point = [number, number];
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// 3. Utility type compositions
type CreateInput = Omit<User, "id" | "createdAt">;
type UpdateInput = Partial<CreateInput>;

// 4. Conditional types
type IsArray<T> = T extends any[] ? true : false;

// 5. Function types
type Handler = (req: Request, res: Response) => void;
type Predicate<T> = (item: T) => boolean;
```

---

## 8. Conversion Between Them

```typescript
// Interface to type — straightforward
interface User {
  id: string;
  name: string;
}
type UserType = User; // Works directly

// Type to interface — only for object types
type UserShape = { id: string; name: string };
interface UserInterface extends UserShape {} // Works

// Cannot convert non-object types to interface
type Status = "active" | "inactive";
// interface StatusInterface extends Status {} // Error
```

---

## 9. Quick Reference

| Feature                  | `interface`     | `type`           |
| ------------------------ | --------------- | ---------------- |
| Object shapes            | ✅              | ✅               |
| Extends/inheritance      | `extends`       | `&` intersection |
| Declaration merging      | ✅              | ❌               |
| Union types              | ❌              | ✅               |
| Primitive aliases        | ❌              | ✅               |
| Tuple types              | ❌              | ✅               |
| Mapped types             | ❌              | ✅               |
| Conditional types        | ❌              | ✅               |
| `implements`             | ✅              | ✅ (object only) |
| Computed properties      | ❌              | ✅               |
| Performance (large APIs) | Slightly better | —                |
| Error messages           | Clearer         | Can be opaque    |

---

## 10. Best Practices

- **Use `interface` for object shapes** that others will implement or extend
- **Use `type` for everything else** — unions, tuples, mapped types, utilities
- **Be consistent** within a project — pick a default and stick with it
- **Use `interface` for public library APIs** — consumers can extend via declaration merging
- **Use `type` for internal types** — unions and utilities are more expressive
- **Don't use `I` prefix** on interfaces — `UserService`, not `IUserService`
- **Prefer `type` for React props** — unions and intersections are common
- **Use `interface` for contracts** — Repository, Service, Strategy patterns
- **Watch for intersection `never`** — type intersections silently produce `never` on conflicts
- **Use `extends` over `&`** when you want clear error messages on incompatibility
